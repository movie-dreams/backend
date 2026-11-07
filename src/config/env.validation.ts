import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  PORT: Joi.number().default(3000),
  CORS: Joi.string().default('*'),
  JWT_SECRET: Joi.string().min(10).required(),
  JWT_EXPIRES_IN: Joi.string().default('2h'),
});
