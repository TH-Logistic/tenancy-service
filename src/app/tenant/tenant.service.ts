import { Injectable } from "@nestjs/common";
import { Tenant } from "./entities/tenant.schema";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { CreateTenantDTO, TenantActiveDetail } from "./dto/create-tenant.dto";
import { UpdateTenantDTO } from "./dto/update-tenant.dto";
import { TenantStatus } from "./entities/tenant.status";
import { ScriptRunner, runDestroyScript, runScript } from "src/external/run-script";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";
import { getTenantPackageName } from "./entities/tenant.package";
import { promises as fsPromises } from 'fs';
import { join } from 'path';

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
                rootUser: activeTenantDetail.dbUsername,
                rootPassword: activeTenantDetail.dbPassword
            },
            (data) => {
                console.log(data.toString());
            }, async (err) => {
                console.log(err.toString());
            }).catch((res) => res).then(async (status) => {
                console.log(`Completed with status ${status}`)

                try {
                    const outputs = await fsPromises.readFile(
                        join(__dirname, `../../../temp/${objectId.toString()}/infrastructure/terraform-output.out`),
                        'utf-8',
                    );
                    const pairs = outputs.split('\n')

                    const feKey = 'fe_ip'
                    const feIPAddress = pairs
                        .filter(pair => pair.includes('='))
                        .map((pair) => {
                            const keyValue = pair.split('=')
                            let obj: any = {}
                            const key = keyValue[0].trim()
                            obj[key] = keyValue[1].trim()
                            return obj
                        })
                        .find((keyValue) => feKey in keyValue)[feKey]


                    if (status === 0) {
                        lastValueFrom(
                            this.httpService.post(this.configService.get("GATEWAY_URL") + '/mail/tenant-activated', {
                                destinationEmail: originalTenant.contactEmail,
                                name: originalTenant.name,
                                packageName: getTenantPackageName(originalTenant.package),
                                ipAddress: feIPAddress
                            })
                        )
                            .catch(res => res)
                            .then(res => console.log(res));

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
                } catch (e) {
                    console.log(e);
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

        if (originalTenant.status === TenantStatus.SUSPENDED) {
            throw new Error('Tenant is already suspended!')
        }

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
                    lastValueFrom(
                        this.httpService.post(this.configService.get("GATEWAY_URL") + '/mail/tenant-suspended', {
                            destinationEmail: originalTenant.contactEmail,
                            name: originalTenant.name,
                        })
                    )
                        .catch(res => res)
                        .then(res => console.log(res));
                }
            });

        return true;
    }
}