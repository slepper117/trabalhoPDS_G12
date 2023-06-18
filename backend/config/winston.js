import { createLogger, transports, format } from 'winston';

const { combine, errors, json, prettyPrint, timestamp } = format;

// Standart Formatter
const logFormat = combine(timestamp(), json());

// Pretty Formatter
const logPretty = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  prettyPrint()
);

// Logger Transporters
const logTransports = [
  new transports.File({
    filename: 'logs/all.log',
  }),
  new transports.File({
    level: 'warn',
    filename: 'logs/errors.log',
  }),
  new transports.File({
    filename: 'logs/pretty.log',
    level: 'warn',
    format: logPretty,
  }),
];

// Creates a new Logger
const logger = createLogger({
  level: 'http',
  format: logFormat,
  transports: logTransports,
  silent: process.env.NODE_ENV === 'test',
  exceptionHandlers: [
    new transports.File({ filename: 'logs/handlers/exceptions.log' }),
  ],
  rejectionHandlers: [
    new transports.File({ filename: 'logs/handlers/rejections.log' }),
  ],
  exitOnError: false,
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

// If in development envoirement, add the console logger
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      level: 'warn',
      format: logPretty,
    })
  );
}

export default logger;
