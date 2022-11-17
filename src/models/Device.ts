import { PopulatedDoc } from 'mongoose';
import { BaseModel } from '../db';
import { Site } from './Site';

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
  site: PopulatedDoc<Site>;
  maintenanceWindow: number;
  metadata: T;
}
