import { Body, Controller, Get, Post } from "@nestjs/common";
import { UpdateAWSCredentialDTO } from "./dto/update-aws-credential.dto";
import { ConfigService } from "./config.service";

@Controller("/config")
export class ConfigController {
    constructor(private readonly configService: ConfigService) {

    }

    @Get("/aws-credential")
    async getAwsCredential() {
        return this.configService.getAwsCredential();
    }
    @Post("/aws-credential")
    async updateAwsCredential(@Body() updateAwsCredentialDTO: UpdateAWSCredentialDTO) {
        return this.configService.updateAwsCredential(updateAwsCredentialDTO);
    }
}