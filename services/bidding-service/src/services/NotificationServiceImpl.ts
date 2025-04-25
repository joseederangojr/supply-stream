import type { NotificationService, BidNotification } from "../domain/services/NotificationService"
import { sendMessage } from "../infrastructure/messaging/serviceBus"
import { logger } from "../utils/logger"

export class NotificationServiceImpl implements NotificationService {
  async notifyBidSubmitted(notification: BidNotification): Promise<void> {
    try {
      logger.info("Notifying about bid submission", {
        bidId: notification.bidId,
        requestId: notification.requestId,
        supplierId: notification.supplierId,
        clientId: notification.clientId,
      })

      // Send message to service bus for notification service to process
      await sendMessage(
        {
          type: "BID_SUBMITTED",
          data: notification,
        },
        "notification.bid.submitted",
      )
    } catch (error) {
      logger.error("Error notifying about bid submission", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId: notification.bidId,
      })
      throw error
    }
  }

  async notifyBidStatusChanged(notification: BidNotification): Promise<void> {
    try {
      logger.info("Notifying about bid status change", {
        bidId: notification.bidId,
        requestId: notification.requestId,
        supplierId: notification.supplierId,
        clientId: notification.clientId,
        status: notification.status,
      })

      // Send message to service bus for notification service to process
      await sendMessage(
        {
          type: "BID_STATUS_CHANGED",
          data: notification,
        },
        "notification.bid.status_changed",
      )
    } catch (error) {
      logger.error("Error notifying about bid status change", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId: notification.bidId,
        status: notification.status,
      })
      throw error
    }
  }
}
