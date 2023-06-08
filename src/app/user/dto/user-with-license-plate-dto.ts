import { User } from "../entities/user.schema";

export type UserWithLicensePlate = User & {
    licensePlate?: string;
}