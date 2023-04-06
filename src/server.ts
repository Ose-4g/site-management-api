import 'reflect-metadata';
import './mqtt';

import app, { container } from './app';

import { CronManager } from '@ose4g/cron-manager';
import { CronService } from './services/CronService';
import { TYPES } from './di';
import connectToDB from './db/connect';
import dotenv from 'dotenv';
import logger from './utils/logger';

dotenv.config();

const { PORT } = process.env;

const cronManager = new CronManager();
cronManager.register(CronService, container.get<CronService>(TYPES.CronService));

const startServer = async () => {
  // cronManager.startAll();
  //do not connect to mongodb in unit testing mode.
  if (process.env.NODE_ENV !== 'test') await connectToDB();
  app.listen(PORT || 6000, () => {
    if (process.env.NODE_ENV !== 'test') {
      logger.info(`
                ################################################
                🛡️  Server listening on port: ${PORT} 🛡️
                ################################################
                SERVER IN ${process.env.NODE_ENV as string} MODE
              `);
    }
  });
};

startServer();

export default app;
