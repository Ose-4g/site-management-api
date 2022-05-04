import { NextFunction, Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpPost, next, request, requestBody, response } from 'inversify-express-utils';
import { TYPES } from '../di';
import AppError from '../errors/AppError';
import joiMiddleware from '../middleware/joiMiddleware';
import { IAuthService } from '../services';
import { LoginDTO, ResetPasswordDTO, SignUpUserDTO, VerifyUserDTO } from '../utils/dtos';
import { loginSchema, signUpUserSchema, verifyAccountSchema, resetPasswordSchema } from '../validators';
import { BaseContoller } from './BaseController';

@controller('/api/v1/auth')
export class AuthController extends BaseContoller {
  constructor(@inject(TYPES.AuthService) private authService: IAuthService) {
    super();
  }

  @httpPost('/signup/user', joiMiddleware(signUpUserSchema))
  async signUpUser(@response() res: Response, @requestBody() payload: SignUpUserDTO) {
    const { email, password, phoneNumber, name } = payload;
    const newUser = await this.authService.signupUser(email, password, name, phoneNumber);
    return this.sendResponse(res, 201, 'created user successfully', newUser);
  }

  @httpPost('/login', joiMiddleware(loginSchema))
  async login(@response() res: Response, @requestBody() payload: LoginDTO) {
    const { email, password } = payload;
    const result = await this.authService.login(email, password);
    return this.sendResponse(res, 200, 'Successfully logged in', result);
  }

  @httpPost('/verify-user', joiMiddleware(verifyAccountSchema))
  async verifyUser(@response() res: Response, @requestBody() payload: VerifyUserDTO) {
    const { code, email } = payload;
    await this.authService.verifyAccount(code, email);
    return this.sendResponse(res, 200, 'Successfully verified user');
  }

  @httpPost('/request-verification')
  async requestVerification(@response() res: Response, @requestBody() { email }: { email: string }) {
    await this.authService.requestEmailVerification(email);
    return this.sendResponse(res, 200, `Sent verification code to ${email}`);
  }

  @httpPost('/forgot-password')
  async forgotPassword(@response() res: Response, @requestBody() { email }: { email: string }) {
    if (!email) throw new AppError('email is required', 400);
    await this.authService.forgotPassword(email);
    return this.sendResponse(res, 200, `Instructions to reset password have been sent to ${email}`);
  }

  @httpPost('/reset-password', joiMiddleware(resetPasswordSchema))
  async resetPassword(@response() res: Response, @requestBody() payload: ResetPasswordDTO) {
    const { code, password, email } = payload;
    await this.authService.resetPassword(email, code, password);
    return this.sendResponse(res, 200, 'successfully reset password');
  }
}
