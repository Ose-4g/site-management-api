import mongoose, { ConnectOptions } from 'mongoose';

import logger from '../utils/logger';

const { MONGO_URL } = process.env;

//Connection to mongoDb Database
const connectToDB = async (): Promise<void> => {
  try {
    await mongoose.connect(
      MONGO_URL as string,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as ConnectOptions
    );
    logger.info('Database connected successfully!');
  } catch (err) {
    console.error(err);
  }
};

export default connectToDB;
