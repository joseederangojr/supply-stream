export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

export enum NotificationType {
  USER_CREATED = "USER_CREATED",
  PASSWORD_CHANGED = "PASSWORD_CHANGED",
  PASSWORD_RESET = "PASSWORD_RESET",
  REQUEST_PUBLISHED = "REQUEST_PUBLISHED",
  REQUEST_UPDATED = "REQUEST_UPDATED",
  BID_SUBMITTED = "BID_SUBMITTED",
  BID_STATUS_CHANGED = "BID_STATUS_CHANGED",
  SYSTEM_ALERT = "SYSTEM_ALERT",
}

export interface NotificationPreference {
  id: string
  userId: string
  type: NotificationType
  email: boolean
  inApp: boolean
  createdAt: Date
  updatedAt: Date
}
