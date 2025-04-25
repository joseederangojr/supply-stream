import type { Notification, NotificationType } from "../models/Notification"

export interface NotificationService {
  getNotificationById(id: string): Promise<Notification | null>
  getNotificationsByUserId(userId: string, page?: number, limit?: number): Promise<Notification[]>
  getUnreadNotificationsByUserId(userId: string, page?: number, limit?: number): Promise<Notification[]>
  createNotification(notification: CreateNotificationDto): Promise<Notification>
  markAsRead(id: string): Promise<boolean>
  markAllAsRead(userId: string): Promise<number>
  deleteNotification(id: string): Promise<boolean>
  deleteAllNotifications(userId: string): Promise<number>
  processMessage(messageType: string, messageData: any): Promise<void>
}

export interface CreateNotificationDto {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
}
