import { injectable } from "inversify"
import { db } from "../infrastructure/database"
import type { DashboardRepository } from "../domain/repositories/DashboardRepository"
import type { Dashboard, CreateDashboardDto, UpdateDashboardDto } from "../domain/models/Dashboard"
import { logger } from "../utils/logger"

@injectable()
export class PostgresDashboardRepository implements DashboardRepository {
  async create(dashboard: CreateDashboardDto): Promise<Dashboard> {
    try {
      // Use a transaction to create dashboard and widgets
      return await db.transaction().execute(async (trx) => {
        // Insert dashboard
        const createdDashboard = await trx
          .insertInto("dashboards")
          .values({
            name: dashboard.name,
            description: dashboard.description || null,
            organization_id: dashboard.organizationId || null,
            user_id: dashboard.userId || null,
            is_default: dashboard.isDefault || false,
          })
          .returning([
            "id",
            "name",
            "description",
            "organization_id as organizationId",
            "user_id as userId",
            "is_default as isDefault",
            "created_at as createdAt",
            "updated_at as updatedAt",
          ])
          .executeTakeFirstOrThrow()

        // Insert widgets
        const widgets = []
        for (const widget of dashboard.widgets) {
          const createdWidget = await trx
            .insertInto("dashboard_widgets")
            .values({
              dashboard_id: createdDashboard.id,
              type: widget.type,
              title: widget.title,
              size: widget.size,
              position: widget.position,
              content: widget.content as any,
            })
            .returning(["id", "type", "title", "size", "position", "content"])
            .executeTakeFirstOrThrow()

          widgets.push(createdWidget)
        }

        return {
          ...createdDashboard,
          widgets,
        } as unknown as Dashboard
      })
    } catch (error) {
      logger.error("Error creating dashboard", {
        error: error instanceof Error ? error.message : "Unknown error",
        dashboard,
      })
      throw error
    }
  }

  async findById(id: string): Promise<Dashboard | null> {
    try {
      // Get dashboard
      const dashboard = await db
        .selectFrom("dashboards")
        .select([
          "id",
          "name",
          "description",
          "organization_id as organizationId",
          "user_id as userId",
          "is_default as isDefault",
          "created_at as createdAt",
          "updated_at as updatedAt",
        ])
        .where("id", "=", id)
        .executeTakeFirst()

      if (!dashboard) {
        return null
      }

      // Get widgets
      const widgets = await db
        .selectFrom("dashboard_widgets")
        .select(["id", "type", "title", "size", "position", "content"])
        .where("dashboard_id", "=", id)
        .orderBy("position", "asc")
        .execute()

      return {
        ...dashboard,
        widgets,
      } as unknown as Dashboard
    } catch (error) {
      logger.error("Error finding dashboard by ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        id,
      })
      throw error
    }
  }

  async findByUserId(userId: string): Promise<Dashboard[]> {
    try {
      // Get dashboards
      const dashboards = await db
        .selectFrom("dashboards")
        .select([
          "id",
          "name",
          "description",
          "organization_id as organizationId",
          "user_id as userId",
          "is_default as isDefault",
          "created_at as createdAt",
          "updated_at as updatedAt",
        ])
        .where("user_id", "=", userId)
        .orderBy("created_at", "desc")
        .execute()

      // Get widgets for each dashboard
      const result: Dashboard[] = []

      for (const dashboard of dashboards) {
        const widgets = await db
          .selectFrom("dashboard_widgets")
          .select(["id", "type", "title", "size", "position", "content"])
          .where("dashboard_id", "=", dashboard.id)
          .orderBy("position", "asc")
          .execute()

        result.push({
          ...dashboard,
          widgets,
        } as unknown as Dashboard)
      }

      return result
    } catch (error) {
      logger.error("Error finding dashboards by user ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      })
      throw error
    }
  }

  async findByOrganizationId(organizationId: string): Promise<Dashboard[]> {
    try {
      // Get dashboards
      const dashboards = await db
        .selectFrom("dashboards")
        .select([
          "id",
          "name",
          "description",
          "organization_id as organizationId",
          "user_id as userId",
          "is_default as isDefault",
          "created_at as createdAt",
          "updated_at as updatedAt",
        ])
        .where("organization_id", "=", organizationId)
        .orderBy("created_at", "desc")
        .execute()

      // Get widgets for each dashboard
      const result: Dashboard[] = []

      for (const dashboard of dashboards) {
        const widgets = await db
          .selectFrom("dashboard_widgets")
          .select(["id", "type", "title", "size", "position", "content"])
          .where("dashboard_id", "=", dashboard.id)
          .orderBy("position", "asc")
          .execute()

        result.push({
          ...dashboard,
          widgets,
        } as unknown as Dashboard)
      }

      return result
    } catch (error) {
      logger.error("Error finding dashboards by organization ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
      })
      throw error
    }
  }

  async findDefault(userId?: string, organizationId?: string): Promise<Dashboard | null> {
    try {
      let query = db
        .selectFrom("dashboards")
        .select([
          "id",
          "name",
          "description",
          "organization_id as organizationId",
          "user_id as userId",
          "is_default as isDefault",
          "created_at as createdAt",
          "updated_at as updatedAt",
        ])
        .where("is_default", "=", true)

      if (userId) {
        query = query.where("user_id", "=", userId)
      } else if (organizationId) {
        query = query.where("organization_id", "=", organizationId)
      } else {
        // If neither userId nor organizationId is provided, return null
        return null
      }

      const dashboard = await query.executeTakeFirst()

      if (!dashboard) {
        return null
      }

      // Get widgets
      const widgets = await db
        .selectFrom("dashboard_widgets")
        .select(["id", "type", "title", "size", "position", "content"])
        .where("dashboard_id", "=", dashboard.id)
        .orderBy("position", "asc")
        .execute()

      return {
        ...dashboard,
        widgets,
      } as unknown as Dashboard
    } catch (error) {
      logger.error("Error finding default dashboard", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
        organizationId,
      })
      throw error
    }
  }

  async update(id: string, dashboard: UpdateDashboardDto): Promise<Dashboard | null> {
    try {
      return await db.transaction().execute(async (trx) => {
        // Update dashboard
        const updateObj: Record<string, any> = {
          updated_at: new Date(),
        }

        if (dashboard.name !== undefined) {
          updateObj.name = dashboard.name
        }

        if (dashboard.description !== undefined) {
          updateObj.description = dashboard.description
        }

        if (dashboard.isDefault !== undefined) {
          updateObj.is_default = dashboard.isDefault
        }

        const updatedDashboard = await trx
          .updateTable("dashboards")
          .set(updateObj)
          .where("id", "=", id)
          .returning([
            "id",
            "name",
            "description",
            "organization_id as organizationId",
            "user_id as userId",
            "is_default as isDefault",
            "created_at as createdAt",
            "updated_at as updatedAt",
          ])
          .executeTakeFirst()

        if (!updatedDashboard) {
          return null
        }

        // If widgets are provided, delete existing widgets and insert new ones
        if (dashboard.widgets) {
          // Delete existing widgets
          await trx.deleteFrom("dashboard_widgets").where("dashboard_id", "=", id).execute()

          // Insert new widgets
          const widgets = []
          for (const widget of dashboard.widgets) {
            const createdWidget = await trx
              .insertInto("dashboard_widgets")
              .values({
                dashboard_id: id,
                type: widget.type,
                title: widget.title,
                size: widget.size,
                position: widget.position,
                content: widget.content as any,
              })
              .returning(["id", "type", "title", "size", "position", "content"])
              .executeTakeFirstOrThrow()

            widgets.push(createdWidget)
          }

          return {
            ...updatedDashboard,
            widgets,
          } as unknown as Dashboard
        } else {
          // Get existing widgets
          const widgets = await trx
            .selectFrom("dashboard_widgets")
            .select(["id", "type", "title", "size", "position", "content"])
            .where("dashboard_id", "=", id)
            .orderBy("position", "asc")
            .execute()

          return {
            ...updatedDashboard,
            widgets,
          } as unknown as Dashboard
        }
      })
    } catch (error) {
      logger.error("Error updating dashboard", {
        error: error instanceof Error ? error.message : "Unknown error",
        id,
        dashboard,
      })
      throw error
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      return await db.transaction().execute(async (trx) => {
        // Delete widgets first (due to foreign key constraint)
        await trx.deleteFrom("dashboard_widgets").where("dashboard_id", "=", id).execute()

        // Delete dashboard
        const result = await trx.deleteFrom("dashboards").where("id", "=", id).returning("id").executeTakeFirst()

        return !!result
      })
    } catch (error) {
      logger.error("Error deleting dashboard", {
        error: error instanceof Error ? error.message : "Unknown error",
        id,
      })
      throw error
    }
  }
}
