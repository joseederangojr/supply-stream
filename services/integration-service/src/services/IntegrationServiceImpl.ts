import { inject, injectable } from "inversify"
import { type Integration, IntegrationStatus } from "../domain/models/Integration"
import type { IntegrationRepository } from "../domain/repositories/IntegrationRepository"
import type { IntegrationService } from "../domain/services/IntegrationService"
import { logger } from "../utils/logger"
import type { IntegrationProviderFactory } from "./providers/IntegrationProviderFactory"

@injectable()
export class IntegrationServiceImpl implements IntegrationService {
  constructor(
    @inject("IntegrationRepository") private readonly integrationRepository: IntegrationRepository,
    @inject("IntegrationProviderFactory") private readonly providerFactory: IntegrationProviderFactory
  ) {}

  async getIntegrationById(id: string): Promise<Integration | null> {
    try {
      return await this.integrationRepository.findById(id)
    } catch (error) {
      logger.error("Error getting integration by ID", { error, id })
      throw error
    }
  }

  async getIntegrationsByOrganizationId(organizationId: string): Promise<Integration[]> {
    try {
      return await this.integrationRepository.findByOrganizationId(organizationId)
    } catch (error) {
      logger.error("Error getting integrations by organization ID", { error, organizationId })
      throw error
    }
  }

  async createIntegration(integration: Partial<Integration>): Promise<Integration> {
    try {
      const newIntegration = {
        ...integration,
        status: IntegrationStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Integration

      return await this.integrationRepository.save(newIntegration)
    } catch (error) {
      logger.error("Error creating integration", { error, integration })
      throw error
    }
  }

  async updateIntegration(id: string, integration: Partial<Integration>): Promise<Integration> {
    try {
      const existingIntegration = await this.integrationRepository.findById(id)

      if (!existingIntegration) {
        throw new Error(`Integration with ID ${id} not found`)
      }

      const updatedIntegration = {
        ...existingIntegration,
        ...integration,
        updatedAt: new Date(),
      }

      return await this.integrationRepository.update(id, updatedIntegration)
    } catch (error) {
      logger.error("Error updating integration", { error, id, integration })
      throw error
    }
  }

  async deleteIntegration(id: string): Promise<void> {
    try {
      await this.integrationRepository.delete(id)
    } catch (error) {
      logger.error("Error deleting integration", { error, id })
      throw error
    }
  }

  async testConnection(id: string): Promise<boolean> {
    try {
      const integration = await this.integrationRepository.findById(id)

      if (!integration) {
        throw new Error(`Integration with ID ${id} not found`)
      }

      const provider = this.providerFactory.createProvider(integration)
      const isConnected = await provider.testConnection()

      // Update integration status based on connection test
      const status = isConnected ? IntegrationStatus.ACTIVE : IntegrationStatus.ERROR
      await this.integrationRepository.update(id, { status, updatedAt: new Date() })

      return isConnected
    } catch (error) {
      logger.error("Error testing integration connection", { error, id })

      // Update integration status to ERROR
      await this.integrationRepository.update(id, {
        status: IntegrationStatus.ERROR,
        updatedAt: new Date(),
      })

      throw error
    }
  }

  async syncData(id: string): Promise<void> {
    try {
      const integration = await this.integrationRepository.findById(id)

      if (!integration) {
        throw new Error(`Integration with ID ${id} not found`)
      }

      const provider = this.providerFactory.createProvider(integration)
      await provider.syncData()

      // Update lastSyncAt and status
      await this.integrationRepository.update(id, {
        lastSyncAt: new Date(),
        status: IntegrationStatus.ACTIVE,
        updatedAt: new Date(),
      })
    } catch (error) {
      logger.error("Error syncing integration data", { error, id })

      // Update integration status to ERROR
      await this.integrationRepository.update(id, {
        status: IntegrationStatus.ERROR,
        updatedAt: new Date(),
      })

      throw error
    }
  }
}
