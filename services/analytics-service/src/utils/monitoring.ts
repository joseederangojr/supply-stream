import * as Sentry from "@sentry/node"
import { ProfilingIntegration } from "@sentry/profiling-node"
import { config } from "../config"
import { logger } from "./logger"

export function initializeMonitoring(): void {
  if (config.sentry.dsn) {
    Sentry.init({
      dsn: config.sentry.dsn,
      environment: config.environment,
      integrations: [new ProfilingIntegration()],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    })

    logger.info("Sentry monitoring initialized")
  } else {
    logger.warn("Sentry DSN not provided, monitoring not initialized")
  }
}

export function captureException(error: Error, context?: Record<string, any>): void {
  logger.error("Error captured", { error: error.message, stack: error.stack, ...context })

  if (config.sentry.dsn) {
    Sentry.captureException(error, {
      extra: context,
    })
  }
}

export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: Record<string, any>,
): void {
  logger.info(message, context)

  if (config.sentry.dsn) {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    })
  }
}

export function startTransaction(name: string, op: string): Sentry.Transaction {
  if (config.sentry.dsn) {
    return Sentry.startTransaction({
      name,
      op,
    })
  }

  // Return a dummy transaction if Sentry is not initialized
  return {
    finish: () => {},
    setTag: () => ({}) as any,
    setData: () => ({}) as any,
  } as Sentry.Transaction
}
