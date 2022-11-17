import joi from 'joi';
import { requiredString } from './general';

export const createCompanySchema = joi.object({
  email: requiredString.trim().email().lowercase(),
  name: requiredString,
  password: requiredString.min(8),
});

export const inviteManagerSchema = joi.object({
  email: requiredString.trim().email().lowercase(),
  name: requiredString,
});
