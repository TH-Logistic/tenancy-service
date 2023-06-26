import { IsEmail, IsEnum, IsNotEmpty, IsNumberString, IsOptional, IsString, IsUrl, MinLength, isNumberString } from "class-validator";
import { TenantStatus } from "../entities/tenant.status";
import { TenantPackage } from "../entities/tenant.package";
import { OmitType } from "@nestjs/swagger";

export class TenantActiveDetail {
    @IsString()
    @IsOptional()
    domain: string;

    @IsString()
    dbName: string;

    @IsString()
    dbUsername: string;

    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    dbPassword: string;

    @IsString()
    @IsNotEmpty()
    secretKey: string;

    @IsEnum(TenantPackage)
    package: TenantPackage;
}
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