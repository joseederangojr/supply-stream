import type { NotificationService } from "../../domain/services/NotificationService"
import { logger } from "../../utils/logger"

export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  async getNotificationById(id: string) {
    try {
      return await this.notificationService.getNotificationById(id)
    } catch (error) {
      logger.error("Controller error: getNotificationById", {
        error: error instanceof Error ? error.message : "Unknown error",
        notificationId: id,
      })
      throw error
    }
  }

  async getNotificationsByUserId(userId: string, page?: number, limit?: number) {
    try {
      return await this.notificationService.getNotificationsByUserId(userId, page, limit)
    } catch (error) {
      logger.error("Controller error: getNotificationsByUserId", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      })
      throw error
    }
  }

  async getUnreadNotificationsByUserId(userId: string, page?: number, limit?: number) {
    try {
      return await this.notificationService.getUnreadNotificationsByUserId(userId, page, limit)
    } catch (error) {
      logger.error("Controller error: getUnreadNotificationsByUserId", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      })
      throw error
    }
  }

  async createNotification(data: any) {
    try {
      return await this.notificationService.createNotification(data)
    } catch (error) {
      logger.error("Controller error: createNotification", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: data.userId,
        type: data.type,
      })
      throw error
    }
  }

  async markAsRead(id: string) {
    try {
      const success = await this.notificationService.markAsRead(id)
      return { success }
    } catch (error) {
      logger.error("Controller error: markAsRead", {
        error: error instanceof Error ? error.message : "Unknown error",
        notificationId: id,
      })
      throw error
    }
  }

  async markAllAsRead(userId: string) {
    try {
      const count = await this.notificationService.markAllAsRead(userId)
      return { success: true, count }
    } catch (error) {
      logger.error("Controller error: markAllAsRead", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      })
      throw error
    }
  }

  async deleteNotification(id: string) {
    try {
      const success = await this.notificationService.deleteNotification(id)
      return { success }
    } catch (error) {
      logger.error("Controller error: deleteNotification", {
        error: error instanceof Error ? error.message : "Unknown error",
        notificationId: id,
      })
      throw error
    }
  }

  async deleteAllNotifications(userId: string) {
    try {
      const count = await this.notificationService.deleteAllNotifications(userId)
      return { success: true, count }
    } catch (error) {
      logger.error("Controller error: deleteAllNotifications", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      })
      throw error
    }
  }
}
