import type { NotificationPreference, NotificationType } from "../models/Notification"

export interface NotificationPreferenceRepository {
  findById(id: string): Promise<NotificationPreference | null>
  findByUserId(userId: string): Promise<NotificationPreference[]>
  findByUserIdAndType(userId: string, type: NotificationType): Promise<NotificationPreference | null>
  create(preference: Omit<NotificationPreference, "id" | "createdAt" | "updatedAt">): Promise<NotificationPreference>
  update(id: string, preference: Partial<NotificationPreference>): Promise<NotificationPreference | null>
  delete(id: string): Promise<boolean>
}
