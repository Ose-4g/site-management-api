import { NextFunction, RequestHandler, Request } from 'express';
import { removeSpaces } from '../utils/helpers';
import validator from 'validator';
import AppError from '../errors/AppError';

function checkValidId(req: Request, field: string, next: NextFunction) {
  const id = (req.body as any)[field] || (req.params as any)[field] || (req.query as any)[field];
  if (id && !validator.isMongoId(id)) return next(new AppError(`invalid id provided in field ${field}`, 400));
}
const formatParams: RequestHandler = (req, res, next) => {
  //make email lowercase and remove all spaces.
  if (req.body.email) {
    req.body.email = removeSpaces(String(req.body.email).toLowerCase());

    if (!validator.isEmail(req.body.email)) return next(new AppError('invalid email provided', 400));
  }

  checkValidId(req, 'userId', next);
  checkValidId(req, 'projectId', next);
  checkValidId(req, 'rootId', next);
  checkValidId(req, 'listId', next);
  checkValidId(req, 'cardId', next);

  next();
};

export default formatParams;
