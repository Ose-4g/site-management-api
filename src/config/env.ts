import dotenv from 'dotenv';
dotenv.config();
import Joi from 'joi';

const requiredString = Joi.string().required();

const schema = {
  NODE_ENV: requiredString.default('development'),
  MONGO_URL: requiredString,
  JWT_SECRET: requiredString,
  JWT_EXPIRES: requiredString,
  NODEMAILER_USER: requiredString,
  CLIENT_ID: requiredString,
  CLIENT_SECRET: requiredString,
  NODEMAILER_REFRESH_TOKEN: requiredString,
  REDIRECT_URI: requiredString,
  EMAIL_FROM: requiredString,
  PAYSTACK_SECRET_KEY: requiredString,
  PAYSTACK_PUBLIC_KEY: requiredString,
  ACCESS_KEY_ID: requiredString,
  SECRET_ACCESS_KEY: requiredString,
  BUCKET_NAME: requiredString,
};
const envSchema = Joi.object(schema);

export interface Env {
  NODE_ENV: string;
  MONGO_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES: string;
  NODEMAILER_USER: string;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  NODEMAILER_REFRESH_TOKEN: string;
  REDIRECT_URI: string;
  EMAIL_FROM: string;
  PAYSTACK_SECRET_KEY: string;
  PAYSTACK_PUBLIC_KEY: string;
  ACCESS_KEY_ID: string;
  SECRET_ACCESS_KEY: string;
  BUCKET_NAME: string;
}

const tenv: any = {};
for (const key in schema) {
  tenv[key] = process.env[key];
}

function loadEnv() {
  const { error } = envSchema.validate(tenv);

  //return error if the error object contains details
  if (error !== null && error?.details) {
    const { details }: Joi.ValidationError = error;
    const message = details.map((err: Joi.ValidationErrorItem) => err.message).join(',');

    throw new Error(message);
  }
}

loadEnv();

export const env = tenv as Env;
