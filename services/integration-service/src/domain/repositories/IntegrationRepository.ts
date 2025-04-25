import type { Integration } from "../models/Integration"

export interface IntegrationRepository {
  findById(id: string): Promise<Integration | null>
  findByOrganizationId(organizationId: string): Promise<Integration[]>
  save(integration: Integration): Promise<Integration>
  update(id: string, integration: Partial<Integration>): Promise<Integration>
  delete(id: string): Promise<void>
}
