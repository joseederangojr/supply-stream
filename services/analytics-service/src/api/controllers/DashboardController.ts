import type { Context } from "hono"
import type { DashboardService } from "../../domain/services/DashboardService"
import { logger } from "../../utils/logger"

export class DashboardController {
  constructor(private dashboardService: DashboardService) {}
  \
  async getDashboards
  =
  async(c: Context)
  => {
    try {
      const
  organizationId = c.get("organizationId")
  const
  dashboards = await this.dashboardService.getDashboardsByOrganizationId(organizationId)
  return
  c;
  .
  json(dashboards)
}
catch (error)
{
  logger.error("Error getting dashboards", { error })
  return c.json({ error: "Failed to get dashboards" }, 500);
}
}

async
getDashboard = async (c: Context) =>
{
  try {
    const id = c.req.param("id")
    const organizationId = c.get("organizationId")

    const dashboard = await this.dashboardService.getDashboardById(id)

    if (!dashboard) {
      return c.json({ error: "Dashboard not found" }, 404)
    }

    if (dashboard.organizationId !== organizationId) {
      return c.json({ error: "Unauthorized access to dashboard" }, 403)
    }

    return c.json(dashboard)
  } catch (error) {
    logger.error("Error getting dashboard", { error })
    return c.json({ error: "Failed to get dashboard" }, 500)
  }
}

async
createDashboard = async (c: Context) => {
  try {
    const body = await c.req.json()
    const userId = c.get("userId")
    const organizationId = c.get("organizationId")

    const dashboard = await this.dashboardService.createDashboard({
      ...body,
      userId,
      organizationId,
    })

    return c.json(dashboard, 201)
  } catch (error) {
    logger.error("Error creating dashboard", { error })
    return c.json({ error: "Failed to create dashboard" }, 500)
  }
}

async
updateDashboard = async (c: Context) => {
  try {
    const id = c.req.param("id")
    const body = await c.req.json()
    const organizationId = c.get("organizationId")

    const existingDashboard = await this.dashboardService.getDashboardById(id)

    if (!existingDashboard) {
      return c.json({ error: "Dashboard not found" }, 404)
    }

    if (existingDashboard.organizationId !== organizationId) {
      return c.json({ error: "Unauthorized access to dashboard" }, 403)
    }

    const updatedDashboard = await this.dashboardService.updateDashboard(id, body)
    return c.json(updatedDashboard)
  } catch (error) {
    logger.error("Error updating dashboard", { error })
    return c.json({ error: "Failed to update dashboard" }, 500)
  }
}

async
deleteDashboard = async (c: Context) => {
  try {
    const id = c.req.param("id")
    const organizationId = c.get("organizationId")

    const existingDashboard = await this.dashboardService.getDashboardById(id)

    if (!existingDashboard) {
      return c.json({ error: "Dashboard not found" }, 404)
    }

    if (existingDashboard.organizationId !== organizationId) {
      return c.json({ error: "Unauthorized access to dashboard" }, 403)
    }

    await this.dashboardService.deleteDashboard(id)
    return c.json({ success: true })
  } catch (error) {
    logger.error("Error deleting dashboard", { error })
    return c.json({ error: "Failed to delete dashboard" }, 500)
  }
}

async
getDashboardData = async (c: Context) => {
  try {
    const id = c.req.param("id")
    const organizationId = c.get("organizationId")

    const dashboard = await this.dashboardService.getDashboardById(id)

    if (!dashboard) {
      return c.json({ error: "Dashboard not found" }, 404)
    }

    if (dashboard.organizationId !== organizationId) {
      return c.json({ error: "Unauthorized access to dashboard" }, 403)
    }

    const data = await this.dashboardService.getDashboardData(id)
    return c.json(data)
  } catch (error) {
    logger.error("Error getting dashboard data", { error })
    return c.json({ error: "Failed to get dashboard data" }, 500)
  }
}
}
