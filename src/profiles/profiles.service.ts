import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { ImageKitService } from '../imagekit/imagekit.service';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly imageKitService: ImageKitService,
  ) {}
  async update(
    currentUserId: string,
    userId: string,
    updateProfileDto: UpdateProfileDto,
    file?: Express.Multer.File,
  ): Promise<{ user: User }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException(
        'Không tìm thấy người dùng',
        HttpStatus.NOT_FOUND,
      );
    }

    if (currentUserId !== userId) {
      throw new HttpException(
        'Không có quyền thay đổi',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const profile = user.profile;
    let avatarUrl: string | undefined;
    if (file?.buffer) {
      avatarUrl = await this.imageKitService.uploadImageFile(file.buffer, `avt-${user.id}`);
    }

    const updatedProfile = this.profileRepository.merge(profile, {
      ...updateProfileDto,
      ...(avatarUrl && { avatarUrl }),
    });

    await this.profileRepository.save(updatedProfile);

    return { user };
  }
}
