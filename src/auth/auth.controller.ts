import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
  Request,
  Res,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { VerifySignupDto } from './dto/verify-signup.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
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

  @Post('signup/verify-email')
  async verifySignup(@Body() verifySignupDto: VerifySignupDto, @Res({ passthrough: true }) res: Response) {
    try {
      const result = await this.authService.verifySignup(verifySignupDto, res);
      return result;
    } catch (err) {
      console.log(`Lỗi ở xác thực email: ${err}`);
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
  async signin(@Body() signinDto: SigninDto, @Res({ passthrough: true }) res: Response) {
    try {
      const result = await this.authService.signin(signinDto, res);
      return result;
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


  @UseGuards(AccessTokenGuard)
  @Get('me')
  async getMe(@Request() req) {
    try {
      return await this.authService.getMe(req.user.id);
    } catch (err) {
      console.log(`Lỗi ở lấy thông tin người dùng: ${err}`);
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
