import { Response } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, request, requestBody, requestParam, response } from 'inversify-express-utils';
import { TYPES } from '../di';
import joiMiddleware from '../middleware/joiMiddleware';
import { ICompanyService } from '../services';
import { BaseContoller } from './BaseController';
import { createCompanySchema, inviteManagerSchema } from '../validators/company.validators';
import { CreateCompanyDTO, InviteManagerDTO } from '../dtos';
import { StatusCodes } from 'http-status-codes';
import { requireEntity } from '../middleware/AuthMiddleware';
import { IRequest } from '../utils/types';

@controller('/api/v1/company')
export class CompanyController extends BaseContoller {
  constructor(@inject(TYPES.CompanyService) private companyService: ICompanyService) {
    super();
  }

  @httpPost('/new', joiMiddleware(createCompanySchema))
  async createCompany(@response() res: Response, @requestBody() payload: CreateCompanyDTO) {
    const newCompany = await this.companyService.createCompany(payload);
    return this.sendResponse(res, StatusCodes.CREATED, 'created company successfully', newCompany);
  }

  @httpPost('/invite-manager', joiMiddleware(inviteManagerSchema), TYPES.RequireSignIn, requireEntity('Company'))
  async inviteManager(@request() req: IRequest, @response() res: Response, @requestBody() payload: InviteManagerDTO) {
    await this.companyService.inviteManager(req.session.id, payload);
    return this.sendResponse(res, StatusCodes.OK, `Invite has been sent to ${payload.email}`);
  }

  @httpGet('/managers', joiMiddleware(inviteManagerSchema), TYPES.RequireSignIn, requireEntity('Company'))
  async getManagers(@request() req: IRequest, @response() res: Response) {
    const managers = await this.companyService.listManagers(req.session.id);
    return this.sendResponse(res, StatusCodes.OK, `Fetched managers successfully`, managers);
  }

  @httpGet('/sites/:managerId', joiMiddleware(inviteManagerSchema), TYPES.RequireSignIn, requireEntity('Company'))
  async viewSites(@request() req: IRequest, @response() res: Response, @requestParam('managerId') managerId: string) {
    const sites = await this.companyService.listManagerSites(req.session.id, managerId);
    return this.sendResponse(res, StatusCodes.OK, `Fetched sites successfully`, sites);
  }
}
