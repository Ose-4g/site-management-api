import express, { Request, Response } from 'express';
import errorMiddleWare from './errors/errorHandler';
import morgan from 'morgan';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import { TYPES } from './di';
import { Model } from 'mongoose';
import { User, IUser } from './models';
import { AuthService, IAuthService, INotificationService, notificationService } from './services';
import './controllers';
import { env } from './config';

const { NODE_ENV } = env;

const container = new Container();

container.bind<Model<IUser>>(TYPES.User).toConstantValue(User);
container.bind<INotificationService>(TYPES.NotificationService).toConstantValue(notificationService);
container.bind<IAuthService>(TYPES.AuthService).to(AuthService);

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
