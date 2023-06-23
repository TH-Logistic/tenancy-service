import { IsString } from "class-validator";

export class UpdateAWSCredentialDTO {
    @IsString()
    accessKey: string;

    @IsString()
    secretKey: string;

    @IsString()
    sessionToken: string;
}