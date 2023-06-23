import { Injectable } from "@nestjs/common";
import { Tenant } from "./entities/tenant.schema";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { CreateTenantDTO } from "./dto/create-tenant.dto";
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

        runScript(
            {
                awsAccessKey: this.configService.get('AWS_ACCESS_KEY'),
                awsSecretKey: this.configService.get('AWS_SECRET_KEY'),
                awsSessionToken: this.configService.get('AWS_SESSION_TOKEN'),
                dbName: createTenantDTO.dbName,
                dbPassword: createTenantDTO.dbPassword,
                dbUserName: createTenantDTO.dbUsername,
                awsRegion: 'us-east-1',
                appSecret: createTenantDTO.secretKey,
                keyPairName: createTenantDTO.keypairName,
                tenantId: createdTenant.id
            },
            (data) => {
                console.log(data.toString());
            }, async (err) => {
                console.log(error.toString());
                await createdTenant.deleteOne();
            }).catch(res => {
                // TODO send email
            }).then((status) => {
                console.log(`Completed with status ${status}`)
                if (status === 0) {

                    this.httpService.post(this.configService.get("MAIL_URL") + '/tenant-activated', ({
                        destinationEmail: createTenantDTO.contactEmail,
                        name: createTenantDTO.name,
                        packageName: "Premium"
                    }));
                }
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

        this.httpService.post(this.configService.get("MAIL_URL") + '/tenant-activated', ({
            destinationEmail: result.contactEmail,
            name: result.name,
            packageName: "Premium"
        }));

        return true;
    }

    async suspendTenant(id: string): Promise<boolean> {
        const objectId = new Types.ObjectId(id);

        let tenant = await this.tenantModel.findById(objectId).orFail();
        const previousStatus = tenant.status;

        tenant = await tenant.updateOne({ $set: { status: TenantStatus.SUSPENDED } }, { returnOriginal: false });

        // const result = await this
        //     .tenantModel
        //     .findByIdAndUpdate(objectId, {
        //         $set: {
        //             status: TenantStatus.SUSPENDED
        //         }
        //     }, { returnOriginal: true })
        //     .orFail()

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
                console.log(error.toString());
                await tenant.updateOne({ $set: { status: previousStatus } });
            }).catch(res => {
                // TODO send email
            }).then((status) => {
                console.log(`Completed with status ${status}`)
                if (status === 0) {
                    this.httpService.post(this.configService.get("MAIL_URL") + '/tenant-suspended', ({
                        destinationEmail: tenant.contactEmail,
                        name: tenant.name,
                    }));
                }
            });



        return true;
    }
}