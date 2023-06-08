import { Inject, Injectable, Scope } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./entities/user.schema";
import { Model, Types } from "mongoose";
import { CreateUserDTO } from "./dto/create-user.dto";
import { UpdateUserDTO } from "./dto/update-user.dto";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";
import { Request } from "express";
import { REQUEST } from "@nestjs/core";
import { UserWithLicensePlate } from "./dto/user-with-license-plate-dto";

@Injectable({ scope: Scope.REQUEST })
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private httpService: HttpService,
        @Inject(REQUEST) private readonly request: Request
    ) { }

    private async getAssignedTransportation(driverId: string) {
        const token = this.request.headers.authorization;
        const transportationUrl = process.env.TRANSPORTATION_URL;

        const transportation =
            await lastValueFrom(
                this.httpService.get(
                    `${transportationUrl}/transportation/find-by-driver/${driverId}`,
                    {
                        headers: {
                            Authorization: token,
                        }
                    }
                )
            )
                .then((value) => value.data.data)
                .catch((err) => {
                    console.log('================= ERROR =================')
                    console.log(err)
                    return undefined
                });

        return transportation;
    }

    private async getUserWithPlate(user: User, id: string): Promise<UserWithLicensePlate> {
        const transportation = await this.getAssignedTransportation(id);

        const licensePlate = transportation ? transportation.licensePlate : undefined;

        let result: User = JSON.parse(JSON.stringify(user));

        return {
            ...result,
            licensePlate
        }
    }

    async findAll(): Promise<UserWithLicensePlate[]> {
        const results = await this
            .userModel
            .find(
                {},
                { password: false },
                {}
            )
            .exec()
        // .then(
        //     (e) => e.map<Promise<UserWithLicensePlate>>(user => this.getUserWithPlate(user, user.id))
        // )

        // return Promise.all(results);

        return results;
    }

    async findById(id: string): Promise<User | undefined> {
        const user = await this.userModel.findById(new Types.ObjectId(id), {
            password: false,
        }).exec();

        // return this.getUserWithPlate(user, user.id);

        return user;
    }

    async findByEmail(email: string): Promise<User | undefined> {
        const user = await this.userModel.findOne({
            email: email,
        }, { password: false }, {}).orFail()

        // return await this.getUserWithPlate(user, user.id);

        return user;
    }

    async findByUsername(username: string): Promise<User | undefined> {
        const user = await this.userModel.findOne({
            username: username
        }, { password: false }, {}).orFail()

        // return await this.getUserWithPlate(user, user.id);
        return user;
    }

    async createUser(createUserDTO: CreateUserDTO): Promise<User> {
        const createdUser = (await this.userModel.create(createUserDTO));
        return createdUser;
    }

    async updateUser(id: string, updateUserDTO: UpdateUserDTO): Promise<User | undefined> {
        const objectId = new Types.ObjectId(id);
        const result = await this.userModel.findByIdAndUpdate(objectId, {
            $set: { ...updateUserDTO },
        }, {
            returnOriginal: false,
            projection: { password: false }
        }).orFail()

        return result;
    }
}