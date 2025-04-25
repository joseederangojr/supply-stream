import type { Dashboard, CreateDashboardDto, UpdateDashboardDto } from "../models/Dashboard"

export interface DashboardRepository {
  create(dashboard: CreateDashboardDto): Promise<Dashboard>
  findById(id: string): Promise<Dashboard | null>
  findByUserId(userId: string): Promise<Dashboard[]>
  findByOrganizationId(organizationId: string): Promise<Dashboard[]>
  findDefault(userId?: string, organizationId?: string): Promise<Dashboard | null>
  update(id: string, dashboard: UpdateDashboardDto): Promise<Dashboard | null>
  delete(id: string): Promise<boolean>
}
