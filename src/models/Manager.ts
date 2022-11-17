import { Model, PopulatedDoc, Schema, model } from 'mongoose';

import { BaseModel } from '../db';
import { ICompany } from './Company';
import constants from '../utils/constants';

const { COMPANY, MANAGER } = constants.mongooseModels;

export interface IManager extends BaseModel {
  name: string;
  company: PopulatedDoc<ICompany>;
  email: string;
  password: string;
}

const managerSchema: Schema = new Schema<IManager>(
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
    company: {
      type: Schema.Types.ObjectId,
      ref: COMPANY,
      required: true,
    },
  },
  { timestamps: true }
);

export const Manager: Model<IManager> = model<IManager>(MANAGER, managerSchema);
