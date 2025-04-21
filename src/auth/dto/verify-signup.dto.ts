import { IsString, IsNotEmpty, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class VerifySignupDto {
  @IsString()
  @IsNotEmpty()
  registrationToken: string;

  @Type(() => String)
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
}
