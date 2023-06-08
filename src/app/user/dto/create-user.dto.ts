import { Exclude } from "class-transformer";
import { User } from "../entities/user.schema";
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsPhoneNumber, IsPositive, IsString, MinLength } from "class-validator";
import { UserRole } from "../entities/role";
import { Gender } from "../entities/gender";
import { UserStatus } from "../entities/user-status";

export class CreateUserDTO {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsEnum(UserRole)
    role: UserRole;

    @IsString()
    avatar: string;

    @IsNumber()
    @IsPositive()
    birthday: number;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsEnum(Gender)
    gender: Gender;

    @IsString()
    @IsPhoneNumber('VN')
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    bankAccount: string;

    @IsString()
    bankName: string;
}