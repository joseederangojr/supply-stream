import { injectable, inject } from "inversify"
import type { DashboardService } from "../domain/services/DashboardService"
import type { DashboardRepository } from "../domain/repositories/DashboardRepository"
import type { Dashboard, CreateDashboardDto, UpdateDashboardDto, DashboardWidget } from "../domain/models/Dashboard"
import { logger } from "../utils/logger"

@injectable()
export class DashboardServiceImpl implements DashboardService {
  constructor(
    @inject("DashboardRepository") private dashboardRepository: DashboardRepository
  ) {}

  async createDashboard(dto: CreateDashboardDto): Promise<Dashboard> {
    try {
      return await this.dashboardRepository.create(dto)
    } catch (error) {
      logger.error("Error creating dashboard", {
        error: error instanceof Error ? error.message : "Unknown error",
        dto,
      })
      throw error
    }
  }

  async getDashboardById(id: string): Promise<Dashboard | null> {
    try {
      return await this.dashboardRepository.findById(id)
    } catch (error) {
      logger.error("Error getting dashboard by ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        id,
      })
      throw error
    }
  }

  async getDashboardsByUserId(userId: string): Promise<Dashboard[]> {
    try {
      return await this.dashboardRepository.findByUserId(userId)
    } catch (error) {
      logger.error("Error getting dashboards by user ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      })
      throw error
    }
  }

  async getDashboardsByOrganizationId(organizationId: string): Promise<Dashboard[]> {
    try {
      return await this.dashboardRepository.findByOrganizationId(organizationId)
    } catch (error) {
      logger.error("Error getting dashboards by organization ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
      })
      throw error
    }
  }

  async getDefaultDashboard(userId?: string, organizationId?: string): Promise<Dashboard | null> {
    try {
      return await this.dashboardRepository.findDefault(userId, organizationId)
    } catch (error) {
      logger.error("Error getting default dashboard", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
        organizationId,
      })
      throw error
    }
  }

  async updateDashboard(id: string, dto: UpdateDashboardDto): Promise<Dashboard | null> {
    try {
      return await this.dashboardRepository.update(id, dto)
    } catch (error) {
      logger.error("Error updating dashboard", {
        error: error instanceof Error ? error.message : "Unknown error",
        id,
        dto,
      })
      throw error
    }
  }

  async addWidget(dashboardId: string, widget: Omit<DashboardWidget, "id">): Promise<Dashboard | null> {
    try {
      // Get the dashboard
      const dashboard = await this.dashboardRepository.findById(dashboardId)

      if (!dashboard) {
        return null
      }

      // Add the widget
      const updatedWidgets = [...dashboard.widgets, widget]

      // Update the dashboard
      return await this.dashboardRepository.update(dashboardId, {
        widgets: updatedWidgets,
      })
    } catch (error) {
      logger.error("Error adding widget to dashboard", {
        error: error instanceof Error ? error.message : "Unknown error",
        dashboardId,
        widget,
      })
      throw error
    }
  }

  async updateWidget(
    dashboardId: string,
    widgetId: string,
    widget: Partial<Omit<DashboardWidget, "id">>,
  ): Promise<Dashboard | null> {
    try {
      // Get the dashboard
      const dashboard = await this.dashboardRepository.findById(dashboardId)

      if (!dashboard) {
        return null
      }

      // Find the widget
      const widgetIndex = dashboard.widgets.findIndex((w) => w.id === widgetId)

      if (widgetIndex === -1) {
        return null
      }

      // Update the widget
      const updatedWidgets = [...dashboard.widgets]
      updatedWidgets[widgetIndex] = {
        ...updatedWidgets[widgetIndex],
        ...widget,
      }

      // Update the dashboard
      return await this.dashboardRepository.update(dashboardId, {
        widgets: updatedWidgets,
      })
    } catch (error) {
      logger.error("Error updating widget in dashboard", {
        error: error instanceof Error ? error.message : "Unknown error",
        dashboardId,
        widgetId,
        widget,
      })
      throw error
    }
  }

  async removeWidget(dashboardId: string, widgetId: string): Promise<Dashboard | null> {
    try {
      // Get the dashboard
      const dashboard = await this.dashboardRepository.findById(dashboardId)

      if (!dashboard) {
        return null
      }

      // Remove the widget
      const updatedWidgets = dashboard.widgets.filter((w) => w.id !== widgetId)

      // Update the dashboard
      return await this.dashboardRepository.update(dashboardId, {
        widgets: updatedWidgets,
      })
    } catch (error) {
      logger.error("Error removing widget from dashboard", {
        error: error instanceof Error ? error.message : "Unknown error",
        dashboardId,
        widgetId,
      })
      throw error
    }
  }

  async deleteDashboard(id: string): Promise<boolean> {
    try {
      return await this.dashboardRepository.delete(id)
    } catch (error) {
      logger.error("Error deleting dashboard", {
        error: error instanceof Error ? error.message : "Unknown error",
        id,
      })
      throw error
    }
  }
}
