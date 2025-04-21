import { IsString, IsNotEmpty, MinLength } from "class-validator";

export class UpdateInfoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;
}
