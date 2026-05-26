'use strict';

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const isDevelopment = process.env.NODE_ENV !== 'production';

const logDir = path.join(process.cwd(), 'logs');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

const transports = [];

// Console transport (colorized, development only)
if (isDevelopment) {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug',
    })
  );
} else {
  transports.push(
    new winston.transports.Console({
      format: logFormat,
      level: 'info',
    })
  );
}

// Daily rotate file for error logs
transports.push(
  new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: logFormat,
    maxSize: '20m',
    maxFiles: '30d',
    zippedArchive: true,
  })
);

// Daily rotate file for combined logs
transports.push(
  new DailyRotateFile({
    filename: path.join(logDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'info',
    format: logFormat,
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true,
  })
);

const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: logFormat,
  transports,
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
    }),
  ],
  exitOnError: false,
});

module.exports = logger;
