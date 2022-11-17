import { NextFunction, Request, Response } from 'express';

import AppError from '../errors/AppError';
import Joi from 'joi';

const joiMiddleware = (
  schema: Joi.Schema,
  property?: 'body' | 'params' | 'query'
): ((req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[property || 'body'], {
      allowUnknown: false,
    });

    //return error if the error object contains details
    if (error !== null && error?.details) {
      const { details }: Joi.ValidationError = error;
      const message = details.map((err: Joi.ValidationErrorItem) => err.message).join(',');

      return next(new AppError(message, 422));
    }

    next();
  };
};

export default joiMiddleware;
