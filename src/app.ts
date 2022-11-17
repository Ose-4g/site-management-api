import './controllers';

import {
  AuthService,
  CompanyService,
  IAuthService,
  ICompanyService,
  INotificationService,
  ISessionService,
  SessionService,
  notificationService,
} from './services';
import { Company, ICompany, IManager, IUser, Manager, User } from './models';
import express, { Request, Response } from 'express';

import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Model } from 'mongoose';
import Redis from 'ioredis';
import { RequireSignIn } from './middleware/AuthMiddleware';
import { TYPES } from './di';
import { env } from './config';
import errorMiddleWare from './errors/errorHandler';
import morgan from 'morgan';

const { NODE_ENV } = env;

const redis = new Redis(env.REDIS_URL, { password: env.REDIS_PASSWORD });
const container = new Container();

container.bind<Model<IUser>>(TYPES.User).toConstantValue(User);
container.bind<Model<ICompany>>(TYPES.Company).toConstantValue(Company);
container.bind<Model<IManager>>(TYPES.Manager).toConstantValue(Manager);
container.bind<ISessionService>(TYPES.SessionService).to(SessionService);

container.bind<Redis>(TYPES.Redis).toConstantValue(redis);

container.bind<INotificationService>(TYPES.NotificationService).toConstantValue(notificationService);
container.bind<IAuthService>(TYPES.AuthService).to(AuthService);
container.bind<ICompanyService>(TYPES.CompanyService).to(CompanyService);
container.bind<RequireSignIn>(TYPES.RequireSignIn).to(RequireSignIn);

const server = new InversifyExpressServer(container);

server.setConfig((app) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }
});

server.setErrorConfig((app) => {
  app.all('*', (req: Request, res: Response) => {
    res.status(404).json({
      message: 'This endpoint does not exist on this server',
    });
  });

  app.use(errorMiddleWare);
});

const app = server.build();
export default app;
