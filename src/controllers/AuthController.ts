import { Response } from 'express';
import { inject } from 'inversify';
import { controller, httpPost, requestBody, response } from 'inversify-express-utils';
import { TYPES } from '../di';
import joiMiddleware from '../middleware/joiMiddleware';
import { IAuthService } from '../services';
import { LoginDTO } from '../dtos/auth';
import { loginSchema } from '../validators';
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
