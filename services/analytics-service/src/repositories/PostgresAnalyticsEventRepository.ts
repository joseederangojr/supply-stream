import { injectable } from "inversify"
import { db } from "../infrastructure/database"
import type { AnalyticsEventRepository } from "../domain/repositories/AnalyticsEventRepository"
import type { AnalyticsEvent, CreateAnalyticsEventDto } from "../domain/models/AnalyticsEvent"
import { logger } from "../utils/logger"

@injectable()
export class PostgresAnalyticsEventRepository implements AnalyticsEventRepository {
  async create(event: CreateAnalyticsEventDto): Promise<AnalyticsEvent> {
    try {
      const result = await db
        .insertInto("analytics_events")
        .values({
          type: event.type,
          user_id: event.userId || null,
          organization_id: event.organizationId || null,
          data: event.data as any,
        })
        .returning([
          "id",
          "type",
          "user_id as userId",
          "organization_id as organizationId",
          "data",
          "created_at as timestamp",
        ])
        .executeTakeFirstOrThrow()

      return result as unknown as AnalyticsEvent
    } catch (error) {
      logger.error("Error creating analytics event", {
        error: error instanceof Error ? error.message : "Unknown error",
        event,
      })
      throw error
    }
  }

  async findById(id: string): Promise<AnalyticsEvent | null> {
    try {
      const result = await db
        .selectFrom("analytics_events")
        .select([
          "id",
          "type",
          "user_id as userId",
          "organization_id as organizationId",
          "data",
          "created_at as timestamp",
        ])
        .where("id", "=", id)
        .executeTakeFirst()

      return result as unknown as AnalyticsEvent | null
    } catch (error) {
      logger.error("Error finding analytics event by ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        id,
      })
      throw error
    }
  }

  async findByType(type: string, options?: { page?: number; limit?: number }): Promise<AnalyticsEvent[]> {
    try {
      let query = db
        .selectFrom("analytics_events")
        .select([
          "id",
          "type",
          "user_id as userId",
          "organization_id as organizationId",
          "data",
          "created_at as timestamp",
        ])
        .where("type", "=", type)
        .orderBy("created_at", "desc")

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      if (options?.page && options?.limit) {
        query = query.offset((options.page - 1) * options.limit)
      }

      const result = await query.execute()
      return result as unknown as AnalyticsEvent[]
    } catch (error) {
      logger.error("Error finding analytics events by type", {
        error: error instanceof Error ? error.message : "Unknown error",
        type,
      })
      throw error
    }
  }

  async findByUserId(userId: string, options?: { page?: number; limit?: number }): Promise<AnalyticsEvent[]> {
    try {
      let query = db
        .selectFrom("analytics_events")
        .select([
          "id",
          "type",
          "user_id as userId",
          "organization_id as organizationId",
          "data",
          "created_at as timestamp",
        ])
        .where("user_id", "=", userId)
        .orderBy("created_at", "desc")

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      if (options?.page && options?.limit) {
        query = query.offset((options.page - 1) * options.limit)
      }

      const result = await query.execute()
      return result as unknown as AnalyticsEvent[]
    } catch (error) {
      logger.error("Error finding analytics events by user ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      })
      throw error
    }
  }

  async findByOrganizationId(
    organizationId: string,
    options?: { page?: number; limit?: number },
  ): Promise<AnalyticsEvent[]> {
    try {
      let query = db
        .selectFrom("analytics_events")
        .select([
          "id",
          "type",
          "user_id as userId",
          "organization_id as organizationId",
          "data",
          "created_at as timestamp",
        ])
        .where("organization_id", "=", organizationId)
        .orderBy("created_at", "desc")

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      if (options?.page && options?.limit) {
        query = query.offset((options.page - 1) * options.limit)
      }

      const result = await query.execute()
      return result as unknown as AnalyticsEvent[]
    } catch (error) {
      logger.error("Error finding analytics events by organization ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
      })
      throw error
    }
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    options?: { page?: number; limit?: number },
  ): Promise<AnalyticsEvent[]> {
    try {
      let query = db
        .selectFrom("analytics_events")
        .select([
          "id",
          "type",
          "user_id as userId",
          "organization_id as organizationId",
          "data",
          "created_at as timestamp",
        ])
        .where("created_at", ">=", startDate)
        .where("created_at", "<=", endDate)
        .orderBy("created_at", "desc")

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      if (options?.page && options?.limit) {
        query = query.offset((options.page - 1) * options.limit)
      }

      const result = await query.execute()
      return result as unknown as AnalyticsEvent[]
    } catch (error) {
      logger.error("Error finding analytics events by date range", {
        error: error instanceof Error ? error.message : "Unknown error",
        startDate,
        endDate,
      })
      throw error
    }
  }

  async countByType(type: string, startDate?: Date, endDate?: Date): Promise<number> {
    try {
      let query = db.selectFrom("analytics_events").select(db.fn.count("id").as("count")).where("type", "=", type)

      if (startDate && endDate) {
        query = query.where("created_at", ">=", startDate).where("created_at", "<=", endDate)
      }

      const result = await query.executeTakeFirstOrThrow()
      return Number(result.count)
    } catch (error) {
      logger.error("Error counting analytics events by type", {
        error: error instanceof Error ? error.message : "Unknown error",
        type,
      })
      throw error
    }
  }

  async countByOrganization(organizationId: string, startDate?: Date, endDate?: Date): Promise<number> {
    try {
      let query = db
        .selectFrom("analytics_events")
        .select(db.fn.count("id").as("count"))
        .where("organization_id", "=", organizationId)

      if (startDate && endDate) {
        query = query.where("created_at", ">=", startDate).where("created_at", "<=", endDate)
      }

      const result = await query.executeTakeFirstOrThrow()
      return Number(result.count)
    } catch (error) {
      logger.error("Error counting analytics events by organization", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
      })
      throw error
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db.deleteFrom("analytics_events").where("id", "=", id).returning("id").executeTakeFirst()

      return !!result
    } catch (error) {
      logger.error("Error deleting analytics event", {
        error: error instanceof Error ? error.message : "Unknown error",
        id,
      })
      throw error
    }
  }
}
