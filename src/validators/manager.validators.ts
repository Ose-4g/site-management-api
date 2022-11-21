import { DeviceType, deviceTypes } from '../models';
import joi from 'joi';
import { requiredString } from './general';

export const createSiteSchema = joi.object({
  name: requiredString,
  description: joi.string(),
  location: joi.string(),
});

export const createDeviceSchema = joi.object({
  name: requiredString,
  type: requiredString.valid(...deviceTypes),
  maintenanceWindow: joi.number().min(1),
  metadata: joi.when('type', {
    is: <DeviceType>'generator',
    then: joi.object({
      MVARating: joi.number(),
    }),
    otherwise: joi.object({
      currentRating: joi.number(),
    }),
  }),
});
