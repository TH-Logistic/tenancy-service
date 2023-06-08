import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Tenant, TenantSchema } from "./entities/tenant.schema";
import { TenantService } from "./tenant.service";
import { TenantController } from "./tenant.controller";

@Module({
    imports: [
        MongooseModule.forFeature(
            [
                {
                    name: Tenant.name,
                    schema: TenantSchema
                }
            ]
        )
    ],
    providers: [TenantService],
    controllers: [TenantController],
})
export class TenantModule {

}