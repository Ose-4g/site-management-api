import { Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { BaseMiddleware } from 'inversify-express-utils';
import { TYPES } from '../di';
import { ISessionService } from '../services';
import AppError from '../errors/AppError';
import { EntityType } from '../dtos';
import { IRequest } from '../utils/types';

@injectable()
export class RequireSignIn extends BaseMiddleware {
  constructor(@inject(TYPES.SessionService) private sessions: ISessionService) {
    super();
  }
  async handler(req: IRequest, res: Response<any, Record<string, any>>, next: NextFunction): Promise<void> {
    try {
      const authHeader: string = req.headers['authorization'] || '';
      if (!authHeader) {
        throw new AppError('No token provided', 401);
      }

      const token: string = authHeader.replace('Bearer ', '');

      const session = await this.sessions.extendSession(token);

      req.session = session;

      next();
    } catch (err) {
      return next(err);
    }
  }
}

export const requireEntity = (...entities: EntityType[]) => {
  return (req: IRequest, res: Response, next: NextFunction) => {
    if (!req.session) {
      return next(new AppError('User is not logged in', 401));
    }

    const isValid = entities.includes(req.session.userType);
    if (!isValid) {
      return next(new AppError('You are not authorized to perform this action', 403));
    }

    next();
  };
};
