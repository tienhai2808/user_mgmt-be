import { IsString, IsNotEmpty, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class VerifyForgotPasswordDto {
  @IsString()
  @IsNotEmpty()
  forgotPasswordToken: string;

  @Type(() => String)
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
}
