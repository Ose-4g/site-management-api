import { IDevice, ISite } from '../models';
import { Model } from 'mongoose';
import { inject, injectable } from 'inversify';
import { TYPES } from '../di';
import { Message } from '../dtos';
import { BaseService } from './BaseService';
import { IHeartBeat } from '../models/HeartBeat';

export interface IHearbeatService {
  createRecord(message: Message): Promise<IHeartBeat>;
}

@injectable()
export class HeartBeatService extends BaseService implements IHearbeatService {
  constructor(
    @inject(TYPES.Site) private Site: Model<ISite>,
    @inject(TYPES.Device) private Device: Model<IDevice>,
    @inject(TYPES.HeartBeat) private HeartBeat: Model<IHeartBeat>
  ) {
    super();
  }

  async createRecord(message: Message): Promise<IHeartBeat> {
    if (!message.site_id || !message.device_id) {
      throw new Error('site id or device id not provided');
    }
    await this.getSite(message.site_id);
    await this.getDevice(message.device_id);
    return await this.HeartBeat.create({
      site: message.site_id,
      device: message.device_id,
      metadata: message.data,
    });
  }

  private async getSite(id: string): Promise<ISite> {
    return await this.checkDocumentExists(this.Site, id, 'Site');
  }

  private async getDevice(id: string): Promise<IDevice> {
    return await this.checkDocumentExists(this.Device, id, 'Device');
  }
}
