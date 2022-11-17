import { Session } from './dtos';
declare global {
  namespace Express {
    export interface Request {
      session: Session;
    }
  }
}
