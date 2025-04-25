import type { Integration } from "../models/Integration"

export interface IntegrationService {
  getIntegrationById(id: string): Promise<Integration | null>
  getIntegrationsByOrganizationId(organizationId: string): Promise<Integration[]>
  createIntegration(integration: Partial<Integration>): Promise<Integration>
  updateIntegration(id: string, integration: Partial<Integration>): Promise<Integration>
  deleteIntegration(id: string): Promise<void>
  testConnection(id: string): Promise<boolean>
  syncData(id: string): Promise<void>
}
