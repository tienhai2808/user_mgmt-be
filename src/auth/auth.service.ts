import { ConfigService } from '@nestjs/config';
import { SigninDto } from './dto/signin.dto';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { comparePassword, hashPassword } from './utils/password.util';
import { Profile } from '../profiles/entities/profile.entity';
import Redis from 'ioredis';
import { EmailService } from '../email/email.service';
import { generateOtp } from './utils/otp.util';
import { v4 as uuidv4 } from 'uuid';
import { VerifySignupDto } from './dto/verify-signup.dto';
import { TokensService } from './tokens.service';
import { Request, Response } from 'express';
import { setAccessTokenCookie, setRefreshTokenCookie } from './utils/jwt.util';
import { UpdatePasswordDto } from './dto/update-pw.dto';
import { UpdateInfoDto } from './dto/update-info';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly tokensService: TokensService,
  ) {}

  async signup(signupDto: SignupDto): Promise<{ registrationToken: string }> {
    const { email, username, password, firstName, lastName, dob, gender } =
      signupDto;
    const existingUser = await this.userRepository.findOne({
      where: [{ email, username }],
    });
    if (existingUser) {
      throw new HttpException('Người dùng đã tồn tại', HttpStatus.BAD_REQUEST);
    }

    const otp = generateOtp(6);
    const registrationToken = uuidv4();

    const hasedPassword = await hashPassword(password);

    const registrationData = {
      email,
      username,
      password: hasedPassword,
      firstName,
      lastName,
      dob,
      gender,
    };

    await this.redis.set(
      `registration:${registrationToken}`,
      JSON.stringify(registrationData),
      'EX',
      180,
    );
    await this.redis.set(`otp:${registrationToken}`, otp, 'EX', 180);

    await this.emailService.sendOtpEmail(email, otp);

    return { registrationToken };
  }

  async verifySignup(
    verifySignupDto: VerifySignupDto,
    res: Response,
  ): Promise<{ user: User }> {
    const { registrationToken, otp } = verifySignupDto;

    const cachedOtp = await this.redis.get(`otp:${registrationToken}`);
    if (!cachedOtp || cachedOtp !== otp) {
      throw new HttpException(
        'Mã OTP không chính xác hoặc đã hết hạn',
        HttpStatus.BAD_REQUEST,
      );
    }

    const registrationDataStr = await this.redis.get(
      `registration:${registrationToken}`,
    );
    if (!registrationDataStr) {
      throw new HttpException(
        'Phiên đăng ký đã hết hạn',
        HttpStatus.BAD_REQUEST,
      );
    }

    const registrationData = JSON.parse(registrationDataStr);
    const { email, username, password, firstName, lastName, dob, gender } =
      registrationData;
    const existingUser = await this.userRepository.findOne({
      where: [{ email, username }],
    });
    if (existingUser) {
      throw new HttpException('Người dùng đã tồn tại', HttpStatus.BAD_REQUEST);
    }

    const newUser = this.userRepository.create({
      email,
      username,
      password,
    });

    const newProfile = new Profile();
    newProfile.firstName = firstName;
    newProfile.lastName = lastName;
    newProfile.avatarUrl = this.configService.get<string>(
      'IMAGEKIT_DEFAULT_AVATAR_URL',
      'https://scontent.fhan14-1.fna.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=dst-png_s200x200&_nc_cat=1&ccb=1-7&_nc_sid=136b72&_nc_eui2=AeEKjCdRBjSnxc2YKmeNCUZzWt9TLzuBU1Ba31MvO4FTUN7JCFRAp5yDTyoPhKaaXbDDUhm1qJWfSDChsEZmx2r1&_nc_ohc=mHBMWDB1Di8Q7kNvwENBYkd&_nc_oc=Adne4BNacQrdJ4keSn2jnCkHSu0tilM-hD7l-dfLsmq-Cn7ADdMDKl8GPfS7TBu77whOxqF9JIKVs0kYonFAre8u&_nc_zt=24&_nc_ht=scontent.fhan14-1.fna&oh=00_AfEhdQW2nrHelJgGXJd0k9JoveWN-FqOUHZB8pmJ07-LDw&oe=682D243A',
    );
    newProfile.dob = dob;
    newProfile.gender = gender;

    newUser.profile = newProfile;
    const savedUser = await this.userRepository.save(newUser);

    await this.redis.del(`registration:${registrationToken}`);
    await this.redis.del(`otp:${registrationToken}`);

    const accessToken = this.tokensService.generateAccessToken(
      savedUser.id,
      savedUser.role,
    );
    const refreshToken = this.tokensService.generateRefreshToken(
      savedUser.id,
      savedUser.role,
    );
    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);

    return { user: savedUser };
  }

  async signin(signinDto: SigninDto, res: Response): Promise<{ user: User }> {
    const { username, password } = signinDto;
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new HttpException(
        'Người dùng không tồn tại',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isCorrectPassword = await comparePassword(password, user.password);
    if (!isCorrectPassword) {
      throw new HttpException(
        'Mật khẩu không chính xác',
        HttpStatus.BAD_REQUEST,
      );
    }

    const accessToken = this.tokensService.generateAccessToken(
      user.id,
      user.role,
    );
    const refreshToken = this.tokensService.generateRefreshToken(
      user.id,
      user.role,
    );
    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);

    return { user };
  }

  async refreshToken(userId: string, role: string, res: Response): Promise<void> {
    const accessToken = this.tokensService.generateAccessToken(userId, role);
    setAccessTokenCookie(res, accessToken);
  }

  async signout(res: Response): Promise<void> {
    res.clearCookie('accessToken', { httpOnly: true, secure: true });
    res.clearCookie('refreshToken', { httpOnly: true, secure: true });
  }

  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto): Promise<{ user: User }> {
    const { oldPassword, newPassword } = updatePasswordDto;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('Người dùng không tồn tại', HttpStatus.BAD_REQUEST);
    }

    const isCorrectPassword = await comparePassword(oldPassword, user.password);
    if (!isCorrectPassword) {
      throw new HttpException('Mật khẩu cũ không chính xác', HttpStatus.BAD_REQUEST);
    }
    const hashedNewPassword = await hashPassword(newPassword);
    user.password = hashedNewPassword;

    const updatedUser = await this.userRepository.save(user);
    
    return { user: updatedUser };
  }

  async updateInfo(userId: string, updateInfoDto: UpdateInfoDto): Promise<{ user: User }> {
    const { username } = updateInfoDto;
    const user = await this.userRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw new HttpException('Người dùng không tồn tại', HttpStatus.BAD_REQUEST);
    }

    const existingUser = await this.userRepository.findOne({ where: { username } });
    if (existingUser && existingUser.id !== userId) {
      throw new HttpException('Tên người dùng đã tồn tại', HttpStatus.BAD_REQUEST);
    }

    user.username = username;

    const updatedUser = await this.userRepository.save(user);
    
    return { user: updatedUser };
  }
}
