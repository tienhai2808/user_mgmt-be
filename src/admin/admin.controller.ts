import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { multerOptions } from 'src/config/multer.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUsersDto } from './dto/delete-users.dto';

@Roles('admin')
@Controller('admin')
@UseGuards(AccessTokenGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('/dashboard')
  getAdminDashboard() {
    return { message: 'Ahihi' };
  }

  @Get('/users')
  async getAllUser() {
    try {
      return await this.adminService.getAllUser();
    } catch (err) {
      console.log(`Lỗi lấy thông tin người dùng: ${err}`);
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(
        'Lỗi máy chủ nội bộ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: err },
      );
    }
  }

  @Post('/users')
  @UseInterceptors(FileInterceptor('avatar', multerOptions))
  async createUser(
    @UploadedFile() file: Express.Multer.File,
    @Body() createUserDto: CreateUserDto,
  ) {
    try {
      return await this.adminService.createUser(file, createUserDto);
    } catch (err) {
      console.log('Lỗi tạo mới người dùng: ', err);
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(
        'Lỗi máy chủ nội bộ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: err },
      );
    }
  }

  @Delete('/users')
  async deleteUsers(@Body() deleteUserDto: DeleteUsersDto) {
    try {
      return await this.adminService.deleteUsers(deleteUserDto);
    } catch (err) {
      console.log('Lỗi xóa người dùng: ', err);
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(
        'Lỗi máy chủ nội bộ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: err },
      );
    }
  }
}
