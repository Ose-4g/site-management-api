import { Model, Schema, model } from 'mongoose';

import { BaseModel } from '../db';
import constants from '../utils/constants';

const { COMPANY } = constants.mongooseModels;

export interface ICompany extends BaseModel {
  name: string;
  email: string;
  password: string;
}

const companySchema: Schema = new Schema<ICompany>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "User's first name is required"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Email address is required'],
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Company: Model<ICompany> = model<ICompany>(COMPANY, companySchema);
