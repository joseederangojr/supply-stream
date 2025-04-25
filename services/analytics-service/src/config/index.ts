import dotenv from "dotenv"
import path from "path"

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") })

export const config = {
  serviceName: "analytics-service",
  environment: process.env.NODE_ENV || "development",
  port: Number.parseInt(process.env.PORT || "3004", 10),

  database: {
    host: process.env.DB_HOST || "localhost",
    port: Number.parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "procurement",
    ssl: process.env.DB_SSL === "true",
    max: Number.parseInt(process.env.DB_POOL_MAX || "20", 10),
    idleTimeoutMillis: Number.parseInt(process.env.DB_IDLE_TIMEOUT || "30000", 10),
  },

  azure: {
    servicebus: {
      connectionString: process.env.AZURE_SERVICEBUS_CONNECTION_STRING || "",
      queueName: process.env.AZURE_SERVICEBUS_QUEUE_NAME || "analytics",
    },
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET || "your-secret-key",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  },

  services: {
    procurement: process.env.PROCUREMENT_SERVICE_URL || "http://localhost:3001",
    auth: process.env.AUTH_SERVICE_URL || "http://localhost:3002",
    bidding: process.env.BIDDING_SERVICE_URL || "http://localhost:3003",
  },

  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
}
