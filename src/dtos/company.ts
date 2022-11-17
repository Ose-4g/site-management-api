import { ICompany, IManager } from '../models';

export type CreateCompanyDTO = Pick<ICompany, 'name' | 'email' | 'password'>;
export type InviteManagerDTO = Pick<IManager, 'email' | 'name'>;
