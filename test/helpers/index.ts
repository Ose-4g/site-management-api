import { ISessionService } from '../../src/services';
import { Session } from '../../src/dtos';
import { database } from './mockDB';

export { database };
export * from './company';

export async function generateToken(session: Session, service: ISessionService): Promise<string> {
  return await service.createToken(session);
}

export type DTOFactory<T> = (extras?: Partial<T>) => T;
