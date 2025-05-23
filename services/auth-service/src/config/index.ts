import dotenv from "dotenv"

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== "production") {
  dotenv.config()
}

export const config = {
  environment: process.env.NODE_ENV || "development",
  serviceName: process.env.SERVICE_NAME || "auth-service",
  port: process.env.PORT || "3010",

  database: {
    host: process.env.DB_HOST || "localhost",
    port: Number.parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    name: process.env.DB_NAME || "auth",
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET || "dev-secret",
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || "15m",
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    saltRounds: Number.parseInt(process.env.SALT_ROUNDS || "10", 10),
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
