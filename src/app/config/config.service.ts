import { Injectable } from "@nestjs/common";
import { ConfigService as OriginConfigService } from "@nestjs/config";
import { UpdateAWSCredentialDTO } from "./dto/update-aws-credential.dto";

@Injectable()
export class ConfigService {
    constructor(private readonly originConfigService: OriginConfigService) {

    }
    async updateAwsCredential(updateAwsCredentialDTO: UpdateAWSCredentialDTO) {
        process.env.AWS_ACCESS_KEY = updateAwsCredentialDTO.accessKey;
        process.env.AWS_SECRET_KEY = updateAwsCredentialDTO.secretKey;
        process.env.AWS_SESSION_TOKEN = updateAwsCredentialDTO.sessionToken;

        return true;
    }

    async getAwsCredential(): Promise<UpdateAWSCredentialDTO> {
        return ({
            accessKey: this.originConfigService.get("AWS_ACCESS_KEY"),
            secretKey: this.originConfigService.get("AWS_SECRET_KEY"),
            sessionToken: this.originConfigService.get("AWS_SESSION_TOKEN"),
        })
    }
}