import joi from 'joi';

const requiredString = joi.string().required();

const loginSchemaDesc = {
  email: requiredString.email().messages({
    'any.required': 'email is required',
    'string.email': 'invalid email provided',
  }),
  password: requiredString.messages({
    'any.required': 'password is required',
  }),
};

export const loginSchema = joi.object(loginSchemaDesc);

export const signUpUserSchema = joi.object({
  ...loginSchemaDesc,
  name: requiredString.min(3).messages({
    'any.required': 'name is required',
  }),
  phoneNumber: requiredString.messages({
    'any.required': 'phone number is required',
  }),
});

export const verifyAccountSchema = joi.object({
  email: requiredString.email().messages({
    'any.required': 'email is required',
    'string.email': 'invalid email provided',
  }),
  code: requiredString.messages({
    'any.required': 'code is required',
  }),
});

export const resetPasswordSchema = joi.object({
  ...loginSchemaDesc,
  code: requiredString.messages({
    'any.required': 'code is required',
  }),
});
