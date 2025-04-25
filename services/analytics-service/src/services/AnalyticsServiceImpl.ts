import { injectable, inject } from "inversify"
import type { AnalyticsService, TimeSeriesData, CategoryData, TopItemData } from "../domain/services/AnalyticsService"
import type { AnalyticsEventRepository } from "../domain/repositories/AnalyticsEventRepository"
import type { AnalyticsEvent, CreateAnalyticsEventDto } from "../domain/models/AnalyticsEvent"
import { AnalyticsEventType } from "../domain/models/AnalyticsEvent"
import { executeQuery } from "../infrastructure/database"
import { logger } from "../utils/logger"

@injectable()
export class AnalyticsServiceImpl implements AnalyticsService {
  constructor(
    @inject("AnalyticsEventRepository") private eventRepository: AnalyticsEventRepository
  ) { }

  async trackEvent(event: CreateAnalyticsEventDto): Promise<AnalyticsEvent> {
    try {
      return await this.eventRepository.create(event)
    } catch (error) {
      logger.error("Error tracking event", {
        error: error instanceof Error ? error.message : "Unknown error",
        event,
      })
      throw error
    }
  }

  async getEventById(id: string): Promise<AnalyticsEvent | null> {
    try {
      return await this.eventRepository.findById(id)
    } catch (error) {
      logger.error("Error getting event by ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        id,
      })
      throw error
    }
  }

  async getEventsByType(type: AnalyticsEventType, page?: number, limit?: number): Promise<AnalyticsEvent[]> {
    try {
      return await this.eventRepository.findByType(type, { page, limit })
    } catch (error) {
      logger.error("Error getting events by type", {
        error: error instanceof Error ? error.message : "Unknown error",
        type,
      })
      throw error
    }
  }

  async getEventsByUserId(userId: string, page?: number, limit?: number): Promise<AnalyticsEvent[]> {
    try {
      return await this.eventRepository.findByUserId(userId, { page, limit })
    } catch (error) {
      logger.error("Error getting events by user ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      })
      throw error
    }
  }

  async getEventsByOrganizationId(organizationId: string, page?: number, limit?: number): Promise<AnalyticsEvent[]> {
    try {
      return await this.eventRepository.findByOrganizationId(organizationId, { page, limit })
    } catch (error) {
      logger.error("Error getting events by organization ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
      })
      throw error
    }
  }

  // Dashboard metrics
  async getTotalRequests(organizationId?: string, startDate?: Date, endDate?: Date): Promise<number> {
    try {
      let query = `
        SELECT COUNT(*) as count
        FROM requests
      `

      const values: any[] = []
      let whereAdded = false

      if (organizationId) {
        query += ` WHERE client_id = $1`
        values.push(organizationId)
        whereAdded = true
      }

      if (startDate && endDate) {
        query += whereAdded ? ` AND` : ` WHERE`
        query += ` created_at BETWEEN $${values.length + 1} AND $${values.length + 2}`
        values.push(startDate, endDate)
      }

      const result = await executeQuery<{ count: string }>(query, values)
      return Number.parseInt(result[0].count, 10)
    } catch (error) {
      logger.error("Error getting total requests", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
      })
      throw error
    }
  }

  async getTotalBids(organizationId?: string, startDate?: Date, endDate?: Date): Promise<number> {
    try {
      let query = `
        SELECT COUNT(*) as count
        FROM bids
      `

      const values: any[] = []
      let whereAdded = false

      if (organizationId) {
        query += ` WHERE supplier_id = $1`
        values.push(organizationId)
        whereAdded = true
      }

      if (startDate && endDate) {
        query += whereAdded ? ` AND` : ` WHERE`
        query += ` created_at BETWEEN $${values.length + 1} AND $${values.length + 2}`
        values.push(startDate, endDate)
      }

      const result = await executeQuery<{ count: string }>(query, values)
      return Number.parseInt(result[0].count, 10)
    } catch (error) {
      logger.error("Error getting total bids", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
      })
      throw error
    }
  }

  async getAverageBidsPerRequest(organizationId?: string, startDate?: Date, endDate?: Date): Promise<number> {
    try {
      let query = `
        SELECT AVG(bid_count) as average
        FROM (
          SELECT r.id, COUNT(b.id) as bid_count
          FROM requests r
          LEFT JOIN bids b ON r.id = b.request_id
      `

      const values: any[] = []
      let whereAdded = false

      if (organizationId) {
        query += ` WHERE r.client_id = $1`
        values.push(organizationId)
        whereAdded = true
      }

      if (startDate && endDate) {
        query += whereAdded ? ` AND` : ` WHERE`
        query += ` r.created_at BETWEEN $${values.length + 1} AND $${values.length + 2}`
        values.push(startDate, endDate)
      }

      query += ` GROUP BY r.id) as request_bids`

      const result = await executeQuery<{ average: string }>(query, values)
      return Number.parseFloat(result[0].average) || 0
    } catch (error) {
      logger.error("Error getting average bids per request", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
      })
      throw error
    }
  }

  async getTotalSpend(organizationId?: string, startDate?: Date, endDate?: Date): Promise<number> {
    try {
      let query = `
        SELECT SUM(amount) as total
        FROM invoices
      `

      const values: any[] = []
      let whereAdded = false

      if (organizationId) {
        query += ` WHERE client_id = $1`
        values.push(organizationId)
        whereAdded = true
      }

      if (startDate && endDate) {
        query += whereAdded ? ` AND` : ` WHERE`
        query += ` created_at BETWEEN $${values.length + 1} AND $${values.length + 2}`
        values.push(startDate, endDate)
      }

      const result = await executeQuery<{ total: string }>(query, values)
      return Number.parseFloat(result[0].total) || 0
    } catch (error) {
      logger.error("Error getting total spend", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
      })
      throw error
    }
  }

  async getAverageTimeToAward(organizationId?: string, startDate?: Date, endDate?: Date): Promise<number> {
    try {
      let query = `
        SELECT AVG(EXTRACT(EPOCH FROM (b.updated_at - r.created_at)) / 86400) as average_days
        FROM requests r
        JOIN bids b ON r.id = b.request_id
        WHERE b.status = 'ACCEPTED'
      `

      const values: any[] = []
      let paramIndex = 1

      if (organizationId) {
        query += ` AND r.client_id = $${paramIndex}`
        values.push(organizationId)
        paramIndex++
      }

      if (startDate && endDate) {
        query += ` AND r.created_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`
        values.push(startDate, endDate)
      }

      const result = await executeQuery<{ average_days: string }>(query, values)
      return Number.parseFloat(result[0].average_days) || 0
    } catch (error) {
      logger.error("Error getting average time to award", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
      })
      throw error
    }
  }

  // Time series data
  async getRequestsOverTime(
    organizationId?: string,
    startDate?: Date,
    endDate?: Date,
    interval: "day" | "week" | "month" = "day",
  ): Promise<TimeSeriesData[]> {
    try {
      let intervalSql
      switch (interval) {
        case "week":
          intervalSql = "date_trunc('week', created_at)"
          break
        case "month":
          intervalSql = "date_trunc('month', created_at)"
          break
        default:
          intervalSql = "date_trunc('day', created_at)"
      }

      let query = `
        SELECT ${intervalSql} as date, COUNT(*) as value
        FROM requests
      `

      const values: any[] = []
      let whereAdded = false

      if (organizationId) {
        query += ` WHERE client_id = $1`
        values.push(organizationId)
        whereAdded = true
      }

      if (startDate && endDate) {
        query += whereAdded ? ` AND` : ` WHERE`
        query += ` created_at BETWEEN $${values.length + 1} AND $${values.length + 2}`
        values.push(startDate, endDate)
      }

      query += ` GROUP BY date ORDER BY date`

      return await executeQuery<TimeSeriesData>(query, values)
    } catch (error) {
      logger.error("Error getting requests over time", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
        interval,
      })
      throw error
    }
  }

  async getBidsOverTime(
    organizationId?: string,
    startDate?: Date,
    endDate?: Date,
    interval: "day" | "week" | "month" = "day",
  ): Promise<TimeSeriesData[]> {
    try {
      let intervalSql
      switch (interval) {
        case "week":
          intervalSql = "date_trunc('week', created_at)"
          break
        case "month":
          intervalSql = "date_trunc('month', created_at)"
          break
        default:
          intervalSql = "date_trunc('day', created_at)"
      }

      let query = `
        SELECT ${intervalSql} as date, COUNT(*) as value
        FROM bids
      `

      const values: any[] = []
      let whereAdded = false

      if (organizationId) {
        query += ` WHERE supplier_id = $1`
        values.push(organizationId)
        whereAdded = true
      }

      if (startDate && endDate) {
        query += whereAdded ? ` AND` : ` WHERE`
        query += ` created_at BETWEEN $${values.length + 1} AND $${values.length + 2}`
        values.push(startDate, endDate)
      }

      query += ` GROUP BY date ORDER BY date`

      return await executeQuery<TimeSeriesData>(query, values)
    } catch (error) {
      logger.error("Error getting bids over time", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
        interval,
      })
      throw error
    }
  }

  async getSpendOverTime(
    organizationId?: string,
    startDate?: Date,
    endDate?: Date,
    interval: "day" | "week" | "month" = "day",
  ): Promise<TimeSeriesData[]> {
    try {
      let intervalSql
      switch (interval) {
        case "week":
          intervalSql = "date_trunc('week', created_at)"
          break
        case "month":
          intervalSql = "date_trunc('month', created_at)"
          break
        default:
          intervalSql = "date_trunc('day', created_at)"
      }

      let query = `
        SELECT ${intervalSql} as date, SUM(amount) as value
        FROM invoices
      `

      const values: any[] = []
      let whereAdded = false

      if (organizationId) {
        query += ` WHERE client_id = $1`
        values.push(organizationId)
        whereAdded = true
      }

      if (startDate && endDate) {
        query += whereAdded ? ` AND` : ` WHERE`
        query += ` created_at BETWEEN $${values.length + 1} AND $${values.length + 2}`
        values.push(startDate, endDate)
      }

      query += ` GROUP BY date ORDER BY date`

      return await executeQuery<TimeSeriesData>(query, values)
    } catch (error) {
      logger.error("Error getting spend over time", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
        interval,
      })
      throw error
    }
  }

  // Category data
  async getSpendByCategory(
    organizationId?: string,
    startDate?: Date,
    endDate?: Date,
    limit = 10,
  ): Promise<CategoryData[]> {
    try {
      let query = `
        SELECT i.category as category, SUM(ib.total_price) as value
        FROM items i
        JOIN item_bids ib ON i.id = ib.item_id
        JOIN bids b ON ib.bid_id = b.id
        WHERE b.status = 'ACCEPTED'
      `

      const values: any[] = []
      let paramIndex = 1

      if (organizationId) {
        query += ` AND b.client_id = $${paramIndex}`
        values.push(organizationId)
        paramIndex++
      }

      if (startDate && endDate) {
        query += ` AND b.created_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`
        values.push(startDate, endDate)
        paramIndex += 2
      }

      query += ` GROUP BY i.category ORDER BY value DESC LIMIT $${paramIndex}`
      values.push(limit)

      return await executeQuery<CategoryData>(query, values)
    } catch (error) {
      logger.error("Error getting spend by category", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
      })
      throw error
    }
  }

  async getBidsByCategory(
    organizationId?: string,
    startDate?: Date,
    endDate?: Date,
    limit = 10,
  ): Promise<CategoryData[]> {
    try {
      let query = `
        SELECT i.category as category, COUNT(DISTINCT b.id) as value
        FROM items i
        JOIN requests r ON i.request_id = r.id
        JOIN bids b ON r.id = b.request_id
      `

      const values: any[] = []
      let whereAdded = false

      if (organizationId) {
        query += ` WHERE b.supplier_id = $1`
        values.push(organizationId)
        whereAdded = true
      }

      if (startDate && endDate) {
        query += ` AND b.created_at BETWEEN $${values.length + 1} AND $${values.length + 2}`
        values.push(startDate, endDate)
      }

      query += ` GROUP BY i.category ORDER BY value DESC LIMIT $${values.length + 1}`
      values.push(limit)

      return await executeQuery<CategoryData>(query, values)
    } catch (error) {
      logger.error("Error getting bids by category", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
      })
      throw error
    }
  }

  // Top items
  async getTopSuppliers(organizationId?: string, startDate?: Date, endDate?: Date, limit = 10): Promise<TopItemData[]> {
    try {
      let query = `
        SELECT o.id, o.name, COUNT(b.id) as value
        FROM organizations o
        JOIN bids b ON o.id = b.supplier_id
        JOIN requests r ON b.request_id = r.id
      `

      const values: any[] = []
      let whereAdded = false

      if (organizationId) {
        query += ` WHERE r.client_id = $1`
        values.push(organizationId)
        whereAdded = true
      }

      if (startDate && endDate) {
        query += ` AND b.created_at BETWEEN $${values.length + 1} AND $${values.length + 2}`
        values.push(startDate, endDate)
      }

      query += ` GROUP BY o.id, o.name ORDER BY value DESC LIMIT $${values.length + 1}`
      values.push(limit)

      return await executeQuery<TopItemData>(query, values)
    } catch (error) {
      logger.error("Error getting top suppliers", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
      })
      throw error
    }
  }

  async getTopClients(startDate?: Date, endDate?: Date, limit = 10): Promise<TopItemData[]> {
    try {
      let query = `
        SELECT o.id, o.name, COUNT(r.id) as value
        FROM organizations o
        JOIN requests r ON o.id = r.client_id
      `

      const values: any[] = []

      if (startDate && endDate) {
        query += ` WHERE r.created_at BETWEEN $1 AND $2`
        values.push(startDate, endDate)
      }

      query += ` GROUP BY o.id, o.name ORDER BY value DESC LIMIT $${values.length + 1}`
      values.push(limit)

      return await executeQuery<TopItemData>(query, values)
    } catch (error) {
      logger.error("Error getting top clients", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      throw error
    }
  }

  async getTopCategories(
    organizationId?: string,
    startDate?: Date,
    endDate?: Date,
    limit = 10,
  ): Promise<TopItemData[]> {
    try {
      let query = `
        SELECT i.category as id, i.category as name, COUNT(i.id) as value
        FROM items i
        JOIN requests r ON i.request_id = r.id
      `

      const values: any[] = []
      let whereAdded = false

      if (organizationId) {
        query += ` WHERE r.client_id = $1`
        values.push(organizationId)
        whereAdded = true
      }

      if (startDate && endDate) {
        query += ` AND r.created_at BETWEEN $${values.length + 1} AND $${values.length + 2}`
        values.push(startDate, endDate)
      }

      query += ` GROUP BY i.category ORDER BY value DESC LIMIT $${values.length + 1}`
      values.push(limit)

      return await executeQuery<TopItemData>(query, values)
    } catch (error) {
      logger.error("Error getting top categories", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
      })
      throw error
    }
  }

  // Geographic data
  async getRequestsByLocation(organizationId?: string, startDate?: Date, endDate?: Date): Promise<any> {
    try {
      let query = `
        SELECT r.delivery_latitude as latitude, r.delivery_longitude as longitude, COUNT(r.id) as count
        FROM requests r
      `

      const values: any[] = []
      let whereAdded = false

      if (organizationId) {
        query += ` WHERE r.client_id = $1`
        values.push(organizationId)
        whereAdded = true
      }

      if (startDate && endDate) {
        query += ` AND r.created_at BETWEEN $${values.length + 1} AND $${values.length + 2}`
        values.push(startDate, endDate)
      }

      query += ` GROUP BY r.delivery_latitude, r.delivery_longitude`

      return await executeQuery(query, values)
    } catch (error) {
      logger.error("Error getting requests by location", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
      })
      throw error
    }
  }

  async getSuppliersByLocation(organizationId?: string, startDate?: Date, endDate?: Date): Promise<any> {
    try {
      let query = `
        SELECT o.latitude, o.longitude, COUNT(DISTINCT o.id) as count
        FROM organizations o
        JOIN bids b ON o.id = b.supplier_id
      `

      const values: any[] = []
      let whereAdded = false

      if (organizationId) {
        query += ` WHERE b.client_id = $1`
        values.push(organizationId)
        whereAdded = true
      }

      if (startDate && endDate) {
        query += ` AND b.created_at BETWEEN $${values.length + 1} AND $${values.length + 2}`
        values.push(startDate, endDate)
      }

      query += ` GROUP BY o.latitude, o.longitude`

      return await executeQuery(query, values)
    } catch (error) {
      logger.error("Error getting suppliers by location", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
      })
      throw error
    }
  }

  // Process message from service bus
  async processMessage(messageType: string, messageData: any): Promise<void> {
    try {
      logger.info("Processing message", {
        messageType,
        data: messageData,
      })

      switch (messageType) {
        case "analytics.request.created":
          await this.handleRequestCreated(messageData)
          break
        case "analytics.request.updated":
          await this.handleRequestUpdated(messageData)
          break
        case "analytics.bid.submitted":
          await this.handleBidSubmitted(messageData)
          break
        case "analytics.bid.status_changed":
          await this.handleBidStatusChanged(messageData)
          break
        case "analytics.user.registered":
          await this.handleUserRegistered(messageData)
          break
        case "analytics.user.login":
          await this.handleUserLogin(messageData)
          break
        case "analytics.invoice.created":
          await this.handleInvoiceCreated(messageData)
          break
        case "analytics.invoice.paid":
          await this.handleInvoicePaid(messageData)
          break
        default:
          logger.warn("Unknown message type", { messageType })
      }
    } catch (error) {
      logger.error("Error processing message", {
        error: error instanceof Error ? error.message : "Unknown error",
        messageType,
      })
    }
  }

  private async handleRequestCreated(data: any): Promise<void> {
    const { requestId, clientId, userId } = data.data

    await this.trackEvent({
      type: AnalyticsEventType.REQUEST_CREATED,
      userId,
      organizationId: clientId,
      data: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    })
  }

  private async handleRequestUpdated(data: any): Promise<void> {
    const { requestId, clientId, userId, status } = data.data

    await this.trackEvent({
      type: AnalyticsEventType.REQUEST_UPDATED,
      userId,
      organizationId: clientId,
      data: {
        requestId,
        status,
        timestamp: new Date().toISOString(),
      },
    })
  }

  private async handleBidSubmitted(data: any): Promise<void> {
    const { bidId, requestId, supplierId, userId } = data.data

    await this.trackEvent({
      type: AnalyticsEventType.BID_SUBMITTED,
      userId,
      organizationId: supplierId,
      data: {
        bidId,
        requestId,
        timestamp: new Date().toISOString(),
      },
    })
  }

  private async handleBidStatusChanged(data: any): Promise<void> {
    const { bidId, requestId, supplierId, userId, status } = data.data

    const eventType =
      status === "ACCEPTED"
        ? AnalyticsEventType.BID_ACCEPTED
        : status === "REJECTED"
          ? AnalyticsEventType.BID_REJECTED
          : AnalyticsEventType.BID_UPDATED

    await this.trackEvent({
      type: eventType,
      userId,
      organizationId: supplierId,
      data: {
        bidId,
        requestId,
        status,
        timestamp: new Date().toISOString(),
      },
    })
  }

  private async handleUserRegistered(data: any): Promise<void> {
    const { userId, organizationId } = data.data

    await this.trackEvent({
      type: AnalyticsEventType.USER_REGISTERED,
      userId,
      organizationId,
      data: {
        timestamp: new Date().toISOString(),
      },
    })
  }

  private async handleUserLogin(data: any): Promise<void> {
    const { userId, organizationId } = data.data

    await this.trackEvent({
      type: AnalyticsEventType.USER_LOGIN,
      userId,
      organizationId,
      data: {
        timestamp: new Date().toISOString(),
      },
    })
  }

  private async handleInvoiceCreated(data: any): Promise<void> {
    const { invoiceId, bidId, clientId, supplierId, amount } = data.data

    await this.trackEvent({
      type: AnalyticsEventType.INVOICE_CREATED,
      organizationId: supplierId,
      data: {
        invoiceId,
        bidId,
        clientId,
        amount,
        timestamp: new Date().toISOString(),
      },
    })
  }

  private async handleInvoicePaid(data: any): Promise<void> {
    const { invoiceId, bidId, clientId, supplierId, amount } = data.data

    await this.trackEvent({
      type: AnalyticsEventType.INVOICE_PAID,
      organizationId: supplierId,
      data: {
        invoiceId,
        bidId,
        clientId,
        amount,
        timestamp: new Date().toISOString(),
      },
    })
  }
}
