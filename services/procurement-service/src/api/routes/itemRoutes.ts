import { Hono } from "hono"
import type { ItemController } from "../controllers/ItemController"
import { authMiddleware } from "../middleware/authMiddleware"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"

export const createItemRoutes = (controller: ItemController) => {
  const app = new Hono()

  // Apply authentication middleware
  app.use("*", authMiddleware)

  // Get item by ID
  app.get("/api/v1/items/:id", async (c) => {
    const id = c.req.param("id")
    const item = await controller.getItemById(id)

    if (!item) {
      return c.json({ error: "Item not found" }, 404)
    }

    return c.json(item)
  })

  // Get items by request ID
  app.get("/api/v1/requests/:requestId/items", async (c) => {
    const requestId = c.req.param("requestId")
    const items = await controller.getItemsByRequestId(requestId)
    return c.json(items)
  })

  // Create item
  const createItemSchema = z.object({
    requestId: z.string(),
    name: z.string().min(1),
    description: z.string(),
    category: z.string(),
    unitOfMeasure: z.string(),
    quantity: z.number().positive(),
    budget: z.number().positive(),
    manufacturer: z.string().optional(),
    partNumber: z.string().optional(),
    leadTime: z.number().optional(),
    dimensions: z
      .object({
        length: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        weight: z.number().optional(),
        unit: z.string().optional(),
      })
      .optional(),
    supplierCanAttach: z.boolean(),
  })

  app.post("/api/v1/requests/:requestId/items", zValidator("json", createItemSchema), async (c) => {
    try {
      const requestId = c.req.param("requestId")
      const body = await c.req.valid("json")

      // Ensure the requestId in the path matches the one in the body
      if (body.requestId !== requestId) {
        return c.json({ error: "Request ID mismatch" }, 400)
      }

      const item = await controller.createItem(body)
      return c.json(item, 201)
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "Failed to create item" }, 400)
    }
  })

  // Update item
  const updateItemSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    unitOfMeasure: z.string().optional(),
    quantity: z.number().positive().optional(),
    budget: z.number().positive().optional(),
    manufacturer: z.string().optional(),
    partNumber: z.string().optional(),
    leadTime: z.number().optional(),
    dimensions: z
      .object({
        length: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        weight: z.number().optional(),
        unit: z.string().optional(),
      })
      .optional(),
    supplierCanAttach: z.boolean().optional(),
  })

  app.put("/api/v1/items/:id", zValidator("json", updateItemSchema), async (c) => {
    const id = c.req.param("id")
    const body = await c.req.valid("json")

    const item = await controller.updateItem(id, body)

    if (!item) {
      return c.json({ error: "Item not found" }, 404)
    }

    return c.json(item)
  })

  // Delete item
  app.delete("/api/v1/items/:id", async (c) => {
    const id = c.req.param("id")

    const success = await controller.deleteItem(id)

    if (!success) {
      return c.json({ error: "Item not found" }, 404)
    }

    return c.json({ success: true })
  })

  return app
}
