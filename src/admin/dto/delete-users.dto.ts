import { IsArray, IsUUID } from "class-validator";

export class DeleteUsersDto {
  @IsArray()
  @IsUUID('all', { each: true })
  ids: string[];
}