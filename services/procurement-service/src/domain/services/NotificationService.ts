export interface RequestNotification {
  requestId: string
  title: string
  clientId: string
}

export interface NotificationService {
  notifySuppliers(notification: RequestNotification): Promise<void>
  notifyRequestUpdate(requestId: string, status: string): Promise<void>
}
