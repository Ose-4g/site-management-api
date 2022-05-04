import { IUser } from './User';
import { IFundRaiser } from './FundRaiser';
import { Schema, model, Model, Document, PopulatedDoc } from 'mongoose';
import { TimeStamps } from '../utils/types';

import constants from '../utils/constants';

const { USER, TRANSACTION, FUNDRAISER } = constants.mongooseModels;
const { INITIATED, FAILED, SUCCESSFUL } = constants.transactionStatus;
const { DEFAULT_DEPOSIT, FUNDRAISER_DEPOSIT, WITHDRAWAL } = constants.transactionTypes;

export interface ITransaction extends Document, TimeStamps {
  user: PopulatedDoc<IUser>;
  reference: string;
  amount: number;
  beneficiary: PopulatedDoc<IFundRaiser>;
  type: string;
  status: string;
  authorization_url?: string;
}

const transactionSchema = new Schema<ITransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: [true, 'user initiating transaction is required'],
    },
    reference: {
      type: String,
      required: [true, 'reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'amount is required '],
    },
    beneficiary: {
      type: Schema.Types.ObjectId,
      ref: FUNDRAISER,
    },
    type: {
      type: String,
      required: [true, 'type of transaction is required'],
      enum: [DEFAULT_DEPOSIT, FUNDRAISER_DEPOSIT, WITHDRAWAL],
    },
    status: {
      type: String,
      default: INITIATED,
      enum: [INITIATED, SUCCESSFUL, FAILED],
    },
    authorization_url: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Transaction = model<ITransaction>(TRANSACTION, transactionSchema);
