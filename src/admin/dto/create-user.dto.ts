import { IsEmail, IsString, MinLength, IsNotEmpty, IsIn, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../../users/entities/user.entity';

export const GENDER = ['male', 'female', 'other'] as const;

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsEmail({}, { message: 'Email không hợp lệ'})
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(UserRole), { message: 'Vai trò không hợp lệ' })
  role: UserRole;

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

  @IsOptional()
  @IsString()
  bio: string | null;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
