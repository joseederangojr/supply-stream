export enum IntegrationType {
  ERP = "ERP",
  CRM = "CRM",
  ACCOUNTING = "ACCOUNTING",
  INVENTORY = "INVENTORY",
  SHIPPING = "SHIPPING",
  CUSTOM = "CUSTOM",
}

export enum IntegrationStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ERROR = "ERROR",
  PENDING = "PENDING",
}

export interface IntegrationConfig {
  apiKey?: string
  apiSecret?: string
  baseUrl?: string
  username?: string
  password?: string
  tenantId?: string
  customFields?: Record<string, any>
}

export interface Integration {
  id: string
  organizationId: string
  name: string
  description?: string
  type: IntegrationType
  provider: string
  config: IntegrationConfig
  status: IntegrationStatus
  lastSyncAt?: Date
  createdAt: Date
  updatedAt: Date
}

export class IntegrationEntity implements Integration {
  id: string
  organizationId: string
  name: string
  description?: string
  type: IntegrationType
  provider: string
  config: IntegrationConfig
  status: IntegrationStatus
  lastSyncAt?: Date
  createdAt: Date
  updatedAt: Date

  constructor(data: Partial<Integration>) {
    this.id = data.id || ""
    this.organizationId = data.organizationId || ""
    this.name = data.name || ""
    this.description = data.description
    this.type = data.type || IntegrationType.CUSTOM
    this.provider = data.provider || ""
    this.config = data.config || {}
    this.status = data.status || IntegrationStatus.PENDING
    this.lastSyncAt = data.lastSyncAt
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }
}
