import type { Report, CreateReportDto } from "../models/Report"

export interface ReportService {
  createReport(dto: CreateReportDto): Promise<Report>
  getReportById(id: string): Promise<Report | null>
  getReportsByUserId(userId: string, page?: number, limit?: number): Promise<Report[]>
  getReportsByOrganizationId(organizationId: string, page?: number, limit?: number): Promise<Report[]>
  generateReport(id: string): Promise<boolean>
  deleteReport(id: string): Promise<boolean>
}
