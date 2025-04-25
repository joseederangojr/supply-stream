import type { Report, CreateReportDto, ReportStatus } from "../models/Report"

export interface ReportRepository {
  create(report: CreateReportDto): Promise<Report>
  findById(id: string): Promise<Report | null>
  findByUserId(userId: string, options?: { page?: number; limit?: number }): Promise<Report[]>
  findByOrganizationId(organizationId: string, options?: { page?: number; limit?: number }): Promise<Report[]>
  findByStatus(status: ReportStatus, options?: { page?: number; limit?: number }): Promise<Report[]>
  updateStatus(id: string, status: ReportStatus, url?: string, error?: string): Promise<boolean>
  delete(id: string): Promise<boolean>
}
