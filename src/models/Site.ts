import { Model, PopulatedDoc, Schema, model } from 'mongoose';

import { BaseModel } from '../db';
import { IManager } from './Manager';
import constants from '../utils/constants';

const { SITE, MANAGER } = constants.mongooseModels;

export interface ISite extends BaseModel {
  name: string;
  description?: string;
  location?: string;
  manager: PopulatedDoc<IManager>;
}

const siteSchema: Schema = new Schema<ISite>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "User's first name is required"],
    },
    description: {
      type: String,
    },
    location: {
      type: String,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: MANAGER,
      required: true,
    },
  },
  { timestamps: true }
);

export const Site: Model<ISite> = model<ISite>(SITE, siteSchema);
