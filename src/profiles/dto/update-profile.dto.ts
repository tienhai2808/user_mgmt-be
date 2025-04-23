import { Type } from "class-transformer";
import { IsString, IsOptional, IsIn, IsBase64, IsDate } from "class-validator";
import { GENDER } from "../../auth/dto/signup.dto";

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;

  @IsString()
  @IsOptional()
  @IsIn(GENDER)
  gender: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dob: Date;

  @IsString()
  @IsOptional()
  bio: string;
}
