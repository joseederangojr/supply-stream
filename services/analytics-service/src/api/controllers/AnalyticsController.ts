import type { Request, Response } from "express"
import { injectable, inject } from "inversify"
import type { AnalyticsService } from "../../domain/services/AnalyticsService"
import { logger } from "../../utils/logger"

@injectable()
export class AnalyticsController {
  private analyticsService: AnalyticsService

  constructor(
    @inject("AnalyticsService") analyticsService: AnalyticsService
  ) {
    this.analyticsService = analyticsService
  }

  // Dashboard metrics
  getTotalRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId } = req.params
      const { startDate, endDate } = req.query

      const total = await this.analyticsService.getTotalRequests(
        organizationId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      )

      res.json({ total })
    } catch (error) {
      logger.error("Error getting total requests", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      res.status(500).json({ error: "Failed to get total requests" })
    }
  }

  getTotalBids = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId } = req.params
      const { startDate, endDate } = req.query

      const total = await this.analyticsService.getTotalBids(
        organizationId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      )

      res.json({ total })
    } catch (error) {
      logger.error("Error getting total bids", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      res.status(500).json({ error: "Failed to get total bids" })
    }
  }

  getAverageBidsPerRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId } = req.params
      const { startDate, endDate } = req.query

      const average = await this.analyticsService.getAverageBidsPerRequest(
        organizationId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      )

      res.json({ average })
    } catch (error) {
      logger.error("Error getting average bids per request", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      res.status(500).json({ error: "Failed to get average bids per request" })
    }
  }

  getTotalSpend = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId } = req.params
      const { startDate, endDate } = req.query

      const total = await this.analyticsService.getTotalSpend(
        organizationId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      )

      res.json({ total })
    } catch (error) {
      logger.error("Error getting total spend", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      res.status(500).json({ error: "Failed to get total spend" })
    }
  }

  getAverageTimeToAward = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId } = req.params
      const { startDate, endDate } = req.query

      const average = await this.analyticsService.getAverageTimeToAward(
        organizationId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      )

      res.json({ average })
    } catch (error) {
      logger.error("Error getting average time to award", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      res.status(500).json({ error: "Failed to get average time to award" })
    }
  }

  // Time series data
  getRequestsOverTime = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId } = req.params
      const { startDate, endDate, interval } = req.query

      const data = await this.analyticsService.getRequestsOverTime(
        organizationId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        interval as "day" | "week" | "month" | undefined,
      )

      res.json(data)
    } catch (error) {
      logger.error("Error getting requests over time", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      res.status(500).json({ error: "Failed to get requests over time" })
    }
  }

  getBidsOverTime = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId } = req.params
      const { startDate, endDate, interval } = req.query

      const data = await this.analyticsService.getBidsOverTime(
        organizationId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        interval as "day" | "week" | "month" | undefined,
      )

      res.json(data)
    } catch (error) {
      logger.error("Error getting bids over time", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      res.status(500).json({ error: "Failed to get bids over time" })
    }
  }

  getSpendOverTime = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId } = req.params
      const { startDate, endDate, interval } = req.query

      const data = await this.analyticsService.getSpendOverTime(
        organizationId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        interval as "day" | "week" | "month" | undefined,
      )

      res.json(data)
    } catch (error) {
      logger.error("Error getting spend over time", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      res.status(500).json({ error: "Failed to get spend over time" })
    }
  }

  // Category data
  getSpendByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId } = req.params
      const { startDate, endDate, limit } = req.query

      const data = await this.analyticsService.getSpendByCategory(
        organizationId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        limit ? Number.parseInt(limit as string, 10) : undefined,
      )

      res.json(data)
    } catch (error) {
      logger.error("Error getting spend by category", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      res.status(500).json({ error: "Failed to get spend by category" })
    }
  }

  getBidsByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId } = req.params
      const { startDate, endDate, limit } = req.query

      const data = await this.analyticsService.getBidsByCategory(
        organizationId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        limit ? Number.parseInt(limit as string, 10) : undefined,
      )

      res.json(data)
    } catch (error) {
      logger.error("Error getting bids by category", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      res.status(500).json({ error: "Failed to get bids by category" })
    }
  }

  // Top items
  getTopSuppliers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId } = req.params
      const { startDate, endDate, limit } = req.query

      const data = await this.analyticsService.getTopSuppliers(
        organizationId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        limit ? Number.parseInt(limit as string, 10) : undefined,
      )

      res.json(data)
    } catch (error) {
      logger.error("Error getting top suppliers", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      res.status(500).json({ error: "Failed to get top suppliers" })
    }
  }

  getTopClients = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate, limit } = req.query

      const data = await this.analyticsService.getTopClients(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        limit ? Number.parseInt(limit as string, 10) : undefined,
      )

      res.json(data)
    } catch (error) {
      logger.error("Error getting top clients", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      res.status(500).json({ error: "Failed to get top clients" })
    }
  }

  getTopCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId } = req.params
      const { startDate, endDate, limit } = req.query

      const data = await this.analyticsService.getTopCategories(
        organizationId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        limit ? Number.parseInt(limit as string, 10) : undefined,
      )

      res.json(data)
    } catch (error) {
      logger.error("Error getting top categories", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      res.status(500).json({ error: "Failed to get top categories" })
    }
  }

  // Geographic data
  getRequestsByLocation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId } = req.params
      const { startDate, endDate } = req.query

      const data = await this.analyticsService.getRequestsByLocation(
        organizationId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      )

      res.json(data)
    } catch (error) {
      logger.error("Error getting requests by location", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      res.status(500).json({ error: "Failed to get requests by location" })
    }
  }

  getSuppliersByLocation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId } = req.params
      const { startDate, endDate } = req.query

      const data = await this.analyticsService.getSuppliersByLocation(
        organizationId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      )

      res.json(data)
    } catch (error) {
      logger.error("Error getting suppliers by location", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      res.status(500).json({ error: "Failed to get suppliers by location" })
    }
  }
}
