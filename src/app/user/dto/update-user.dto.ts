import { PartialType } from "@nestjs/swagger";
import { CreateUserDTO } from "./create-user.dto";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { UserStatus } from "../entities/user-status";
export class UpdateUserDTO extends PartialType(CreateUserDTO) {

    @IsEnum(UserStatus)
    @IsOptional()
    status?: UserStatus;
}