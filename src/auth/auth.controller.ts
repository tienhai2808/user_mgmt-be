import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async create(@Body() signupDto: SignupDto) {
    try {
      return await this.authService.signup(signupDto);
    } catch (err) {
      console.log(`Lỗi ở đăng ký: ${err}`);
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(
        'Lỗi máy chủ nội bộ',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('signin')
  async signin(@Body() signinDto: SigninDto) {
    try {
      return await this.authService.signin(signinDto);
    } catch (err) {
      console.log(`Lỗi ở đăng nhập: ${err}`);
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
