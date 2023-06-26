import { Injectable } from "@nestjs/common";
import { Tenant } from "./entities/tenant.schema";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { CreateTenantDTO, TenantActiveDetail } from "./dto/create-tenant.dto";
import { UpdateTenantDTO } from "./dto/update-tenant.dto";
import { TenantStatus } from "./entities/tenant.status";
import { ScriptRunner, runDestroyScript, runScript } from "src/external/run-script";
import { spawn } from "child_process";
import { error } from "console";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class TenantService {
    constructor(
        @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
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

    async activeTenant(id: string, activeTenantDetail: TenantActiveDetail): Promise<boolean> {
        const objectId = new Types.ObjectId(id);

        const originalTenant = await this
            .tenantModel
            .findByIdAndUpdate(objectId, {
                $set: {
                    status: TenantStatus.ACTIVE,
                    package: activeTenantDetail.package,
                }
            }, { returnOriginal: true })
            .orFail();


        const previousTenantPackage = originalTenant.package;
        const previousTenantStatus = originalTenant.status;

        runScript(
            {
                awsAccessKey: this.configService.get('AWS_ACCESS_KEY'),
                awsSecretKey: this.configService.get('AWS_SECRET_KEY'),
                awsSessionToken: this.configService.get('AWS_SESSION_TOKEN'),
                dbName: activeTenantDetail.dbName,
                dbPassword: activeTenantDetail.dbPassword,
                dbUserName: activeTenantDetail.dbUsername,
                awsRegion: 'us-east-1',
                appSecret: activeTenantDetail.secretKey,
                tenantId: objectId.toString(),
            },
            (data) => {
                console.log(data.toString());
            }, async (err) => {
                console.log(err.toString());
            }).catch((res) => res).then(async (status) => {
                console.log(`Completed with status ${status}`)
                if (status === 0) {
                    this.httpService.post(this.configService.get("MAIL_URL") + '/tenant-activated', ({
                        destinationEmail: originalTenant.contactEmail,
                        name: originalTenant.name,
                        packageName: activeTenantDetail.package
                    }));
                } else {
                    await this
                        .tenantModel
                        .findByIdAndUpdate(objectId, {
                            $set: {
                                package: previousTenantPackage,
                                status: previousTenantStatus
                            }
                        }, { returnOriginal: false })
                        .orFail();
                }
            });

        return true;
    }

    async suspendTenant(id: string): Promise<boolean> {
        const objectId = new Types.ObjectId(id);

        const originalTenant = await this
            .tenantModel
            .findByIdAndUpdate(objectId, {
                $set: {
                    status: TenantStatus.SUSPENDED,
                }
            }, { returnOriginal: true })
            .orFail();

        const previousTenantStatus = originalTenant.status;

        runDestroyScript(
            {
                awsAccessKey: this.configService.get('AWS_ACCESS_KEY'),
                awsSecretKey: this.configService.get('AWS_SECRET_KEY'),
                awsSessionToken: this.configService.get('AWS_SESSION_TOKEN'),
                tenantId: id,
            },
            (data) => {
                console.log(data.toString());
            }, async (err) => {
                console.log(err.toString());

                await this
                    .tenantModel
                    .findByIdAndUpdate(objectId, {
                        $set: {
                            status: previousTenantStatus
                        }
                    }, { returnOriginal: false })
                    .orFail();

            }).catch((res) => res).then((status) => {
                console.log(`Completed with status ${status}`)
                if (status === 0) {
                    this.httpService.post(this.configService.get("MAIL_URL") + '/tenant-suspended', ({
                        destinationEmail: originalTenant.contactEmail,
                        name: originalTenant.name,
                    }));
                }
            });

        return true;
    }
}