import { Module } from "@nestjs/common";
import { ConfigController } from "./config.controller";
import { ConfigService as AppConfigService } from "./config.service";
import { ConfigService } from "@nestjs/config";

@Module({
    controllers: [ConfigController],
    providers: [AppConfigService, ConfigService],
    imports: [ConfigModule]
})
export class ConfigModule {

}