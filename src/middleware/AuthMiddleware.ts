import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { inject, injectable } from 'inversify';
import { BaseMiddleware } from 'inversify-express-utils';
import { ParsedQs } from 'qs';
import { TYPES } from '../di';
import { IAuthService, ISessionService } from '../services';
import AppError from '../errors/AppError';
import { env } from '../config';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { IUser } from '../models';
import { StatusCodes } from 'http-status-codes';
import { EntityType } from '../dtos';

@injectable()
export class RequireSignIn extends BaseMiddleware {
  constructor(@inject(TYPES.SessionService) private sessions: ISessionService) {
    super();
  }
  async handler(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
    next: NextFunction
  ): Promise<void> {
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

export const requireEntity = (...entities: EntityType[]): RequestHandler => {
  return (req, res, next) => {
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
