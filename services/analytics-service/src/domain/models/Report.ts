export enum ReportType {
  PROCUREMENT_SUMMARY = "PROCUREMENT_SUMMARY",
  SUPPLIER_PERFORMANCE = "SUPPLIER_PERFORMANCE",
  COST_SAVINGS = "COST_SAVINGS",
  USER_ACTIVITY = "USER_ACTIVITY",
  CATEGORY_SPEND = "CATEGORY_SPEND",
  GEOGRAPHIC_DISTRIBUTION = "GEOGRAPHIC_DISTRIBUTION",
}

export enum ReportFormat {
  JSON = "JSON",
  CSV = "CSV",
  PDF = "PDF",
}

export enum ReportStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface Report {
  id: string
  type: ReportType
  format: ReportFormat
  status: ReportStatus
  parameters: Record<string, any>
  createdBy: string
  createdAt: Date
  completedAt?: Date
  url?: string
  error?: string
}

export interface CreateReportDto {
  type: ReportType
  format: ReportFormat
  parameters: Record<string, any>
  createdBy: string
}
