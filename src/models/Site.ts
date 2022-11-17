import { BaseModel } from '../db';
import { IManager } from './Manager';
import { PopulatedDoc } from 'mongoose';

export interface Site extends BaseModel {
  name: string;
  description: string;
  location: string;
  manager: PopulatedDoc<IManager>;
}
