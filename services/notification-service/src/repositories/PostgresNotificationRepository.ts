import { v4 as uuidv4 } from "uuid"
import type { NotificationRepository, PaginationOptions } from "../domain/repositories/NotificationRepository"
import type { Notification, NotificationType } from "../domain/models/Notification"
import { db } from "../infrastructure/database"
import { logger } from "../utils/logger"

export class PostgresNotificationRepository implements NotificationRepository {
  async findById(id: string): Promise<Notification | null> {
    try {
      const result = await db.selectFrom("notifications").selectAll().where("id", "=", id).executeTakeFirst()

      return result ? this.mapToModel(result) : null
    } catch (error) {
      logger.error("Error finding notification by ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        notificationId: id,
      })
      throw error
    }
  }

  async findByUserId(userId: string, options?: PaginationOptions): Promise<Notification[]> {
    try {
      const page = options?.page || 1
      const limit = options?.limit || 10
      const offset = (page - 1) * limit
      const sortBy = options?.sortBy || "created_at"
      const sortDirection = options?.sortDirection || "desc"

      const results = await db
        .selectFrom("notifications")
        .selectAll()
        .where("user_id", "=", userId)
        .orderBy(sortBy, sortDirection)
        .limit(limit)
        .offset(offset)
        .execute()

      return results.map(this.mapToModel)
    } catch (error) {
      logger.error("Error finding notifications by user ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      })
      throw error
    }
  }

  async findUnreadByUserId(userId: string, options?: PaginationOptions): Promise<Notification[]> {
    try {
      const page = options?.page || 1
      const limit = options?.limit || 10
      const offset = (page - 1) * limit
      const sortBy = options?.sortBy || "created_at"
      const sortDirection = options?.sortDirection || "desc"

      const results = await db
        .selectFrom("notifications")
        .selectAll()
        .where("user_id", "=", userId)
        .where("is_read", "=", false)
        .orderBy(sortBy, sortDirection)
        .limit(limit)
        .offset(offset)
        .execute()

      return results.map(this.mapToModel)
    } catch (error) {
      logger.error("Error finding unread notifications by user ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      })
      throw error
    }
  }

  async create(notification: Omit<Notification, "id" | "createdAt" | "updatedAt">): Promise<Notification> {
    try {
      const id = uuidv4()
      const now = new Date()

      const result = await db
        .insertInto("notifications")
        .values({
          id,
          user_id: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data || null,
          is_read: notification.isRead,
          created_at: now,
          updated_at: now,
        })
        .returningAll()
        .executeTakeFirstOrThrow()

      return this.mapToModel(result)
    } catch (error) {
      logger.error("Error creating notification", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: notification.userId,
        type: notification.type,
      })
      throw error
    }
  }

  async markAsRead(id: string): Promise<boolean> {
    try {
      const result = await db
        .updateTable("notifications")
        .set({
          is_read: true,
          updated_at: new Date(),
        })
        .where("id", "=", id)
        .executeTakeFirst()

      return result.numUpdatedRows > 0
    } catch (error) {
      logger.error("Error marking notification as read", {
        error: error instanceof Error ? error.message : "Unknown error",
        notificationId: id,
      })
      throw error
    }
  }

  async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await db
        .updateTable("notifications")
        .set({
          is_read: true,
          updated_at: new Date(),
        })
        .where("user_id", "=", userId)
        .where("is_read", "=", false)
        .executeTakeFirst()

      return Number(result.numUpdatedRows)
    } catch (error) {
      logger.error("Error marking all notifications as read", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      })
      throw error
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db.deleteFrom("notifications").where("id", "=", id).executeTakeFirst()

      return result.numDeletedRows > 0
    } catch (error) {
      logger.error("Error deleting notification", {
        error: error instanceof Error ? error.message : "Unknown error",
        notificationId: id,
      })
      throw error
    }
  }

  async deleteByUserId(userId: string): Promise<number> {
    try {
      const result = await db.deleteFrom("notifications").where("user_id", "=", userId).executeTakeFirst()

      return Number(result.numDeletedRows)
    } catch (error) {
      logger.error("Error deleting notifications by user ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      })
      throw error
    }
  }

  private mapToModel(data: any): Notification {
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type as NotificationType,
      title: data.title,
      message: data.message,
      data: data.data || undefined,
      isRead: data.is_read,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }
}
