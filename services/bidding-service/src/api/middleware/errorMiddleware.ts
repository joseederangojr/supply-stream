import type { Context, Next } from "hono"
import * as Sentry from "@sentry/node"
import { logger } from "../../utils/logger"

export async function errorMiddleware(c: Context, next: Next) {
  try {
    await next()
  } catch (error) {
    // Capture exception in Sentry if configured
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(error)
    }

    // Log the error
    logger.error("Unhandled error", {
      error: {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      path: c.req.path,
      method: c.req.method,
    })

    // Return error response
    return c.json(
      {
        error: "Internal Server Error",
        requestId: c.get("requestId") || "unknown",
      },
      500,
    )
  }
}
