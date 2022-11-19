import { model, Model, PopulatedDoc, Schema } from 'mongoose';
import { BaseModel } from '../db';
import { ISite } from './Site';
import constants from '../utils/constants';

const { DEVICE, SITE } = constants.mongooseModels;

export const deviceTypes = <const>['solar-panel', 'generator'];
export type DeviceType = typeof deviceTypes[number];

export interface GeneratorMetadata {
  MVARating: number;
}

export interface SolarPanelMetadata {
  currentRating: number;
}

export interface IDevice<T> extends BaseModel {
  type: DeviceType;
  site: PopulatedDoc<ISite>;
  maintenanceWindow: number;
  metadata: T;
}

const deviceSchema = new Schema<IDevice<any>>(
  {
    type: {
      type: String,
      required: true,
      enum: deviceTypes,
    },
    site: {
      type: Schema.Types.ObjectId,
      ref: SITE,
      required: true,
    },
    maintenanceWindow: Number,
    metadata: {
      type: Object,
    },
  },
  { timestamps: true }
);

export const Device: Model<IDevice<any>> = model<IDevice<any>>(DEVICE, deviceSchema);
