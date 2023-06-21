import { IsEmail, IsEnum, IsNotEmpty, IsNumberString, IsOptional, IsString, IsUrl, MinLength, isNumberString } from "class-validator";
import { TenantStatus } from "../entities/tenant.status";

class TenantDetail {
    @IsString()
    @IsOptional()
    domain: string;

    @IsString()
    dbName: string;

    @IsString()
    dbUsername: string;

    @IsString()
    @IsNotEmpty()
    dbPassword: string;

    @IsString()
    @IsNotEmpty()
    keypairName: string;

    @IsString()
    @IsNotEmpty()
    secretKey: string;
}
export class CreateTenantDTO extends TenantDetail {
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