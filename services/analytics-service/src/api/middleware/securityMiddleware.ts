import type { Request, Response, NextFunction } from "express"
import rateLimit from "express-rate-limit"
import helmet from "helmet"
import { config } from "../../config"
import { logger } from "../../utils/logger"

// Rate limiting middleware
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn("Rate limit exceeded", {
      ip: req.ip,
      path: req.path,
    })

    res.status(429).json({
      error: "Too many requests, please try again later.",
    })
  },
})

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: "same-origin" },
})

// CORS validation middleware
export const validateCorsOrigin = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin

  if (!origin || config.cors.origin === "*") {
    return next()
  }

  const allowedOrigins = Array.isArray(config.cors.origin) ? config.cors.origin : [config.cors.origin]

  if (!allowedOrigins.includes(origin)) {
    logger.warn("Invalid CORS origin", {
      origin,
      ip: req.ip,
      path: req.path,
    })

    return res.status(403).json({
      error: "CORS not allowed",
    })
  }

  next()
}

// Request validation middleware
export const validateRequestBody = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.body)
      req.body = result
      next()
    } catch (error) {
      logger.warn("Invalid request body", {
        error,
        path: req.path,
        body: req.body,
      })

      res.status(400).json({
        error: "Invalid request data",
        details: error instanceof Error ? error.message : "Validation error",
      })
    }
  }
}
