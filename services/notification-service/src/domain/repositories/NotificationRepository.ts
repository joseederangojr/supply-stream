import type { Notification } from "../models/Notification"

export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortDirection?: "asc" | "desc"
}

export interface NotificationRepository {
  findById(id: string): Promise<Notification | null>
  findByUserId(userId: string, options?: PaginationOptions): Promise<Notification[]>
  findUnreadByUserId(userId: string, options?: PaginationOptions): Promise<Notification[]>
  create(notification: Omit<Notification, "id" | "createdAt" | "updatedAt">): Promise<Notification>
  markAsRead(id: string): Promise<boolean>
  markAllAsRead(userId: string): Promise<number>
  delete(id: string): Promise<boolean>
  deleteByUserId(userId: string): Promise<number>
}
