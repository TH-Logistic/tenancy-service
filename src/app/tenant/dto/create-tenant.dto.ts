import { IsEmail, IsEnum, IsNumberString, IsOptional, IsString, IsUrl, MinLength, isNumberString } from "class-validator";
import { TenantStatus } from "../entities/tenant.status";

export class CreateTenantDTO {
    @IsString()
    name: string;

    @IsString()
    ownerName: string;

    @IsString()
    address: string;

    @IsNumberString()
    @MinLength(10)
    contactNumber: string;

    @IsEmail()
    contactEmail: string;

    @IsString()
    billingAccountName: string;

    @IsNumberString()
    billingAccountNumber: string;

    @IsString()
    billingBank: string;

    @IsOptional()
    @IsString()
    alias?: string;

    @IsString()
    logo: string;
}