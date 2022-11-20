import { Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpPost, request, requestBody, response } from 'inversify-express-utils';
import { TYPES } from '../di';
import joiMiddleware from '../middleware/joiMiddleware';
import { BaseContoller } from './BaseController';
import { StatusCodes } from 'http-status-codes';
import { requireEntity } from '../middleware/AuthMiddleware';
import { IManagerService } from '../services';
import { createDeviceSchema, createSiteSchema } from '../validators';
import { CreateDeviceDTO, CreateSiteDTO } from '../dtos/manager';

@controller('/api/v1/manager')
export class ManagerController extends BaseContoller {
  constructor(@inject(TYPES.ManagerService) private managerService: IManagerService) {
    super();
  }

  @httpPost('/new-site', joiMiddleware(createSiteSchema), TYPES.RequireSignIn, requireEntity('Manager'))
  async createSite(@request() req: Request, @response() res: Response, @requestBody() payload: CreateSiteDTO) {
    const newSite = await this.managerService.createSite(payload, req.session.id);
    return this.sendResponse(res, StatusCodes.CREATED, 'created site successfully', newSite);
  }

  @httpPost('/new-device', joiMiddleware(createDeviceSchema), TYPES.RequireSignIn, requireEntity('Manager'))
  async createDevice(@request() req: Request, @response() res: Response, @requestBody() payload: CreateDeviceDTO<any>) {
    await this.managerService.createDevice(payload, req.session.id);
    return this.sendResponse(res, StatusCodes.CREATED, 'created device successfully');
  }
}
