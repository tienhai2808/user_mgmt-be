import { IsEmail, IsString, MinLength, IsNotEmpty, IsIn, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export const GENDER = ['male', 'female', 'other'] as const;

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsEmail({}, { message: 'Không đúng định dạng email'})
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(GENDER)
  gender: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  dob: Date;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
