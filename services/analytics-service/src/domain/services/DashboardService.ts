import type { Dashboard, CreateDashboardDto, UpdateDashboardDto, DashboardWidget } from "../models/Dashboard"

export interface DashboardService {
  createDashboard(dto: CreateDashboardDto): Promise<Dashboard>
  getDashboardById(id: string): Promise<Dashboard | null>
  getDashboardsByUserId(userId: string): Promise<Dashboard[]>
  getDashboardsByOrganizationId(organizationId: string): Promise<Dashboard[]>
  getDefaultDashboard(userId?: string, organizationId?: string): Promise<Dashboard | null>
  updateDashboard(id: string, dto: UpdateDashboardDto): Promise<Dashboard | null>
  addWidget(dashboardId: string, widget: Omit<DashboardWidget, "id">): Promise<Dashboard | null>
  updateWidget(
    dashboardId: string,
    widgetId: string,
    widget: Partial<Omit<DashboardWidget, "id">>,
  ): Promise<Dashboard | null>
  removeWidget(dashboardId: string, widgetId: string): Promise<Dashboard | null>
  deleteDashboard(id: string): Promise<boolean>
}
