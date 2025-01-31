import winston from 'winston';
import { format } from 'winston';

const { combine, timestamp, printf, colorize, errors } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  defaultMeta: { service: 'bot-service' },
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(colorize(), logFormat),
  }));
}

export default logger;

export const logError = (error: Error, additionalInfo?: object) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...additionalInfo,
  });
};

export const logInfo = (message: string, additionalInfo?: object) => {
  logger.info({
    message,
    ...additionalInfo,
  });
};

export const logWarning = (message: string, additionalInfo?: object) => {
  logger.warn({
    message,
    ...additionalInfo,
  });
};
