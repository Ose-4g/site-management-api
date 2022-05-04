import { Document, Model, model, Types, Schema, PopulatedDoc } from 'mongoose';
import validator from 'validator';
import constants from '../utils/constants';

const { USER } = constants.mongooseModels;
const { ADMIN, USER: USER_ROLE } = constants.userRoles;
export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  role: string;
  password: string;
  avatar: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  banned: boolean;
  banReason?: string;
  banExpires?: Date;
  emailVerified: boolean;
  userVerified: boolean;
  credentialsVerified: boolean;
  verifyCode?: string;
  verifyCodeExpires?: Date;
  phoneNumber: string;
  documents?: { type: string; url: string }[];
}

const userSchema: Schema = new Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "User's first name is required"],
    },
    email: {
      type: String,
      unique: true,
      validate: [validator.isEmail, 'Email is invalid'],
      required: [true, 'Email address is required'],
    },
    role: {
      type: String,
      enum: [USER_ROLE, ADMIN],
      default: USER_ROLE,
    },
    password: {
      type: String,
      select: false,
      required: [true, 'Password is required'],
    },
    avatar: {
      type: String,
      default: 'https://ui-avatars.com/api/?name=New+User',
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
    banned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
      default: null,
    },
    banExpires: {
      type: Date,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    userVerified: {
      type: Boolean,
      default: false,
    },
    verifyCode: {
      type: String,
    },
    verifyCodeExpires: {
      type: Date,
    },
    phoneNumber: {
      type: String,
    },
    credentialsVerified: {
      type: Boolean,
      default: false,
    },
    documents: [
      {
        type: new Schema<{ type: string; url: string }>({
          type: String,
          url: String,
        }),
      },
    ],
  },
  { timestamps: true }
);

export const User: Model<IUser> = model(USER, userSchema);
