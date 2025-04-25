import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { createContainer } from "./infrastructure/di/container"
import { createRequestRoutes } from "./api/routes/requestRoutes"
import { createItemRoutes } from "./api/routes/itemRoutes"
import { errorMiddleware } from "./api/middleware/errorMiddleware"
import { config } from "./config"
import { closeDatabase } from "./infrastructure/database"
import { closeServiceBusConnections } from "./infrastructure/messaging/serviceBus"
import { logger } from "./utils/logger"
import * as Sentry from "@sentry/node"

// Initialize Sentry for error tracking if DSN is provided
if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.environment,
  })
}

// Set up dependency injection
const container = createContainer()

// Create main application
const app = new Hono()

// Add global middleware
app.use("*", errorMiddleware)

// Mount routes
app.route("", createRequestRoutes(container.requestController))
app.route("", createItemRoutes(container.itemController))

// Health check endpoint
app.get("/health", (c) => c.json({ status: "ok" }))

// Start the server
const port = Number.parseInt(config.port, 10)
const server = serve(
  {
    fetch: app.fetch,
    port,
  },
  () => {
    logger.info(`Server running on port ${port}`)
  },
)

// Handle graceful shutdown
const shutdown = async () => {
  logger.info("Shutting down gracefully...")

  // Close the HTTP server
  server.close(() => {
    logger.info("HTTP server closed")
  })

  // Close database connections
  await closeDatabase()

  // Close service bus connections
  await closeServiceBusConnections()

  process.exit(0)
}

process.on("SIGTERM", shutdown)
process.on("SIGINT", shutdown)
