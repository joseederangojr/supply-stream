import type { Context, Next } from "hono"
import { RateLimiter } from "limiter"
import { logger } from "../../utils/logger"

// In-memory store for rate limiters
const ipLimiters = new Map<string, RateLimiter>()

// Rate limit configuration
const MAX_REQUESTS = 100 // Maximum requests per window
const WINDOW_MS = 60 * 1000 // 1 minute window

export const rateLimitMiddleware = async (c: Context, next: Next) => {
  const ip = c.req.header("x-forwarded-for") || "unknown"

  // Get or create rate limiter for this IP
  if (!ipLimiters.has(ip)) {
    ipLimiters.set(
      ip,
      new RateLimiter({
        tokensPerInterval: MAX_REQUESTS,
        interval: WINDOW_MS,
        fireImmediately: true,
      }),
    )
  }

  const limiter = ipLimiters.get(ip)!
  const remainingRequests = await limiter.removeTokens(1)

  // Set rate limit headers
  c.header("X-RateLimit-Limit", MAX_REQUESTS.toString())
  c.header("X-RateLimit-Remaining", Math.max(0, remainingRequests).toString())
  c.header("X-RateLimit-Reset", (Date.now() + WINDOW_MS).toString())

  if (remainingRequests < 0) {
    logger.warn("Rate limit exceeded", { ip })
    return c.json({ error: "Too many requests, please try again later" }, 429)
  }

  await next()
}

export const securityHeadersMiddleware = async (c: Context, next: Next) => {
  // Set security headers
  c.header("X-Content-Type-Options", "nosniff")
  c.header("X-Frame-Options", "DENY")
  c.header("X-XSS-Protection", "1; mode=block")
  c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  c.header("Content-Security-Policy", "default-src 'self'")
  c.header("Referrer-Policy", "no-referrer-when-downgrade")

  await next()
}

export const securityMiddleware = [rateLimitMiddleware, securityHeadersMiddleware]
