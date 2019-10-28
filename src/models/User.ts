import { Schema, model, Model, Document } from "mongoose";
// import { isEmail } from "validator";
import uuid from "uuid";

enum Role {
  basic = "basic",
  admin = "admin"
}

interface Address {
  city: string;
  street: string;
}

export interface IUserDocument extends Document {
  username: string;
  email: string;
  password: string;
  createdAt: string;
  _doc: IUserDocument;
  role: Role;
  addresses: Address[];
}

const addressSchema: Schema = new Schema({
  city: String,
  street: String
});

const userSchema: Schema = new Schema({
  username: {
    type: String,
    unique: true,
    required: [true, "Username must not be empty"],
    minlength: [6, "Username must be at least 6 characters long"]
  },
  email: {
    type: String,
    // validate: {
    //   validator: isEmail
    // }
    required: true,
    trim: true,
    match: /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/
  },
  role: {
    type: String,
    enum: ["basic", "admin"],
    default: "basic"
  },
  addresses: { type: [addressSchema] },
  password: String,
  createdAt: String,
  uuid: { type: String, default: uuid.v4() }
});

userSchema.index({ username: 1 });

const User: Model<IUserDocument> = model<IUserDocument>("User", userSchema);

export default User;