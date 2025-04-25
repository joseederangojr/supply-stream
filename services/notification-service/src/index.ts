import { createServer } from "http"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "./utils/logger"
import { config } from "./config"
import { notificationRoutes } from "./api/routes/notificationRoutes"
import { errorMiddleware } from "./api/middleware/errorMiddleware"
import { initializeWebSocketServer } from "./infrastructure/websocket"

const app = new Hono()

// Middleware
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  }),
)

// Health check
app.get("/health", (c) => c.json({ status: "ok" }))

// API routes
app.route("/api/v1/notifications", notificationRoutes)

// Error handling
app.use("*", errorMiddleware)

// Create HTTP server
const server = createServer()

// Initialize WebSocket server
initializeWebSocketServer(server)

// Start the server
const port = config.port || 3000
server.listen(port, () => {
  logger.info(`Notification service listening on port ${port}`)
})

export default app
