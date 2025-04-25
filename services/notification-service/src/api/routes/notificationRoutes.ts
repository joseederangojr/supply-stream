import { Hono } from "hono"
import type { NotificationController } from "../controllers/NotificationController"
import { authMiddleware } from "../middleware/authMiddleware"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"

export const createNotificationRoutes = (controller: NotificationController) => {
  const app = new Hono()

  // Apply authentication middleware to all routes
  app.use("*", authMiddleware)

  // Get notification by ID
  app.get("/api/v1/notifications/:id", async (c) => {
    const id = c.req.param("id")
    const notification = await controller.getNotificationById(id)

    if (!notification) {
      return c.json({ error: "Notification not found" }, 404)
    }

    return c.json(notification)
  })

  // Get notifications by user ID
  app.get("/api/v1/users/:userId/notifications", async (c) => {
    const userId = c.req.param("userId")
    const page = c.req.query("page") ? Number.parseInt(c.req.query("page")) : undefined
    const limit = c.req.query("limit") ? Number.parseInt(c.req.query("limit")) : undefined

    const notifications = await controller.getNotificationsByUserId(userId, page, limit)
    return c.json(notifications)
  })

  // Get unread notifications by user ID
  app.get("/api/v1/users/:userId/notifications/unread", async (c) => {
    const userId = c.req.param("userId")
    const page = c.req.query("page") ? Number.parseInt(c.req.query("page")) : undefined
    const limit = c.req.query("limit") ? Number.parseInt(c.req.query("limit")) : undefined

    const notifications = await controller.getUnreadNotificationsByUserId(userId, page, limit)
    return c.json(notifications)
  })

  // Create notification
  const createNotificationSchema = z.object({
    userId: z.string(),
    type: z.string(),
    title: z.string(),
    message: z.string(),
    data: z.record(z.any()).optional(),
  })

  app.post("/api/v1/notifications", zValidator("json", createNotificationSchema), async (c) => {
    try {
      const body = await c.req.valid("json")
      const notification = await controller.createNotification(body)
      return c.json(notification, 201)
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "Failed to create notification" }, 400)
    }
  })

  // Mark notification as read
  app.put("/api/v1/notifications/:id/read", async (c) => {
    const id = c.req.param("id")
    const result = await controller.markAsRead(id)

    if (!result.success) {
      return c.json({ error: "Notification not found" }, 404)
    }

    return c.json(result)
  })

  // Mark all notifications as read for a user
  app.put("/api/v1/users/:userId/notifications/read", async (c) => {
    const userId = c.req.param("userId")
    const result = await controller.markAllAsRead(userId)
    return c.json(result)
  })

  // Delete notification
  app.delete("/api/v1/notifications/:id", async (c) => {
    const id = c.req.param("id")
    const result = await controller.deleteNotification(id)

    if (!result.success) {
      return c.json({ error: "Notification not found" }, 404)
    }

    return c.json(result)
  })

  // Delete all notifications for a user
  app.delete("/api/v1/users/:userId/notifications", async (c) => {
    const userId = c.req.param("userId")
    const result = await controller.deleteAllNotifications(userId)
    return c.json(result)
  })

  return app
}
