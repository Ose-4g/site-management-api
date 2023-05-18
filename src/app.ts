import './controllers';
import 'reflect-metadata';

import {
  AuthService,
  CompanyService,
  HeartBeatService,
  IAuthService,
  ICompanyService,
  IHearbeatService,
  INotificationService,
  ISessionService,
  SessionService,
  notificationService,
} from './services';
import { Company, Device, HeartBeat, ICompany, IDevice, IHeartBeat, IManager, ISite, Manager, Site } from './models';
import { IManagerService, ManagerService } from './services/ManagerService';
import express, { Request, Response } from 'express';

import { Container } from 'inversify';
import { CronService } from './services/CronService';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Model } from 'mongoose';
import Redis from 'ioredis';
import { RequireSignIn } from './middleware/AuthMiddleware';
import { TYPES } from './di';
import cors from 'cors';
import { env } from './config';
import errorMiddleWare from './errors/errorHandler';
import morgan from 'morgan';

const { NODE_ENV } = env;

const redis = new Redis(env.REDIS_URL, { password: env.REDIS_PASSWORD });
const container = new Container();

container.bind<Model<ICompany>>(TYPES.Company).toConstantValue(Company);
container.bind<Model<IManager>>(TYPES.Manager).toConstantValue(Manager);
container.bind<Model<ISite>>(TYPES.Site).toConstantValue(Site);
container.bind<Model<IDevice>>(TYPES.Device).toConstantValue(Device);
container.bind<Model<IHeartBeat>>(TYPES.HeartBeat).toConstantValue(HeartBeat);

container.bind<Redis>(TYPES.Redis).toConstantValue(redis);

container.bind<INotificationService>(TYPES.NotificationService).toConstantValue(notificationService);
container.bind<IAuthService>(TYPES.AuthService).to(AuthService);
container.bind<ICompanyService>(TYPES.CompanyService).to(CompanyService);
container.bind<RequireSignIn>(TYPES.RequireSignIn).to(RequireSignIn);
container.bind<ISessionService>(TYPES.SessionService).to(SessionService);
container.bind<IManagerService>(TYPES.ManagerService).to(ManagerService);
container.bind<IHearbeatService>(TYPES.HeartBeatService).to(HeartBeatService);
container.bind<CronService>(TYPES.CronService).to(CronService);

const server = new InversifyExpressServer(container);

server.setConfig((app) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

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
export { container };
