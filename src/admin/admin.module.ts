import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { ConfigModule } from '@nestjs/config';
import { ImageKitService } from 'src/imagekit/imagekit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile]),
    ConfigModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, ImageKitService],
})
export class AdminModule {}
