import { inject, injectable } from 'inversify';
import { TYPES } from '../di';
import { Session } from '../dtos';
import Redis from 'ioredis';
import { generateReference } from '../utils/helpers';
import AppError from '../errors/AppError';

export interface ISessionService {
  createToken(dto: Session): Promise<string>;
  extendSession(token: string): Promise<Session>;
  deleteSession(token: string): Promise<void>;
}

const EXPIRY_SECONDS = 7 * 24 * 60 * 60;
@injectable()
export class SessionService implements ISessionService {
  constructor(@inject(TYPES.Redis) private redis: Redis) {}

  async createToken(dto: Session): Promise<string> {
    const token = generateReference();
    await this.redis.set(token, JSON.stringify(dto), 'EX', EXPIRY_SECONDS);
    return token;
  }

  async extendSession(token: string): Promise<Session> {
    const stringifiedSession = await this.redis.get(token);
    console.log(stringifiedSession);
    if (!stringifiedSession) {
      throw new AppError('Session not found', 401);
    }
    await this.redis.set(token, stringifiedSession, 'EX', EXPIRY_SECONDS);
    return JSON.parse(stringifiedSession);
  }
  async deleteSession(token: string): Promise<void> {
    await this.redis.del(token);
  }
}
