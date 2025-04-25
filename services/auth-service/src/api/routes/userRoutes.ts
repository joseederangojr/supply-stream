import { Hono } from "hono"
import type { UserController } from "../controllers/UserController"
import { authMiddleware } from "../middleware/authMiddleware"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"

export const createUserRoutes = (controller: UserController) => {
  const app = new Hono()

  // Apply authentication middleware to all routes
  app.use("*", authMiddleware)

  // Get user by ID
  app.get("/api/v1/users/:id", async (c) => {
    const id = c.req.param("id")
    const user = await controller.getUserById(id)

    if (!user) {
      return c.json({ error: "User not found" }, 404)
    }

    return c.json(user)
  })

  // Get user by email
  app.get("/api/v1/users/email/:email", async (c) => {
    const email = c.req.param("email")
    const user = await controller.getUserByEmail(email)

    if (!user) {
      return c.json({ error: "User not found" }, 404)
    }

    return c.json(user)
  })

  // Get users by organization ID
  app.get("/api/v1/organizations/:organizationId/users", async (c) => {
    const organizationId = c.req.param("organizationId")
    const users = await controller.getUsersByOrganizationId(organizationId)
    return c.json(users)
  })

  // Create user
  const createUserSchema = z.object({
    organizationId: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string(),
    title: z.string().optional(),
    phone: z.string().optional(),
    timezone: z.string().optional(),
    role: z.string(),
    permissions: z.array(z.string()),
  })

  app.post("/api/v1/users", zValidator("json", createUserSchema), async (c) => {
    try {
      const body = await c.req.valid("json")
      const user = await controller.createUser(body)
      return c.json(user, 201)
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "Failed to create user" }, 400)
    }
  })

  // Update user
  const updateUserSchema = z.object({
    name: z.string().optional(),
    title: z.string().optional(),
    phone: z.string().optional(),
    timezone: z.string().optional(),
    role: z.string().optional(),
  })

  app.put("/api/v1/users/:id", zValidator("json", updateUserSchema), async (c) => {
    const id = c.req.param("id")
    const body = await c.req.valid("json")

    const user = await controller.updateUser(id, body)

    if (!user) {
      return c.json({ error: "User not found" }, 404)
    }

    return c.json(user)
  })

  // Delete user
  app.delete("/api/v1/users/:id", async (c) => {
    const id = c.req.param("id")

    const result = await controller.deleteUser(id)

    if (!result.success) {
      return c.json({ error: "User not found" }, 404)
    }

    return c.json({ success: true })
  })

  // Update user permissions
  const updatePermissionsSchema = z.object({
    permissions: z.array(z.string()),
  })

  app.put("/api/v1/users/:id/permissions", zValidator("json", updatePermissionsSchema), async (c) => {
    const id = c.req.param("id")
    const body = await c.req.valid("json")

    const user = await controller.updateUserPermissions(id, body.permissions)

    if (!user) {
      return c.json({ error: "User not found" }, 404)
    }

    return c.json(user)
  })

  // Activate user
  app.put("/api/v1/users/:id/activate", async (c) => {
    const id = c.req.param("id")

    const user = await controller.activateUser(id)

    if (!user) {
      return c.json({ error: "User not found" }, 404)
    }

    return c.json(user)
  })

  // Deactivate user
  app.put("/api/v1/users/:id/deactivate", async (c) => {
    const id = c.req.param("id")

    const user = await controller.deactivateUser(id)

    if (!user) {
      return c.json({ error: "User not found" }, 404)
    }

    return c.json(user)
  })

  return app
}
