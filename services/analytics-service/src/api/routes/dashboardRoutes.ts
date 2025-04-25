import { Hono } from "hono"
import { container } from "../../infrastructure/di/container"
import { DashboardController } from "../controllers/DashboardController"
import { authMiddleware } from "../middleware/authMiddleware"

const dashboardController = container.resolve(DashboardController)
const dashboardRoutes = new Hono()

// Apply auth middleware to all routes
dashboardRoutes.use("*", authMiddleware)

// Dashboard routes
dashboardRoutes.get("/", dashboardController.getDashboards)
dashboardRoutes.get("/:id", dashboardController.getDashboard)
dashboardRoutes.post("/", dashboardController.createDashboard)
dashboardRoutes.put("/:id", dashboardController.updateDashboard)
dashboardRoutes.delete("/:id", dashboardController.deleteDashboard)
dashboardRoutes.get("/:id/data", dashboardController.getDashboardData)

export { dashboardRoutes }
