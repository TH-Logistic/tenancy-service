import { Injectable } from "@nestjs/common";
import { Tenant } from "./entities/tenant.schema";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { CreateTenantDTO } from "./dto/create-tenant.dto";
import { UpdateTenantDTO } from "./dto/update-tenant.dto";
import { TenantStatus } from "./entities/tenant.status";
import { ScriptRunner, runScript } from "src/external/run-script";
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
        const scriptRunner = new ScriptRunner();

        scriptRunner.run("sh", ["./src/external/initialize-tenant.sh"], undefined, (data) => {
            console.log(data.toString())
        }, (err) => {
            console.log(err.toString())
        })

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
                awsSessionToken: this.configService.get('AWS_ACCESS_SESSION_TOKEN'),
                dbName: 'thlogistic',
                dbPassword: createTenantDTO.dbPassword,
                dbUserName: createTenantDTO.dbUsername,
                awsRegion: 'us-east-1',
                appSecret: createTenantDTO.secretKey,
                keyPairName: createTenantDTO.keypairName
            },
            (data) => {
                console.log(data.toString())
            }, (err) => {
                console.log(error)
                // TODO send email
            }, (status) => {
                console.log(`Completed with status ${status}`)

                this.httpService.post(this.configService.get("MAIL_URL") + '/tenant-activated', ({
                    destinationEmail: createTenantDTO.contactEmail,
                    name: createTenantDTO.name,
                    packageName: "Premium"
                }));
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

        const result = await this
            .tenantModel
            .findByIdAndUpdate(objectId, {
                $set: {
                    status: TenantStatus.SUSPENDED
                }
            }, { returnOriginal: false })
            .orFail()

        this.httpService.post(this.configService.get("MAIL_URL") + '/tenant-suspended', ({
            destinationEmail: result.contactEmail,
            name: result.name,
        }));

        return true;
    }
}