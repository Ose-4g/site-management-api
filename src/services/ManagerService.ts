import { IDevice, ISite } from '../models';
import { Model } from 'mongoose';
import AppError from '../errors/AppError';
import { inject, injectable } from 'inversify';
import { TYPES } from '../di';
import { StatusCodes } from 'http-status-codes';
import { BaseService } from './BaseService';
import { CreateDeviceDTO, CreateSiteDTO } from '../dtos/manager';

export interface IManagerService {
  createSite(dto: CreateSiteDTO, managerId: string): Promise<ISite>;
  createDevice<T>(dto: CreateDeviceDTO<T>, managerId: string): Promise<IDevice<T>>;
  getSitesForManager(managerId: string): Promise<ISite[]>;
  getDevicesOnSite(managerid: string, siteId: string): Promise<IDevice<any>[]>;
}

@injectable()
export class ManagerService extends BaseService implements IManagerService {
  constructor(
    @inject(TYPES.Device) private Device: Model<IDevice<any>>,
    @inject(TYPES.Site) private Site: Model<ISite>
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

  async createDevice<T>(dto: CreateDeviceDTO<T>, managerId: string): Promise<IDevice<T>> {
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

  async getDevicesOnSite(managerid: string, siteId: string): Promise<IDevice<any>[]> {
    const site = await this.checkSite(siteId);
    if (site.manager.toString() !== managerid) {
      throw new AppError('You cannot access this site', 403);
    }
    return await this.Device.find({ site: siteId });
  }

  private async checkSite(id: string): Promise<ISite> {
    return this.checkDocumentExists(this.Site, id, 'Site');
  }

  private async checkDevice<T>(id: string): Promise<IDevice<T>> {
    return this.checkDocumentExists(this.Device, id, 'Device');
  }
}
