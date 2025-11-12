import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { config } from '@infrastructure/config';
import fs from 'fs';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

winston.addColors(logColors);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logs directory if it doesn't exist
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Daily rotating file transports for production
const dailyRotateFileTransport = new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: jsonFormat,
  level: 'info',
});

const dailyRotateErrorTransport = new DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: jsonFormat,
  level: 'error',
});

// Choose transports based on environment
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: config.logging.format === 'json' ? jsonFormat : consoleFormat,
  }),
];

// Add file transports in production
if (config.nodeEnv === 'production') {
  transports.push(dailyRotateFileTransport);
  transports.push(dailyRotateErrorTransport);
} else {
  // Development: use simple file transports
  transports.push(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  );
}

export const logger = winston.createLogger({
  level: config.logging.level,
  levels: logLevels,
  format: config.logging.format === 'json' ? jsonFormat : consoleFormat,
  transports,
});
