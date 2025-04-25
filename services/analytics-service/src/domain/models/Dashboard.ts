export interface DashboardMetric {
  id: string
  name: string
  value: number
  change?: number
  changePercentage?: number
  trend?: number[]
  unit?: string
}

export interface DashboardChart {
  id: string
  type: "bar" | "line" | "pie" | "area"
  title: string
  data: any
}

export interface DashboardWidget {
  id: string
  type: "metric" | "chart" | "table" | "list"
  title: string
  size: "small" | "medium" | "large"
  position: number
  content: DashboardMetric | DashboardChart | any
}

export interface Dashboard {
  id: string
  name: string
  description?: string
  organizationId?: string
  userId?: string
  isDefault: boolean
  widgets: DashboardWidget[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateDashboardDto {
  name: string
  description?: string
  organizationId?: string
  userId?: string
  isDefault?: boolean
  widgets: Omit<DashboardWidget, "id">[]
}

export interface UpdateDashboardDto {
  name?: string
  description?: string
  isDefault?: boolean
  widgets?: Omit<DashboardWidget, "id">[]
}
