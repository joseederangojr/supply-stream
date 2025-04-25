import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "./utils/logger"
import { config } from "./config"
import { authRoutes } from "./api/routes/authRoutes"
import { userRoutes } from "./api/routes/userRoutes"
import { errorMiddleware } from "./api/middleware/errorMiddleware"
import { securityMiddleware } from "./api/middleware/securityMiddleware"

const app = new Hono()

// Middleware
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  }),
)

// Apply security middleware
app.use("*", securityMiddleware)

// Health check
app.get("/health", (c) => c.json({ status: "ok" }))

// API routes
app.route("/api/v1/auth", authRoutes)
app.route("/api/v1/users", userRoutes)

// Error handling
app.use("*", errorMiddleware)

// Start the server
const port = config.port || 3000
app.listen(port, () => {
  logger.info(`Auth service listening on port ${port}`)
})

export default app
