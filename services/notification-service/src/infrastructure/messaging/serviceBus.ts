import { ServiceBusClient, type ServiceBusMessage, type ServiceBusReceiver } from "@azure/service-bus"
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

// Create a receiver for the queue if client exists
let receiver: ServiceBusReceiver | null = null

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

export async function startMessageReceiver(
  messageHandler: (messageType: string, messageData: any) => Promise<void>,
): Promise<void> {
  if (!serviceBusClient || !config.azure.servicebus.queueName) {
    logger.warn("Service Bus client or queue name not configured, message receiver not started")
    return
  }

  try {
    receiver = serviceBusClient.createReceiver(config.azure.servicebus.queueName)

    // Subscribe to messages
    receiver.subscribe({
      processMessage: async (message) => {
        try {
          const messageType = message.subject || "unknown"
          const messageData = message.body

          logger.debug("Received message from Service Bus", {
            messageType,
            messageId: message.messageId,
          })

          await messageHandler(messageType, messageData)
        } catch (error) {
          logger.error("Error processing message", {
            error: error instanceof Error ? error.message : "Unknown error",
            messageId: message.messageId,
          })
        }
      },
      processError: async (error) => {
        logger.error("Error from Service Bus receiver", {
          error: error.message,
        })
      },
    })

    logger.info("Service Bus message receiver started")
  } catch (error) {
    logger.error("Failed to start Service Bus message receiver", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error
  }
}

export async function closeServiceBusConnections(): Promise<void> {
  if (!serviceBusClient) return

  try {
    if (receiver) await receiver.close()
    if (sender) await sender.close()
    await serviceBusClient.close()
    logger.info("Service Bus connections closed")
  } catch (error) {
    logger.error("Error closing Service Bus connections", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
