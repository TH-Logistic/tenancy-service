import { Injectable } from "@nestjs/common";
import { Tenant } from "./entities/tenant.schema";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { CreateTenantDTO } from "./dto/create-tenant.dto";
import { UpdateTenantDTO } from "./dto/update-tenant.dto";
import { TenantStatus } from "./entities/tenant.status";

@Injectable()
export class TenantService {
    constructor(
        @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
    ) {
    }

    async getTenants(): Promise<Tenant[]> {
        return this
            .tenantModel
            .find({}, {}, {})
            .exec();
    }

    async getTenantById(id: string): Promise<Tenant | undefined> {
        const tenant = await this
            .tenantModel
            .findById(new Types.ObjectId(id))
            .exec();

        return tenant;
    }

    async createTenant(createTenantDTO: CreateTenantDTO): Promise<Tenant> {
        const createdTenant = await this.tenantModel.create({
            ...createTenantDTO,
            status: TenantStatus.NEW
        });

        return createdTenant;
    }

    async updateTenant(id: string, updateTenantDTO: UpdateTenantDTO): Promise<Tenant> {
        const objectId = new Types.ObjectId(id);

        const result = await this
            .tenantModel
            .findByIdAndUpdate(objectId, {
                $set: updateTenantDTO
            }, { returnOriginal: false })
            .orFail()

        return result;
    }

    async activeTenant(id: string): Promise<boolean> {
        const objectId = new Types.ObjectId(id);

        const result = await this
            .tenantModel
            .findByIdAndUpdate(objectId, {
                $set: {
                    status: TenantStatus.ACTIVE
                }
            }, { returnOriginal: false })
            .orFail()

        return true;
    }

    async suspendTenant(id: string): Promise<boolean> {
        const objectId = new Types.ObjectId(id);

        const result = await this
            .tenantModel
            .findByIdAndUpdate(objectId, {
                $set: {
                    status: TenantStatus.SUSPENDED
                }
            }, { returnOriginal: false })
            .orFail()

        return true;
    }
}