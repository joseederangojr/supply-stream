import type { NotificationRepository } from "../../domain/repositories/NotificationRepository"
import { PostgresNotificationRepository } from "../../repositories/PostgresNotificationRepository"
import type { NotificationPreferenceRepository } from "../../domain/repositories/NotificationPreferenceRepository"
import { PostgresNotificationPreferenceRepository } from "../../repositories/PostgresNotificationPreferenceRepository"
import type { EmailService } from "../../domain/services/EmailService"
import { EmailServiceImpl } from "../../services/EmailServiceImpl"
import type { NotificationService } from "../../domain/services/NotificationService"
import { NotificationServiceImpl } from "../../services/NotificationServiceImpl"
import { NotificationController } from "../../api/controllers/NotificationController"

export interface Container {
  notificationRepository: NotificationRepository
  notificationPreferenceRepository: NotificationPreferenceRepository
  emailService: EmailService
  notificationService: NotificationService
  notificationController: NotificationController
}

export function createContainer(): Container {
  // Create repositories
  const notificationRepository = new PostgresNotificationRepository()
  const notificationPreferenceRepository = new PostgresNotificationPreferenceRepository()

  // Create services
  const emailService = new EmailServiceImpl()
  const notificationService = new NotificationServiceImpl(
    notificationRepository,
    notificationPreferenceRepository,
    emailService,
  )

  // Create controllers
  const notificationController = new NotificationController(notificationService)

  return {
    notificationRepository,
    notificationPreferenceRepository,
    emailService,
    notificationService,
    notificationController,
  }
}
