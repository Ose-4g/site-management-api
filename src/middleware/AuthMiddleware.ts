import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { inject, injectable } from 'inversify';
import { BaseMiddleware } from 'inversify-express-utils';
import { ParsedQs } from 'qs';
import { TYPES } from '../di';
import { IAuthService } from '../services';
import AppError from '../errors/AppError';
import { env } from '../config';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { IUser } from '../models';
import { StatusCodes } from 'http-status-codes';
import { EntityType } from '../dtos';

@injectable()
export class RequireSignIn extends BaseMiddleware {
  constructor(@inject(TYPES.AuthService) private authService: IAuthService) {
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

      //verify JWT
      let data: any;
      try {
        data = await jwt.verify(token, env.JWT_SECRET);
      } catch (error) {
        throw new AppError('invalid jwt provided', StatusCodes.UNAUTHORIZED);
      }

      if (!data.id || !data.entity) {
        throw new AppError('Invalid token provided', StatusCodes.UNAUTHORIZED);
      }

      //save user object in body if user isn't banned/deleted
      const entityInfo = await this.authService.findEntity(data.id, data.entity);
      if (!entityInfo) {
        throw new AppError('Invalid token provided', StatusCodes.UNAUTHORIZED);
      }
      req.session = {
        id: data.id,
        userType: data.entity,
        info: entityInfo,
      };

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
      return next(new AppError('You are not authroized to perform this action', 403));
    }

    next();
  };
};
