import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class SigninDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
