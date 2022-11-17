import { Multer } from 'express';
import { EntityType } from './dtos';
import { ICompany, IManager } from './models';

//allows me to user req.user in the requests handlers.

declare global {
  namespace Express {
    export interface Request {
      session: {
        userType: EntityType;
        id: string;
        info: ICompany | IManager;
      };
    }
  }
}
