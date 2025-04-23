import {
  Controller,
  Get,
  Post,
  Req,
  Body,
  Patch,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('profiles')
@UseGuards(AccessTokenGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Patch(':id')
  update(
    @GetUser('id') currentUserId: string,
    @Param('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    try {
      return this.profilesService.update(
        currentUserId,
        userId,
        updateProfileDto,
      );
    } catch (err) {
      console.log(`Lỗi ở cập nhật hồ sơ: ${err}`);
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(
        'Lỗi máy chủ nội bộ',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
