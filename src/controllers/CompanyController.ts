import { NextFunction, Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpPost, next, request, requestBody, response } from 'inversify-express-utils';
import { TYPES } from '../di';
import AppError from '../errors/AppError';
import joiMiddleware from '../middleware/joiMiddleware';
import { IAuthService, ICompanyService } from '../services';
import { LoginDTO, ResetPasswordDTO, SignUpUserDTO, VerifyUserDTO } from '../dtos/auth';
import { loginSchema, signUpUserSchema, verifyAccountSchema, resetPasswordSchema } from '../validators';
import { BaseContoller } from './BaseController';
import { createCompanySchema, inviteManagerSchema } from '../validators/company.validators';
import { CreateCompanyDTO, InviteManagerDTO } from '../dtos';
import { StatusCodes } from 'http-status-codes';
import { requireEntity } from '../middleware/AuthMiddleware';

@controller('/api/v1/company')
export class CompanyController extends BaseContoller {
  constructor(@inject(TYPES.CompanyService) private companyService: ICompanyService) {
    super();
  }

  @httpPost('/new', joiMiddleware(createCompanySchema))
  async signUpUser(@response() res: Response, @requestBody() payload: CreateCompanyDTO) {
    const newCompany = await this.companyService.crateCompany(payload);
    return this.sendResponse(res, StatusCodes.CREATED, 'created company successfully', newCompany);
  }

  @httpPost('/invite-manager', joiMiddleware(inviteManagerSchema), TYPES.RequireSignIn, requireEntity('Company'))
  async login(@request() req: Request, @response() res: Response, @requestBody() payload: InviteManagerDTO) {
    await this.companyService.inviteManager(req.session.id, payload);
    return this.sendResponse(res, StatusCodes.OK, `Invite has been sent to ${payload.email}`);
  }
}
