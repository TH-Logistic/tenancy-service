import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { TenantStatus } from "./tenant.status";
import convertIdFromMongoose from "src/utils/convert-id-from-mongoose";
import { TenantPackage } from "./tenant.package";

@Schema({
    versionKey: false
})
export class Tenant {

    @Prop({
        required: true,
        unique: true,
    })
    name: string;

    @Prop({
        required: true
    })
    ownerName: string;

    @Prop({
        required: true
    })
    address: string;

    @Prop({
        required: true
    })
    contactNumber: string;

    @Prop({
        required: true
    })
    contactEmail: string;

    @Prop({
        required: true
    })
    billingAccountName: string;

    @Prop({
        required: true,
    })
    billingAccountNumber: string;

    @Prop({
        required: true
    })
    billingBank: string;

    @Prop({
        required: true
    })

    @Prop({
        required: false,
        unique: true,
    })
    alias?: string;

    @Prop({
        required: true,
        default: () => Date.now()
    })
    createdAt?: number

    @Prop({
        required: true
    })
    logo: string;

    @Prop({
        required: true,
        enum: TenantStatus,
        default: TenantStatus.NEW
    })
    status: TenantStatus;

    @Prop({
        enum: TenantPackage,
    })
    package?: TenantPackage
}

export const TenantSchema = convertIdFromMongoose(
    SchemaFactory.createForClass(Tenant)
); 