import { Response } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, request, requestBody, requestParam, response } from 'inversify-express-utils';
import { TYPES } from '../di';
import joiMiddleware from '../middleware/joiMiddleware';
import { BaseContoller } from './BaseController';
import { StatusCodes } from 'http-status-codes';
import { requireEntity } from '../middleware/AuthMiddleware';
import { IManagerService } from '../services';
import { createDeviceSchema, createSiteSchema } from '../validators';
import { CreateDeviceDTO, CreateSiteDTO } from '../dtos/manager';
import { IRequest } from '../utils/types';

@controller('/api/v1/manager')
export class ManagerController extends BaseContoller {
  constructor(@inject(TYPES.ManagerService) private managerService: IManagerService) {
    super();
  }

  @httpPost('/new-site', joiMiddleware(createSiteSchema), TYPES.RequireSignIn, requireEntity('Manager'))
  async createSite(@request() req: IRequest, @response() res: Response, @requestBody() payload: CreateSiteDTO) {
    const newSite = await this.managerService.createSite(payload, req.session.id);
    return this.sendResponse(res, StatusCodes.CREATED, 'created site successfully', newSite);
  }

  @httpPost('/new-device', joiMiddleware(createDeviceSchema), TYPES.RequireSignIn, requireEntity('Manager'))
  async createDevice(@request() req: IRequest, @response() res: Response, @requestBody() payload: CreateDeviceDTO) {
    const newDevice = await this.managerService.createDevice(payload, req.session.id);
    return this.sendResponse(res, StatusCodes.CREATED, 'created device successfully', newDevice);
  }

  @httpGet('/sites', TYPES.RequireSignIn, requireEntity('Manager'))
  async getSites(@request() req: IRequest, @response() res: Response) {
    const sites = await this.managerService.getSitesForManager(req.session.id);
    return this.sendResponse(res, StatusCodes.OK, `Fetched sites successfully`, sites);
  }

  @httpGet('sites/:siteId/devices', TYPES.RequireSignIn, requireEntity('Manager'))
  async viewDevices(@request() req: IRequest, @response() res: Response, @requestParam('siteId') siteId: string) {
    const devices = await this.managerService.getDevicesOnSite(req.session.id, siteId);
    return this.sendResponse(res, StatusCodes.OK, `Fetched devices successfully`, devices);
  }

  @httpGet('/device/:deviceId', TYPES.RequireSignIn, requireEntity('Manager'))
  async getDeviceInfo(@request() req: IRequest, @response() res: Response, @requestParam('deviceId') deviceId: string) {
    const heartbeats = await this.managerService.getDeviceInfo(deviceId);
    return this.sendResponse(res, StatusCodes.OK, `Fetched device info successfully`, heartbeats);
  }
}
