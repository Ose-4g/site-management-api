import { NextFunction, Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpPost, next, request, requestBody, response } from 'inversify-express-utils';
import { TYPES } from '../di';
import AppError from '../errors/AppError';
import joiMiddleware from '../middleware/joiMiddleware';
import { IAuthService } from '../services';
import { LoginDTO, ResetPasswordDTO, SignUpUserDTO, VerifyUserDTO } from '../dtos/auth';
import { loginSchema, signUpUserSchema, verifyAccountSchema, resetPasswordSchema } from '../validators';
import { BaseContoller } from './BaseController';

@controller('/api/v1/auth')
export class AuthController extends BaseContoller {
  constructor(@inject(TYPES.AuthService) private authService: IAuthService) {
    super();
  }

  @httpPost('/company-login', joiMiddleware(loginSchema))
  async managerLogin(@response() res: Response, @requestBody() payload: LoginDTO) {
    const { email, password } = payload;
    const result = await this.authService.login(email, password, 'Company');
    return this.sendResponse(res, 200, 'Successfully logged in', result);
  }

  @httpPost('/manager-login', joiMiddleware(loginSchema))
  async companyLogin(@response() res: Response, @requestBody() payload: LoginDTO) {
    const { email, password } = payload;
    const result = await this.authService.login(email, password, 'Manager');
    return this.sendResponse(res, 200, 'Successfully logged in', result);
  }
}
