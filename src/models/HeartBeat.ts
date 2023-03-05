import { Model, PopulatedDoc, Schema, model } from 'mongoose';

import { BaseModel } from '../db';
import { IDevice } from './Device';
import { ISite } from './Site';
import constants from '../utils/constants';

const { DEVICE, SITE, HEARTBEAT } = constants.mongooseModels;

export interface IHeartBeat extends BaseModel {
  site: PopulatedDoc<ISite>;
  device: PopulatedDoc<IDevice>;
  metadata: any;
}

const heartBeatSchema = new Schema<IHeartBeat>(
  {
    device: {
      type: Schema.Types.ObjectId,
      ref: DEVICE,
      required: true,
    },
    site: {
      type: Schema.Types.ObjectId,
      ref: SITE,
      required: true,
    },
    metadata: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

export const HeartBeat: Model<IHeartBeat> = model<IHeartBeat>(HEARTBEAT, heartBeatSchema);
