import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  API_VERSION: Joi.string().default('v1'),

  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_POOL_MIN: Joi.number().default(2),
  DATABASE_POOL_MAX: Joi.number().default(10),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').default(''),
  REDIS_DB: Joi.number().default(0),

  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  BCRYPT_ROUNDS: Joi.number().default(10),
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),

  SOCKET_CORS_ORIGIN: Joi.string().required(),
  SOCKET_PING_TIMEOUT: Joi.number().default(30000),
  SOCKET_PING_INTERVAL: Joi.number().default(25000),

  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  LOG_FORMAT: Joi.string().valid('json', 'simple').default('json'),

  MAX_RECONNECTION_TIME: Joi.number().default(60000),
  MATCHMAKING_TIMEOUT: Joi.number().default(120000),
  GAME_TURN_TIMEOUT: Joi.number().default(60000),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  apiVersion: envVars.API_VERSION,

  database: {
    host: envVars.DATABASE_HOST,
    port: envVars.DATABASE_PORT,
    name: envVars.DATABASE_NAME,
    user: envVars.DATABASE_USER,
    password: envVars.DATABASE_PASSWORD,
    poolMin: envVars.DATABASE_POOL_MIN,
    poolMax: envVars.DATABASE_POOL_MAX,
  },

  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    password: envVars.REDIS_PASSWORD,
    db: envVars.REDIS_DB,
  },

  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    refreshExpiresIn: envVars.JWT_REFRESH_EXPIRES_IN,
  },

  security: {
    bcryptRounds: envVars.BCRYPT_ROUNDS,
    rateLimitWindowMs: envVars.RATE_LIMIT_WINDOW_MS,
    rateLimitMaxRequests: envVars.RATE_LIMIT_MAX_REQUESTS,
  },

  socket: {
    corsOrigin: envVars.SOCKET_CORS_ORIGIN,
    pingTimeout: envVars.SOCKET_PING_TIMEOUT,
    pingInterval: envVars.SOCKET_PING_INTERVAL,
  },

  logging: {
    level: envVars.LOG_LEVEL,
    format: envVars.LOG_FORMAT,
  },

  game: {
    maxReconnectionTime: envVars.MAX_RECONNECTION_TIME,
    matchmakingTimeout: envVars.MATCHMAKING_TIMEOUT,
    gameTurnTimeout: envVars.GAME_TURN_TIMEOUT,
  },
};
