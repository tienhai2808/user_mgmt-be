import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from '../users/entities/user.entity';
import { Not, Repository } from 'typeorm';
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
    if (updateProfileDto.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateProfileDto.username, id: Not(currentUserId) },
      });
      if (existingUser) {
        throw new HttpException('Username đã tồn tại', HttpStatus.BAD_REQUEST);
      }
      user.username = updateProfileDto.username;
    }

    let avatarUrl: string | undefined;
    if (file?.buffer) {
      avatarUrl = await this.imageKitService.uploadImageFile(
        file.buffer,
        `avt-${user.id}`,
      );
    }

    const updatedProfile = this.profileRepository.merge(profile, {
      ...updateProfileDto,
      ...(avatarUrl && { avatarUrl }),
    });

    user.profile = updatedProfile;

    await this.userRepository.save(user);

    return { user };
  }
}
