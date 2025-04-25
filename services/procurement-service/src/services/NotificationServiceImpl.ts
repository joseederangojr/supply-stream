import type { NotificationService, RequestNotification } from "../domain/services/NotificationService"
import { sendMessage } from "../infrastructure/messaging/serviceBus"
import { logger } from "../utils/logger"

export class NotificationServiceImpl implements NotificationService {
  async notifySuppliers(notification: RequestNotification): Promise<void> {
    try {
      logger.info("Notifying suppliers about new request", {
        requestId: notification.requestId,
        clientId: notification.clientId,
      })

      // Send message to service bus for notification service to process
      await sendMessage(
        {
          type: "REQUEST_PUBLISHED",
          data: notification,
        },
        "notification.request.published",
      )
    } catch (error) {
      logger.error("Error notifying suppliers", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId: notification.requestId,
      })
      throw error
    }
  }

  async notifyRequestUpdate(requestId: string, status: string): Promise<void> {
    try {
      logger.info("Notifying about request status update", {
        requestId,
        status,
      })

      // Send message to service bus for notification service to process
      await sendMessage(
        {
          type: "REQUEST_UPDATED",
          data: {
            requestId,
            status,
          },
        },
        "notification.request.updated",
      )
    } catch (error) {
      logger.error("Error notifying about request update", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId,
        status,
      })
      throw error
    }
  }
}
