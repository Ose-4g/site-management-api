import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import logger from './utils/logger';
import connectToDB from './db/connect';

const { PORT } = process.env;

const startServer = async () => {
  //do not connect to mongodb in unit testing mode.
  if (!(process.env.NODE_ENV === 'test' && process.env.TEST_TYPE === 'unit')) await connectToDB();
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
