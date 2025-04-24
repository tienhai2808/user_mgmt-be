import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { In, Repository } from 'typeorm';
import { CreateAdminRootDto } from './dto/create-root-admin.dto';
import { hashPassword } from '../auth/utils/password.util';
import { Profile } from '../profiles/entities/profile.entity';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { ImageKitService } from '../imagekit/imagekit.service';
import { DeleteUsersDto } from './dto/delete-users.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly configService: ConfigService,
    private readonly imageKitService: ImageKitService,
  ) {}

  async createRoot(createRootAdminDto: CreateAdminRootDto): Promise<void> {
    const { username, email, password } = createRootAdminDto;
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });
    if (existingUser) {
      throw new Error('Username hoặc Email đã được sử dụng');
    }

    const hashedPassword = await hashPassword(password);

    const profile = this.profileRepository.create({
      firstName: 'Root',
      lastName: 'Admin',
      avatarUrl: this.configService.get<string>(
        'IMAGEKIT_DEFAULT_AVATAR_URL',
        'https://scontent.fhan14-1.fna.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=dst-png_s200x200&_nc_cat=1&ccb=1-7&_nc_sid=136b72&_nc_eui2=AeEKjCdRBjSnxc2YKmeNCUZzWt9TLzuBU1Ba31MvO4FTUN7JCFRAp5yDTyoPhKaaXbDDUhm1qJWfSDChsEZmx2r1&_nc_ohc=mHBMWDB1Di8Q7kNvwENBYkd&_nc_oc=Adne4BNacQrdJ4keSn2jnCkHSu0tilM-hD7l-dfLsmq-Cn7ADdMDKl8GPfS7TBu77whOxqF9JIKVs0kYonFAre8u&_nc_zt=24&_nc_ht=scontent.fhan14-1.fna&oh=00_AfEhdQW2nrHelJgGXJd0k9JoveWN-FqOUHZB8pmJ07-LDw&oe=682D243A',
      ),
      gender: 'other',
      dob: new Date('2000-01-01'),
      bio: 'Administrator',
    });

    const newAdmin = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      role: UserRole.ADMIN,
      profile,
    });

    await this.userRepository.save(newAdmin);
  }

  async getAllUser(): Promise<{ users: User[] }> {
    const users = await this.userRepository.find();
    return { users };
  }

  async createUser(
    file: Express.Multer.File,
    createUserDto: CreateUserDto,
  ): Promise<{ user: User }> {
    const { username, email, role, password } = createUserDto;
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });
    if (existingUser) {
      throw new HttpException('Người dùng đã tồn tại', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await hashPassword(password);
    const newUser = this.userRepository.create({
      username,
      email,
      role,
      password: hashedPassword,
    });

    let avatarUrl = this.configService.get<string>('IMAGEKIT_DEFAULT_AVATAR_URL', 'https://scontent.fhan14-1.fna.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=dst-png_s200x200&_nc_cat=1&ccb=1-7&_nc_sid=136b72&_nc_eui2=AeEKjCdRBjSnxc2YKmeNCUZzWt9TLzuBU1Ba31MvO4FTUN7JCFRAp5yDTyoPhKaaXbDDUhm1qJWfSDChsEZmx2r1&_nc_ohc=mHBMWDB1Di8Q7kNvwENBYkd&_nc_oc=Adne4BNacQrdJ4keSn2jnCkHSu0tilM-hD7l-dfLsmq-Cn7ADdMDKl8GPfS7TBu77whOxqF9JIKVs0kYonFAre8u&_nc_zt=24&_nc_ht=scontent.fhan14-1.fna&oh=00_AfEhdQW2nrHelJgGXJd0k9JoveWN-FqOUHZB8pmJ07-LDw&oe=682D243A');
    if (file?.buffer) {
      avatarUrl = await this.imageKitService.uploadImageFile(
        file.buffer,
        `avt-${newUser.id}`,
      );
    }

    const newProfile = new Profile();
    newProfile.firstName = createUserDto.firstName,
    newProfile.lastName = createUserDto.lastName,
    newProfile.gender = createUserDto.gender,
    newProfile.dob = createUserDto.dob,
    createUserDto.bio ? newProfile.bio = createUserDto.bio : null,
    newProfile.avatarUrl = avatarUrl,

    newUser.profile = newProfile;
    await this.userRepository.save(newUser);
    return { user: newUser }
  }

  async deleteUsers(deleteUsersDto: DeleteUsersDto): Promise<{ message: string }> {
    const { ids } = deleteUsersDto;

    const users = await this.userRepository.findBy({ id: In(ids) })
    if (users.length === 0) {
      throw new HttpException('Không tìm thấy người dùng nào', HttpStatus.NOT_FOUND)
    }

    const result = await this.userRepository.delete(ids)
    return { message: `Xóa thành công ${result.affected || 0} người dùng` }
  }
}
