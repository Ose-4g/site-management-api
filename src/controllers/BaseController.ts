import { Request, Response } from 'express';
import { controller, httpGet, request, response } from 'inversify-express-utils';
import { successResponse } from '../utils/helpers/response';

@controller('/')
export class BaseContoller {
  sendResponse(@response() res: Response, status: number, mesage: string, data?: any) {
    return successResponse(res, status, mesage, data);
  }
  @httpGet('/')
  getBase(@request() req: Request, @response() res: Response) {
    res.status(200).json({
      message: 'Welcome to Your api',
      documentation: 'Yet to be done',
    });
  }
}
