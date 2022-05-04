import { IUser } from './User';
import { Schema, model, Model, Document, PopulatedDoc } from 'mongoose';
import { TimeStamps } from '../utils/types';

import constants from '../utils/constants';

const { USER, FUNDRAISER } = constants.mongooseModels;
export interface IFundRaiser extends Document, TimeStamps {
  createdBy: PopulatedDoc<IUser>;
  name: string;
  description: string;
  balance: number;
  target: number;
}

const fundRaiserSchema = new Schema<IFundRaiser>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: [true, 'user initiating transaction is required'],
    },
    name: {
      type: String,
      required: [true, 'name is required'],
    },
    target: {
      type: Number,
      required: [true, 'target is required '],
    },
    balance: {
      type: Number,
      default: 0,
    },
    description: String,
  },
  { timestamps: true }
);

export const FundRaiser = model<IFundRaiser>(FUNDRAISER, fundRaiserSchema);
