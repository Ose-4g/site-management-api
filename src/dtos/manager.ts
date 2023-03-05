import { IDevice, ISite } from '../models';

export type CreateSiteDTO = Pick<ISite, 'name' | 'description' | 'location'>;

export type CreateDeviceDTO = Pick<IDevice, 'type' | 'name' | 'metadata' | 'site' | 'maintenanceWindow'>;
