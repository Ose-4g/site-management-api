import dotenv from 'dotenv';
import joi from 'joi';
dotenv.config();

const requiredString = joi.string().required();

const schema = {
  NODE_ENV: requiredString.default('development'),
  MONGO_URL: requiredString,
  NODEMAILER_USER: requiredString,
  CLIENT_ID: requiredString,
  CLIENT_SECRET: requiredString,
  NODEMAILER_REFRESH_TOKEN: requiredString,
  REDIRECT_URI: requiredString,
  EMAIL_FROM: requiredString,
  ACCESS_KEY_ID: requiredString,
  SECRET_ACCESS_KEY: requiredString,
  BUCKET_NAME: requiredString,
  REDIS_URL: requiredString.uri({ scheme: 'redis' }),
  MQTT_URL: requiredString.uri({ scheme: 'mqtt' }),
  APP_ID: requiredString,
};
const envSchema = joi.object(schema);

export interface Env {
  NODE_ENV: string;
  MONGO_URL: string;
  NODEMAILER_USER: string;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  NODEMAILER_REFRESH_TOKEN: string;
  REDIRECT_URI: string;
  EMAIL_FROM: string;
  ACCESS_KEY_ID: string;
  SECRET_ACCESS_KEY: string;
  BUCKET_NAME: string;
  REDIS_URL: string;
  REDIS_PASSWORD: string;
  MQTT_URL: string;
  APP_ID: string;
}

const tenv: any = {};
for (const key in schema) {
  tenv[key] = process.env[key];
}

function loadEnv() {
  const { error } = envSchema.validate(tenv);

  //return error if the error object contains details
  if (error !== null && error?.details) {
    const { details }: joi.ValidationError = error;
    const message = details.map((err: joi.ValidationErrorItem) => err.message).join(',');

    throw new Error(message);
  }
}

loadEnv();

export const env = tenv as Env;
