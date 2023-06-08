import { Schema } from "mongoose";

export default function convertIdFromMongoose(schema: Schema): Schema {
    schema.method('toJSON', function () {
        const object = this.toObject();

        object.id = object._id;
        delete object._id;

        return object;
    });

    return schema
}