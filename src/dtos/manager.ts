import { IDevice, ISite } from '../models';

export type CreateSiteDTO = Pick<ISite, 'name' | 'manager' | 'description' | 'location'>;

export type CreateDeviceDTO<T> = Pick<IDevice<T>, 'type' | 'name' | 'metadata' | 'site' | 'maintenanceWindow'>;
