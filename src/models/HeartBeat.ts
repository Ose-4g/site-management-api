import { Model, PopulatedDoc, Schema, model } from 'mongoose';

import { BaseModel } from '../db';
import { IDevice } from './Device';
import { ISite } from './Site';
import constants from '../utils/constants';

const { DEVICE, SITE, HEARTBEAT } = constants.mongooseModels;

export interface IHeartBeat<T> extends BaseModel {
  site: PopulatedDoc<ISite>;
  device: PopulatedDoc<IDevice<any>>;
  metadata: T;
}

const heartBeatSchema = new Schema<IHeartBeat<any>>(
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

export const HeartBeat: Model<IHeartBeat<any>> = model<IHeartBeat<any>>(HEARTBEAT, heartBeatSchema);
