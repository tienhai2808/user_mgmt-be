import { IsString, IsNotEmpty, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class VerifySignupDto {
  @IsString()
  @IsNotEmpty()
  registrationToken: string;

  @Type(() => String)
  @IsNotEmpty()
  @Length(4, 4)
  otp: string;
}
