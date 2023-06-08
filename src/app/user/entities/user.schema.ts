import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { type } from "os";
import { UserRole } from "./role";
import { Expose } from "class-transformer";
import convertIdFromMongoose from "src/utils/convert-id-from-mongoose";
import { Gender } from "./gender";
import { UserStatus } from "./user-status";

@Schema({
    versionKey: false
})
export class User {

    @Prop({
        required: true,
    })
    name: string;

    @Prop({
        required: true,
        unique: true,
    })
    username: string;

    @Prop({
        required: true,
    })
    gender: Gender;

    @Prop({
        unique: true
    })
    email: string;

    @Prop({
        required: true
    })
    password: string;

    @Prop({
        required: true,
    })
    role: UserRole;

    @Prop({
        required: true
    })
    avatar: string;

    @Prop({
        required: true
    })
    birthday: number;

    @Prop({
        required: true,
        unique: true,
    })
    phoneNumber: string;

    @Prop({
        minlength: 8,
        unique: true,
    })
    bankAccount: string;

    @Prop()
    bankName: string;

    @Prop({
        required: true,
        default: UserStatus.NEW
    })
    status: UserStatus
}

export const UserSchema = convertIdFromMongoose(
    SchemaFactory.createForClass(User)
); 
