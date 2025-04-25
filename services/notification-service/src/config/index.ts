import dotenv from "dotenv"

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== "production") {
  dotenv.config()
}

export const config = {
  environment: process.env.NODE_ENV || "development",
  serviceName: process.env.SERVICE_NAME || "notification-service",
  port: process.env.PORT || "3004",

  database: {
    host: process.env.DB_HOST || "localhost",
    port: Number.parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    name: process.env.DB_NAME || "notification",
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET || "dev-secret",
    tokenExpiry: process.env.TOKEN_EXPIRY || "1d",
  },

  sentry: {
    dsn: process.env.SENTRY_DSN || "",
  },

  azure: {
    servicebus: {
      connectionString: process.env.AZURE_SERVICEBUS_CONNECTION_STRING || "",
      queueName: process.env.AZURE_SERVICEBUS_QUEUE_NAME || "",
    },
  },

  email: {
    host: process.env.EMAIL_HOST || "smtp.example.com",
    port: Number.parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER || "",
      pass: process.env.EMAIL_PASSWORD || "",
    },
    from: process.env.EMAIL_FROM || "noreply@supplystream.example.com",
  },

  services: {
    auth: process.env.AUTH_SERVICE_URL || "http://localhost:3010",
    procurement: process.env.PROCUREMENT_SERVICE_URL || "http://localhost:3001",
    bidding: process.env.BIDDING_SERVICE_URL || "http://localhost:3002",
  },
}

// Validate required configuration
function validateConfig() {
  const requiredVars = ["database.host", "database.user", "database.password", "database.name", "auth.jwtSecret"]

  // In production, ensure all required variables are set
  if (config.environment === "production") {
    const missingVars = requiredVars.filter((path) => {
      const value = path.split(".").reduce((obj, key) => obj[key], config as any)
      return !value
    })

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`)
    }
  }
}

// Call validation in production
if (config.environment === "production") {
  validateConfig()
}
