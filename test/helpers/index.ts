import { database } from './mockDB';

export { database };
export * from './company';

export type DTOFactory<T> = (extras?: Partial<T>) => T;
