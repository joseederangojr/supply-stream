import { Hono } from "hono"
import type { AuthController } from "../controllers/AuthController"
import { authMiddleware } from "../middleware/authMiddleware"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"

export const createAuthRoutes = (controller: AuthController) => {
  const app = new Hono()

  // Register
  const registerSchema = z.object({
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

  app.post("/api/v1/auth/register", zValidator("json", registerSchema), async (c) => {
    try {
      const body = await c.req.valid("json")
      const user = await controller.register(body)
      return c.json(user, 201)
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "Failed to register user" }, 400)
    }
  })

  // Login
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
  })

  app.post("/api/v1/auth/login", zValidator("json", loginSchema), async (c) => {
    try {
      const body = await c.req.valid("json")
      const result = await controller.login(body)
      return c.json(result)
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "Failed to login" }, 401)
    }
  })

  // Refresh token
  const refreshTokenSchema = z.object({
    refreshToken: z.string(),
  })

  app.post("/api/v1/auth/refresh-token", zValidator("json", refreshTokenSchema), async (c) => {
    try {
      const body = await c.req.valid("json")
      const tokens = await controller.refreshToken(body.refreshToken)
      return c.json(tokens)
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "Failed to refresh token" }, 401)
    }
  })

  // Logout
  const logoutSchema = z.object({
    refreshToken: z.string(),
  })

  app.post("/api/v1/auth/logout", zValidator("json", logoutSchema), async (c) => {
    try {
      const body = await c.req.valid("json")
      await controller.logout(body.refreshToken)
      return c.json({ success: true })
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "Failed to logout" }, 400)
    }
  })

  // Logout all devices (requires authentication)
  app.post("/api/v1/auth/logout-all", authMiddleware, async (c) => {
    try {
      const user = c.get("user") as any
      await controller.logoutAll(user.sub)
      return c.json({ success: true })
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "Failed to logout from all devices" }, 400)
    }
  })

  // Change password (requires authentication)
  const changePasswordSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8),
  })

  app.post("/api/v1/auth/change-password", authMiddleware, zValidator("json", changePasswordSchema), async (c) => {
    try {
      const body = await c.req.valid("json")
      const user = c.get("user") as any
      await controller.changePassword(user.sub, body)
      return c.json({ success: true })
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "Failed to change password" }, 400)
    }
  })

  // Request password reset
  const resetPasswordSchema = z.object({
    email: z.string().email(),
  })

  app.post("/api/v1/auth/reset-password", zValidator("json", resetPasswordSchema), async (c) => {
    try {
      const body = await c.req.valid("json")
      await controller.resetPassword(body.email)
      // Always return success, even if email doesn't exist (for security)
      return c.json({ success: true })
    } catch (error) {
      // Log the error but don't expose it
      return c.json({ success: true })
    }
  })

  // Confirm password reset
  const confirmResetPasswordSchema = z.object({
    token: z.string(),
    newPassword: z.string().min(8),
  })

  app.post("/api/v1/auth/confirm-reset-password", zValidator("json", confirmResetPasswordSchema), async (c) => {
    try {
      const body = await c.req.valid("json")
      await controller.confirmResetPassword(body.token, body.newPassword)
      return c.json({ success: true })
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "Failed to reset password" }, 400)
    }
  })

  // Verify token
  app.post("/api/v1/auth/verify", authMiddleware, async (c) => {
    try {
      const user = c.get("user")
      return c.json({ user })
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "Invalid token" }, 401)
    }
  })

  return app
}
