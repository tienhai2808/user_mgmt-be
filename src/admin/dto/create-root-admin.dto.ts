import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class CreateAdminRootDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsEmail({}, { message: 'Email không hợp lệ'})
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
