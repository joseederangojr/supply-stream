import { injectable } from "inversify"
import { db } from "../infrastructure/database"
import type { ReportRepository } from "../domain/repositories/ReportRepository"
import type { Report, CreateReportDto, ReportStatus } from "../domain/models/Report"
import { logger } from "../utils/logger"

@injectable()
export class PostgresReportRepository implements ReportRepository {
  async create(report: CreateReportDto): Promise<Report> {
    try {
      const result = await db
        .insertInto("reports")
        .values({
          type: report.type,
          format: report.format,
          parameters: report.parameters as any,
          created_by: report.createdBy,
          status: "PENDING" as ReportStatus,
        })
        .returning([
          "id",
          "type",
          "format",
          "parameters",
          "created_by as createdBy",
          "status",
          "created_at as createdAt",
          "completed_at as completedAt",
          "url",
          "error",
        ])
        .executeTakeFirstOrThrow()

      return result as unknown as Report
    } catch (error) {
      logger.error("Error creating report", {
        error: error instanceof Error ? error.message : "Unknown error",
        report,
      })
      throw error
    }
  }

  async findById(id: string): Promise<Report | null> {
    try {
      const result = await db
        .selectFrom("reports")
        .select([
          "id",
          "type",
          "format",
          "parameters",
          "created_by as createdBy",
          "status",
          "created_at as createdAt",
          "completed_at as completedAt",
          "url",
          "error",
        ])
        .where("id", "=", id)
        .executeTakeFirst()

      return result as unknown as Report | null
    } catch (error) {
      logger.error("Error finding report by ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        id,
      })
      throw error
    }
  }

  async findByUserId(userId: string, options?: { page?: number; limit?: number }): Promise<Report[]> {
    try {
      let query = db
        .selectFrom("reports")
        .select([
          "id",
          "type",
          "format",
          "parameters",
          "created_by as createdBy",
          "status",
          "created_at as createdAt",
          "completed_at as completedAt",
          "url",
          "error",
        ])
        .where("created_by", "=", userId)
        .orderBy("created_at", "desc")

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      if (options?.page && options?.limit) {
        query = query.offset((options.page - 1) * options.limit)
      }

      const result = await query.execute()
      return result as unknown as Report[]
    } catch (error) {
      logger.error("Error finding reports by user ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      })
      throw error
    }
  }

  async findByOrganizationId(organizationId: string, options?: { page?: number; limit?: number }): Promise<Report[]> {
    try {
      let query = db
        .selectFrom("reports as r")
        .innerJoin("users as u", "r.created_by", "u.id")
        .select([
          "r.id",
          "r.type",
          "r.format",
          "r.parameters",
          "r.created_by as createdBy",
          "r.status",
          "r.created_at as createdAt",
          "r.completed_at as completedAt",
          "r.url",
          "r.error",
        ])
        .where("u.organization_id", "=", organizationId)
        .orderBy("r.created_at", "desc")

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      if (options?.page && options?.limit) {
        query = query.offset((options.page - 1) * options.limit)
      }

      const result = await query.execute()
      return result as unknown as Report[]
    } catch (error) {
      logger.error("Error finding reports by organization ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
      })
      throw error
    }
  }

  async findByStatus(status: ReportStatus, options?: { page?: number; limit?: number }): Promise<Report[]> {
    try {
      let query = db
        .selectFrom("reports")
        .select([
          "id",
          "type",
          "format",
          "parameters",
          "created_by as createdBy",
          "status",
          "created_at as createdAt",
          "completed_at as completedAt",
          "url",
          "error",
        ])
        .where("status", "=", status)
        .orderBy("created_at", "desc")

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      if (options?.page && options?.limit) {
        query = query.offset((options.page - 1) * options.limit)
      }

      const result = await query.execute()
      return result as unknown as Report[]
    } catch (error) {
      logger.error("Error finding reports by status", {
        error: error instanceof Error ? error.message : "Unknown error",
        status,
      })
      throw error
    }
  }

  async updateStatus(id: string, status: ReportStatus, url?: string, error?: string): Promise<boolean> {
    try {
      let query = db.updateTable("reports").set({ status }).where("id", "=", id)

      if (status === "COMPLETED" && url) {
        query = query.set({ url, completed_at: new Date() })
      } else if (status === "FAILED" && error) {
        query = query.set({ error, completed_at: new Date() })
      }

      const result = await query.returning("id").executeTakeFirst()
      return !!result
    } catch (error) {
      logger.error("Error updating report status", {
        error: error instanceof Error ? error.message : "Unknown error",
        id,
        status,
      })
      throw error
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db.deleteFrom("reports").where("id", "=", id).returning("id").executeTakeFirst()
      return !!result
    } catch (error) {
      logger.error("Error deleting report", {
        error: error instanceof Error ? error.message : "Unknown error",
        id,
      })
      throw error
    }
  }
}
