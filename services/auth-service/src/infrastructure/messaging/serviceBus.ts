import { ServiceBusClient, type ServiceBusMessage } from "@azure/service-bus"
import { config } from "../../config"
import { logger } from "../../utils/logger"

// Create a ServiceBusClient if connection string is provided
const serviceBusClient = config.azure.servicebus.connectionString
  ? new ServiceBusClient(config.azure.servicebus.connectionString)
  : null

// Create a sender for the queue if client exists
const sender =
  serviceBusClient && config.azure.servicebus.queueName
    ? serviceBusClient.createSender(config.azure.servicebus.queueName)
    : null

export async function sendMessage(messageBody: any, messageType: string): Promise<void> {
  if (!sender) {
    logger.warn("Service Bus sender not initialized, message not sent", { messageType })
    return
  }

  try {
    const message: ServiceBusMessage = {
      body: messageBody,
      contentType: "application/json",
      subject: messageType,
      messageId: `${messageType}-${Date.now()}`,
      applicationProperties: {
        messageType,
        timestamp: new Date().toISOString(),
        service: config.serviceName,
      },
    }

    await sender.sendMessages(message)

    logger.debug("Message sent to Service Bus", {
      messageType,
      messageId: message.messageId,
    })
  } catch (error) {
    logger.error("Failed to send message to Service Bus", {
      messageType,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error
  }
}

export async function closeServiceBusConnections(): Promise<void> {
  if (!serviceBusClient) return

  try {
    if (sender) await sender.close()
    await serviceBusClient.close()
    logger.info("Service Bus connections closed")
  } catch (error) {
    logger.error("Error closing Service Bus connections", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
