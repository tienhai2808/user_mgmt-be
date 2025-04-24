import { Type } from "class-transformer";
import { IsString, IsOptional, IsIn, IsDate, MinLength } from "class-validator";
import { GENDER } from "../../auth/dto/signup.dto";
import { Optional } from "@nestjs/common";

export class UpdateProfileDto {
  @IsString()
  @Optional()
  @MinLength(3)
  username: string;

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
