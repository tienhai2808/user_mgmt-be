import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateAdminRootDto } from './dto/create-root-admin.dto';
import { hashPassword } from '../auth/utils/password.util';
import { Profile } from '../profiles/entities/profile.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly configService: ConfigService,
  ) {}

  async createRoot(createRootAdminDto: CreateAdminRootDto):Promise<void> {
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
    return { users }
  }
}
