export enum AnalyticsEventType {
  REQUEST_CREATED = "REQUEST_CREATED",
  REQUEST_UPDATED = "REQUEST_UPDATED",
  BID_SUBMITTED = "BID_SUBMITTED",
  BID_ACCEPTED = "BID_ACCEPTED",
  BID_REJECTED = "BID_REJECTED",
  USER_REGISTERED = "USER_REGISTERED",
  USER_LOGIN = "USER_LOGIN",
  INVOICE_CREATED = "INVOICE_CREATED",
  INVOICE_PAID = "INVOICE_PAID",
}

export interface AnalyticsEvent {
  id: string
  type: AnalyticsEventType
  timestamp: Date
  userId?: string
  organizationId?: string
  data: Record<string, any>
}

export interface CreateAnalyticsEventDto {
  type: AnalyticsEventType
  userId?: string
  organizationId?: string
  data: Record<string, any>
}
