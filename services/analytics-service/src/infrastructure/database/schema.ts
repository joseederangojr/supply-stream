import type { Generated } from "kysely"

export interface Database {
  analytics_events: AnalyticsEventTable
  reports: ReportTable
  dashboards: DashboardTable
  dashboard_widgets: DashboardWidgetTable
}

export interface AnalyticsEventTable {
  id: Generated<string>
  type: string
  user_id: string | null
  organization_id: string | null
  data: unknown
  created_at: Generated<Date>
}

export interface ReportTable {
  id: Generated<string>
  type: string
  format: string
  parameters: unknown
  created_by: string
  status: ReportStatus
  created_at: Generated<Date>
  completed_at: Date | null
  url: string | null
  error: string | null
}

export type ReportStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"

export interface DashboardTable {
  id: Generated<string>
  name: string
  description: string | null
  organization_id: string | null
  user_id: string | null
  is_default: boolean
  created_at: Generated<Date>
  updated_at: Generated<Date>
}

export interface DashboardWidgetTable {
  id: Generated<string>
  dashboard_id: string
  type: string
  title: string
  size: string
  position: number
  content: unknown
}
