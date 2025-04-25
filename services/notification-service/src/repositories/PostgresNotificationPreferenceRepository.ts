import { v4 as uuidv4 } from "uuid"
import type { NotificationPreferenceRepository } from "../domain/repositories/NotificationPreferenceRepository"
import type { NotificationPreference, NotificationType } from "../domain/models/Notification"
import { db } from "../infrastructure/database"
import { logger } from "../utils/logger"

export class PostgresNotificationPreferenceRepository implements NotificationPreferenceRepository {
  async findById(id: string): Promise<NotificationPreference | null> {
    try {
      const result = await db.selectFrom("notification_preferences").selectAll().where("id", "=", id).executeTakeFirst()

      return result ? this.mapToModel(result) : null
    } catch (error) {
      logger.error("Error finding notification preference by ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        preferenceId: id,
      })
      throw error
    }
  }

  async findByUserId(userId: string): Promise<NotificationPreference[]> {
    try {
      const results = await db
        .selectFrom("notification_preferences")
        .selectAll()
        .where("user_id", "=", userId)
        .execute()

      return results.map(this.mapToModel)
    } catch (error) {
      logger.error("Error finding notification preferences by user ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      })
      throw error
    }
  }

  async findByUserIdAndType(userId: string, type: NotificationType): Promise<NotificationPreference | null> {
    try {
      const result = await db
        .selectFrom("notification_preferences")
        .selectAll()
        .where("user_id", "=", userId)
        .where("type", "=", type)
        .executeTakeFirst()

      return result ? this.mapToModel(result) : null
    } catch (error) {
      logger.error("Error finding notification preference by user ID and type", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
        type,
      })
      throw error
    }
  }

  async create(
    preference: Omit<NotificationPreference, "id" | "createdAt" | "updatedAt">,
  ): Promise<NotificationPreference> {
    try {
      const id = uuidv4()
      const now = new Date()

      const result = await db
        .insertInto("notification_preferences")
        .values({
          id,
          user_id: preference.userId,
          type: preference.type,
          email: preference.email,
          in_app: preference.inApp,
          created_at: now,
          updated_at: now,
        })
        .returningAll()
        .executeTakeFirstOrThrow()

      return this.mapToModel(result)
    } catch (error) {
      logger.error("Error creating notification preference", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: preference.userId,
        type: preference.type,
      })
      throw error
    }
  }

  async update(id: string, preference: Partial<NotificationPreference>): Promise<NotificationPreference | null> {
    try {
      // Build update object dynamically based on provided fields
      const updateValues: any = {
        updated_at: new Date(),
      }

      if (preference.email !== undefined) updateValues.email = preference.email
      if (preference.inApp !== undefined) updateValues.in_app = preference.inApp

      const result = await db
        .updateTable("notification_preferences")
        .set(updateValues)
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirst()

      return result ? this.mapToModel(result) : null
    } catch (error) {
      logger.error("Error updating notification preference", {
        error: error instanceof Error ? error.message : "Unknown error",
        preferenceId: id,
      })
      throw error
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db.deleteFrom("notification_preferences").where("id", "=", id).executeTakeFirst()

      return result.numDeletedRows > 0
    } catch (error) {
      logger.error("Error deleting notification preference", {
        error: error instanceof Error ? error.message : "Unknown error",
        preferenceId: id,
      })
      throw error
    }
  }

  private mapToModel(data: any): NotificationPreference {
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type as NotificationType,
      email: data.email,
      inApp: data.in_app,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }
}
