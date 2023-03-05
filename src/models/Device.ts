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

export interface IDevice extends BaseModel {
  name: string;
  type: DeviceType;
  site: PopulatedDoc<ISite>;
  maintenanceWindow: number;
  metadata: any;
}

const deviceSchema = new Schema<IDevice>(
  {
    name: {
      type: String,
      required: true,
    },
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

export const Device: Model<IDevice> = model<IDevice>(DEVICE, deviceSchema);
