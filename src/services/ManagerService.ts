import { IDevice, IHeartBeat, InflatedDeviceInfo, ISite } from '../models';
import { Model } from 'mongoose';
import AppError from '../errors/AppError';
import { inject, injectable } from 'inversify';
import { TYPES } from '../di';
import { StatusCodes } from 'http-status-codes';
import { BaseService } from './BaseService';
import { CreateDeviceDTO, CreateSiteDTO } from '../dtos/manager';

export interface IManagerService {
  createSite(dto: CreateSiteDTO, managerId: string): Promise<ISite>;
  createDevice(dto: CreateDeviceDTO, managerId: string): Promise<IDevice>;
  getSitesForManager(managerId: string): Promise<ISite[]>;
  getDevicesOnSite(managerid: string, siteId: string): Promise<IDevice[]>;
}

@injectable()
export class ManagerService extends BaseService implements IManagerService {
  constructor(
    @inject(TYPES.Device) private Device: Model<IDevice>,
    @inject(TYPES.Site) private Site: Model<ISite>,
    @inject(TYPES.HeartBeat) private Heartbeat: Model<IHeartBeat>
  ) {
    super();
  }

  async createSite(dto: CreateSiteDTO, managerId: string): Promise<ISite> {
    // check if site with same name exsits under same manager.
    let site = await this.Site.findOne({ name: dto.name, manager: managerId });

    if (site) {
      throw new AppError(
        `You already created a site with name ${dto.name}. Please use another name`,
        StatusCodes.CONFLICT
      );
    }

    return await this.Site.create({
      ...dto,
      manager: managerId,
    });
  }

  async createDevice(dto: CreateDeviceDTO, managerId: string): Promise<IDevice> {
    // check if the site exists and is connected with the manager.
    const site = await this.checkSite(dto.site);

    if (site.manager.toString() !== managerId.toString()) {
      throw new AppError('You cannot perform this action', StatusCodes.FORBIDDEN);
    }

    const device = await this.Device.findOne({ site: dto.site, name: dto.name });

    if (device) {
      throw new AppError(`${dto.type} with name ${dto.name} already exists on this site`, StatusCodes.CONFLICT);
    }

    return await this.Device.create(dto);
  }

  async getSitesForManager(managerId: string): Promise<ISite[]> {
    return await this.Site.find({ manager: managerId });
  }

  async getDevicesOnSite(managerid: string, siteId: string): Promise<InflatedDeviceInfo[]> {
    const site = await this.checkSite(siteId);
    if (site.manager.toString() !== managerid) {
      throw new AppError('You cannot access this site', 403);
    }
    const devices: InflatedDeviceInfo[] = await this.Device.find({ site: siteId });
    const n = devices.length;

    for (let i = 0; i < n; i++) {
      const device = devices[i];
      const [heartbeat] = await this.Heartbeat.find({ device: device._id.toString(), site: device.site.toString() })
        .sort({
          createdAt: -1,
        })
        .limit(1);

      device.isOnline = heartbeat && Date.now() - heartbeat.createdAt.getTime() <= 2000;
    }

    return devices;
  }

  private async checkSite(id: string): Promise<ISite> {
    return this.checkDocumentExists(this.Site, id, 'Site');
  }

  // private async checkDevice<T>(id: string): Promise<IDevice<T>> {
  //   return this.checkDocumentExists(this.Device, id, 'Device');
  // }
}
