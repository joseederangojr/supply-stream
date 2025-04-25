import type { AnalyticsEvent, CreateAnalyticsEventDto, AnalyticsEventType } from "../models/AnalyticsEvent"

export interface TimeSeriesData {
  date: string
  value: number
}

export interface CategoryData {
  category: string
  value: number
}

export interface TopItemData {
  id: string
  name: string
  value: number
}

export interface AnalyticsService {
  trackEvent(event: CreateAnalyticsEventDto): Promise<AnalyticsEvent>
  getEventById(id: string): Promise<AnalyticsEvent | null>
  getEventsByType(type: AnalyticsEventType, page?: number, limit?: number): Promise<AnalyticsEvent[]>
  getEventsByUserId(userId: string, page?: number, limit?: number): Promise<AnalyticsEvent[]>
  getEventsByOrganizationId(organizationId: string, page?: number, limit?: number): Promise<AnalyticsEvent[]>

  // Dashboard metrics
  getTotalRequests(organizationId?: string, startDate?: Date, endDate?: Date): Promise<number>
  getTotalBids(organizationId?: string, startDate?: Date, endDate?: Date): Promise<number>
  getAverageBidsPerRequest(organizationId?: string, startDate?: Date, endDate?: Date): Promise<number>
  getTotalSpend(organizationId?: string, startDate?: Date, endDate?: Date): Promise<number>
  getAverageTimeToAward(organizationId?: string, startDate?: Date, endDate?: Date): Promise<number>

  // Time series data
  getRequestsOverTime(
    organizationId?: string,
    startDate?: Date,
    endDate?: Date,
    interval?: "day" | "week" | "month",
  ): Promise<TimeSeriesData[]>
  getBidsOverTime(
    organizationId?: string,
    startDate?: Date,
    endDate?: Date,
    interval?: "day" | "week" | "month",
  ): Promise<TimeSeriesData[]>
  getSpendOverTime(
    organizationId?: string,
    startDate?: Date,
    endDate?: Date,
    interval?: "day" | "week" | "month",
  ): Promise<TimeSeriesData[]>

  // Category data
  getSpendByCategory(organizationId?: string, startDate?: Date, endDate?: Date, limit?: number): Promise<CategoryData[]>
  getBidsByCategory(organizationId?: string, startDate?: Date, endDate?: Date, limit?: number): Promise<CategoryData[]>

  // Top items
  getTopSuppliers(organizationId?: string, startDate?: Date, endDate?: Date, limit?: number): Promise<TopItemData[]>
  getTopClients(startDate?: Date, endDate?: Date, limit?: number): Promise<TopItemData[]>
  getTopCategories(organizationId?: string, startDate?: Date, endDate?: Date, limit?: number): Promise<TopItemData[]>

  // Geographic data
  getRequestsByLocation(organizationId?: string, startDate?: Date, endDate?: Date): Promise<any>
  getSuppliersByLocation(organizationId?: string, startDate?: Date, endDate?: Date): Promise<any>

  // Process message from service bus
  processMessage(messageType: string, messageData: any): Promise<void>
}
