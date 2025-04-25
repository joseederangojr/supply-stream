import winston from "winston"
import { config } from "../config"

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
)

// Create logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: config.serviceName },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
})

// Add file transports in production
if (config.environment === "production") {
  logger.add(new winston.transports.File({ filename: "logs/error.log", level: "error" }))
  logger.add(new winston.transports.File({ filename: "logs/combined.log" }))
}
