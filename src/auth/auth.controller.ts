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
  Res,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { VerifySignupDto } from './dto/verify-signup.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { Response, Request } from 'express';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { UpdatePasswordDto } from './dto/update-pw.dto';
import { UpdateInfoDto } from './dto/update-info';
import { ForgotPasswordDto } from './dto/forgot-pw.dto';
import { VerifyForgotPasswordDto } from './dto/verify-forgot-pw.dto';
import { ResetPasswordDto } from './dto/reset-pw.dto';
import { GetUser } from './decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

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
        { cause: err },
      );
    }
  }

  @Post('signup/verify-email')
  async verifySignup(
    @Body() verifySignupDto: VerifySignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
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
        { cause: err },
      );
    }
  }

  @Post('signin')
  async signin(
    @Body() signinDto: SigninDto,
    @Res({ passthrough: true }) res: Response,
  ) {
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
        { cause: err },
      );
    }
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  async getMe(@GetUser() user: User) {
    if (!user) {
      throw new HttpException(
        'Người dùng không hợp lệ',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user;
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh-token')
  async refreshToken(
    @GetUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      return await this.authService.refreshToken(user.id, user.role, res);
    } catch (err) {
      console.log(`Lỗi ở làm mới mã thông báo: ${err}`);
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

  @UseGuards(AccessTokenGuard)
  @Post('signout')
  async signout(@Res({ passthrough: true }) res: Response) {
    try {
      return await this.authService.signout(res);
    } catch (err) {
      console.log(`Lỗi ở đăng xuất: ${err}`);
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

  @UseGuards(AccessTokenGuard)
  @Patch('update-password')
  async updatePassword(
    @GetUser('id') userId: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    try {
      return await this.authService.updatePassword(userId, updatePasswordDto);
    } catch (err) {
      console.log(`Lỗi ở cập nhật mật khẩu: ${err}`);
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

  @UseGuards(AccessTokenGuard)
  @Patch('update-info')
  async updateInfo(
    @GetUser('id') userId: string,
    @Body() updateInfoDto: UpdateInfoDto,
  ) {
    try {
      return await this.authService.updateInfo(userId, updateInfoDto);
    } catch (err) {
      console.log(`Lỗi ở cập nhật thông tin: ${err}`);
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

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      return await this.authService.forgotPassword(forgotPasswordDto);
    } catch (err) {
      console.log(`Lỗi ở quên mật khẩu: ${err}`);
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

  @Post('verify-forgot-password')
  async verifyForgotPassword(
    @Body() verifyForgotPasswordDto: VerifyForgotPasswordDto,
  ) {
    try {
      return await this.authService.verifyForgotPassword(
        verifyForgotPasswordDto,
      );
    } catch (err) {
      console.log(`Lỗi ở xác thực OTP quên mật khẩu: ${err}`);
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

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      return await this.authService.resetPassword(resetPasswordDto, res);
    } catch (err) {
      console.log(`Lỗi ở đổi mới mật khẩu: ${err}`);
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

  @UseGuards(AccessTokenGuard)
  @Delete('delete-account')
  async deleteAccount(
    @GetUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      return await this.authService.deleteAccount(userId, res);
    } catch (err) {
      console.log(`Lỗi xóa tải khoản: ${err}`);
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
