export interface BidNotification {
  bidId: string
  requestId: string
  supplierId: string
  clientId: string
  status: string
}

export interface NotificationService {
  notifyBidSubmitted(notification: BidNotification): Promise<void>
  notifyBidStatusChanged(notification: BidNotification): Promise<void>
}
