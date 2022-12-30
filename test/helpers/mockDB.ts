import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { ConnectOptions } from 'mongoose';

class MockDB {
  private static instance: MockDB;
  private mongod: MongoMemoryServer | null = null;
  private constructor() {}

  static getInstance(): MockDB {
    if (!MockDB.instance) MockDB.instance = new MockDB();
    return MockDB.instance;
  }
  async connect() {
    try {
      this.mongod = await MongoMemoryServer.create();
      const url = this.mongod.getUri();
      await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as ConnectOptions);
    } catch (err) {
      this.mongod = null;
      console.log(err);
      console.log('DB connection not successful');
    }
  }

  async disconnect() {
    if (!this.mongod) throw Error('database is not connected');
    try {
      await mongoose.disconnect();
      await this.mongod.stop();
    } catch (err) {
      console.log('unable to stop mongod');
      console.log(err);
    }
  }
}

export const database = MockDB.getInstance();
