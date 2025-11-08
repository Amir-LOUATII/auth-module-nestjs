import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

interface AuthConfig {
  JWT_ACCESS_TOKEN_SECRET: string;
  JWT_ACCESS_TOKEN_EXPIRATION: string;
  JWT_REFRESH_TOKEN_SECRET: string;
  JWT_PASSWORD_RESET_TOKEN_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

export const authConfigurationSchema = Joi.object({
  JWT_ACCESS_TOKEN_SECRET: Joi.string().required().messages({
    'any.required': 'JWT_ACCESS_TOKEN_SECRET is required',
  }),
  JWT_ACCESS_TOKEN_EXPIRATION: Joi.string().required().messages({
    'any.required': 'JWT_ACCESS_TOKEN_EXPIRATION is required',
  }),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required().messages({
    'any.required': 'JWT_REFRESH_TOKEN_SECRET is required',
  }),
  JWT_PASSWORD_RESET_TOKEN_SECRET: Joi.string().required().messages({
    'any.required': 'JWT_PASSWORD_RESET_TOKEN_SECRET is required',
  }),
  GOOGLE_CLIENT_ID: Joi.string().required().messages({
    'any.required': 'GOOGLE_CLIENT_ID is required',
  }),
  GOOGLE_CLIENT_SECRET: Joi.string().required().messages({
    'any.required': 'GOOGLE_CLIENT_SECRET is required',
  }),
}).unknown(true);

export default registerAs('auth', () => {
  const { value, error } = authConfigurationSchema.validate(
    process.env as Record<string, unknown>,
    { abortEarly: false },
  ) as { value: AuthConfig; error?: Joi.ValidationError };

  if (error) {
    throw new Error(`Auth config validation failed:\n${error.message}`);
  }

  return {
    accessTokenSecret: value.JWT_ACCESS_TOKEN_SECRET,
    accessTokenExpiration: value.JWT_ACCESS_TOKEN_EXPIRATION,
    refreshTokenSecret: value.JWT_REFRESH_TOKEN_SECRET,
    passwordResetTokenSecret: value.JWT_PASSWORD_RESET_TOKEN_SECRET,
    googleClientId: value.GOOGLE_CLIENT_ID,
    googleClientSecret: value.GOOGLE_CLIENT_SECRET,
  };
});
