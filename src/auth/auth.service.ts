import { SigninDto } from './dto/signin.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { UpdateAuthDto } from './dto/update-info';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { comparePassword, hashPassword } from './utils/hash.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async signup(signupDto: SignupDto): Promise<User> {
    const { email, username, firstName, lastName, password } = signupDto;
    const existingUser = await this.userRepository.findOne({
      where: [{ email, username}],
    })
    if (existingUser) {
      throw new HttpException('Người dùng đã tồn tại', HttpStatus.BAD_REQUEST);
    }

    const hasedPassword = await hashPassword(password);
    const newUser = this.userRepository.create({
      email,
      username,
      firstName,
      lastName,
      password: hasedPassword,
    })

    return await this.userRepository.save(newUser);
  }

  async signin(signinDto: SigninDto): Promise<User> {
    const { username, password } = signinDto;
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new HttpException('Người dùng không tồn tại', HttpStatus.BAD_REQUEST);
    }

    const isCorrectPassword = await comparePassword(password, user.password);
    if (!isCorrectPassword) {
      throw new HttpException('Mật khẩu không chính xác', HttpStatus.BAD_REQUEST);
    }

    return user;
  }
}
