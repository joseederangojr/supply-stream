import type { Context, Next } from "hono"
import { verify } from "jsonwebtoken"
import { config } from "../../config"
import { logger } from "../../utils/logger"

export async function authMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    const token = authHeader.split(" ")[1]

    try {
      const decoded = verify(token, config.auth.jwtSecret)
      c.set("user", decoded)
    } catch (error) {
      logger.warn("Invalid JWT token", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      return c.json({ error: "Unauthorized" }, 401)
    }

    await next()
  } catch (error) {
    logger.error("Error in auth middleware", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return c.json({ error: "Internal Server Error" }, 500)
  }
}
