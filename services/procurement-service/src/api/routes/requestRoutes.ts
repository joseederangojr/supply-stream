import { Hono } from "hono"
import type { RequestController } from "../controllers/RequestController"
import { authMiddleware } from "../middleware/authMiddleware"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"

export const createRequestRoutes = (controller: RequestController) => {
  const app = new Hono()

  // Apply authentication middleware
  app.use("*", authMiddleware)

  // Get request by ID
  app.get("/api/v1/requests/:id", async (c) => {
    const id = c.req.param("id")
    const request = await controller.getRequestById(id)

    if (!request) {
      return c.json({ error: "Request not found" }, 404)
    }

    return c.json(request)
  })

  // Get requests by client ID
  app.get("/api/v1/requests", async (c) => {
    const clientId = c.req.query("clientId")
    const page = c.req.query("page") ? Number.parseInt(c.req.query("page")) : undefined
    const limit = c.req.query("limit") ? Number.parseInt(c.req.query("limit")) : undefined

    if (!clientId) {
      return c.json({ error: "Client ID is required" }, 400)
    }

    const requests = await controller.getRequestsByClientId(clientId, page, limit)
    return c.json(requests)
  })

  // Create request
  const createRequestSchema = z.object({
    clientId: z.string(),
    branchId: z.string(),
    title: z.string().min(1),
    description: z.string(),
    requestorId: z.string(),
    deliveryAddress: z.object({
      street: z.string(),
      city: z.string(),
      postalCode: z.string(),
      country: z.string(),
    }),
    totalBudget: z.number().positive(),
    costCenter: z.string().optional(),
    urgency: z.enum(["LOW", "MEDIUM", "HIGH"]),
    desiredDeliveryDate: z
      .string()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
  })

  app.post("/api/v1/requests", zValidator("json", createRequestSchema), async (c) => {
    try {
      const body = await c.req.valid("json")
      const request = await controller.createRequest(body)
      return c.json(request, 201)
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "Failed to create request" }, 400)
    }
  })

  // Update request
  const updateRequestSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    deliveryAddress: z
      .object({
        street: z.string(),
        city: z.string(),
        postalCode: z.string(),
        country: z.string(),
      })
      .optional(),
    totalBudget: z.number().positive().optional(),
    costCenter: z.string().optional(),
    urgency: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    desiredDeliveryDate: z
      .string()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
  })

  app.put("/api/v1/requests/:id", zValidator("json", updateRequestSchema), async (c) => {
    const id = c.req.param("id")
    const body = await c.req.valid("json")

    const request = await controller.updateRequest(id, body)

    if (!request) {
      return c.json({ error: "Request not found" }, 404)
    }

    return c.json(request)
  })

  // Delete request
  app.delete("/api/v1/requests/:id", async (c) => {
    const id = c.req.param("id")

    const success = await controller.deleteRequest(id)

    if (!success) {
      return c.json({ error: "Request not found" }, 404)
    }

    return c.json({ success: true })
  })

  // Publish request
  app.post("/api/v1/requests/:id/publish", async (c) => {
    const id = c.req.param("id")

    const request = await controller.publishRequest(id)

    if (!request) {
      return c.json({ error: "Request not found" }, 404)
    }

    return c.json(request)
  })

  return app
}
