import { Notification } from "../domain/models/Notification"
import type { NotificationRepository } from "../domain/repositories/NotificationRepository"
import type { NotificationPreferenceRepository } from "../domain/repositories/NotificationPreferenceRepository"
import type { NotificationService } from "../domain/services/NotificationService"
import type { EmailService } from "../domain/services/EmailService"
import { logger } from "../utils/logger"
import { webSocketServer } from "../infrastructure/websocket"

export class NotificationServiceImpl implements NotificationService {
  constructor(
    private notificationRepository: NotificationRepository,
    private notificationPreferenceRepository: NotificationPreferenceRepository,
    private emailService: EmailService,
  ) {}

  async createNotification(notification: Notification): Promise<Notification> {
    try {
      logger.info("Creating notification", { notification })

      // Save notification to database
      const savedNotification = await this.notificationRepository.save(notification)

      // Get user preferences
      const preferences = await this.notificationPreferenceRepository.findByUserIdAndType(
        notification.userId,
        notification.type,
      )

      // Send email if enabled in preferences
      if (preferences?.email) {
        await this.emailService.sendEmail({
          to: notification.userData.email,
          subject: notification.title,
          text: notification.message,
          html: `<h1>${notification.title}</h1><p>${notification.message}</p>`,
        })
      }

      // Send real-time notification via WebSocket if enabled in preferences
      if (preferences?.inApp) {
        webSocketServer.sendToUser(notification.userId, "notification", savedNotification)
      }

      return savedNotification
    } catch (error) {
      logger.error("Error creating notification", { error, notification })
      throw error
    }
  }

  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    try {
      return await this.notificationRepository.findByUserId(userId)
    } catch (error) {
      logger.error("Error getting notifications by user ID", { error, userId })
      throw error
    }
  }

  async markNotificationAsRead(id: string, userId: string): Promise<Notification> {
    try {
      const notification = await this.notificationRepository.findById(id)

      if (!notification) {
        throw new Error(`Notification with ID ${id} not found`)
      }

      if (notification.userId !== userId) {
        throw new Error("Unauthorized access to notification")
      }

      notification.read = true
      return await this.notificationRepository.save(notification)
    } catch (error) {
      logger.error("Error marking notification as read", { error, id, userId })
      throw error
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      await this.notificationRepository.markAllAsRead(userId)
    } catch (error) {
      logger.error("Error marking all notifications as read", { error, userId })
      throw error
    }
  }

  async deleteNotification(id: string, userId: string): Promise<void> {
    try {
      const notification = await this.notificationRepository.findById(id)

      if (!notification) {
        throw new Error(`Notification with ID ${id} not found`)
      }

      if (notification.userId !== userId) {
        throw new Error("Unauthorized access to notification")
      }

      await this.notificationRepository.delete(id)
    } catch (error) {
      logger.error("Error deleting notification", { error, id, userId })
      throw error
    }
  }

  async broadcastToOrganization(
    organizationId: string,
    type: string,
    title: string,
    message: string,
    data?: any,
  ): Promise<void> {
    try {
      // Get all users in the organization
      // This would typically come from a user service or repository
      // For now, we'll assume we have a method to get users by organization ID
      const users = await this.getUsersByOrganizationId(organizationId)

      // Create notifications for each user
      for (const user of users) {
        const notification = new Notification({
          userId: user.id,
          type,
          title,
          message,
          data,
          userData: {
            email: user.email,
            name: user.name,
          },
        })

        await this.createNotification(notification)
      }

      // Also broadcast to all connected clients in this organization
      webSocketServer.sendToOrganization(organizationId, "organization-notification", {
        type,
        title,
        message,
        data,
      })
    } catch (error) {
      logger.error("Error broadcasting to organization", { error, organizationId })
      throw error
    }
  }

  // This is a placeholder method - in a real implementation, this would call the User Service
  private async getUsersByOrganizationId(organizationId: string): Promise<any[]> {
    // In a real implementation, this would call the User Service or Repository
    // For now, we'll return an empty array
    return []
  }
}
