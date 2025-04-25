import type { AnalyticsEvent, CreateAnalyticsEventDto } from "../models/AnalyticsEvent"

export interface AnalyticsEventRepository {
  create(event: CreateAnalyticsEventDto): Promise<AnalyticsEvent>
  findById(id: string): Promise<AnalyticsEvent | null>
  findByType(type: string, options?: { page?: number; limit?: number }): Promise<AnalyticsEvent[]>
  findByUserId(userId: string, options?: { page?: number; limit?: number }): Promise<AnalyticsEvent[]>
  findByOrganizationId(organizationId: string, options?: { page?: number; limit?: number }): Promise<AnalyticsEvent[]>
  findByDateRange(
    startDate: Date,
    endDate: Date,
    options?: { page?: number; limit?: number },
  ): Promise<AnalyticsEvent[]>
  countByType(type: string, startDate?: Date, endDate?: Date): Promise<number>
  countByOrganization(organizationId: string, startDate?: Date, endDate?: Date): Promise<number>
  delete(id: string): Promise<boolean>
}
