import * as winston from "winston"
import { config } from "../config"

const logLevel = config.environment === "production" ? "info" : "debug"

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  defaultMeta: { service: config.serviceName },
  transports: [new winston.transports.Console()],
})
