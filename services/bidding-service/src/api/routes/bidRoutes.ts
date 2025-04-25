import { Hono } from "hono"
import type { BidController } from "../controllers/BidController"
import { authMiddleware } from "../middleware/authMiddleware"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"

export const createBidRoutes = (controller: BidController) => {
  const app = new Hono()

  // Apply authentication middleware to all routes
  app.use("*", authMiddleware)

  // Get bid by ID
  app.get("/api/v1/bids/:id", async (c) => {
    const id = c.req.param("id")
    const bid = await controller.getBidById(id)

    if (!bid) {
      return c.json({ error: "Bid not found" }, 404)
    }

    return c.json(bid)
  })

  // Get bids by request ID
  app.get("/api/v1/requests/:requestId/bids", async (c) => {
    const requestId = c.req.param("requestId")
    const page = c.req.query("page") ? Number.parseInt(c.req.query("page")) : undefined
    const limit = c.req.query("limit") ? Number.parseInt(c.req.query("limit")) : undefined

    const bids = await controller.getBidsByRequestId(requestId, page, limit)
    return c.json(bids)
  })

  // Get bids by supplier ID
  app.get("/api/v1/suppliers/:supplierId/bids", async (c) => {
    const supplierId = c.req.param("supplierId")
    const page = c.req.query("page") ? Number.parseInt(c.req.query("page")) : undefined
    const limit = c.req.query("limit") ? Number.parseInt(c.req.query("limit")) : undefined

    const bids = await controller.getBidsBySupplierId(supplierId, page, limit)
    return c.json(bids)
  })

  // Create bid
  const createBidSchema = z.object({
    requestId: z.string(),
    supplierId: z.string(),
    branchId: z.string(),
    notes: z.string().optional(),
    itemBids: z.array(
      z.object({
        itemId: z.string(),
        unitPrice: z.number().positive(),
        quantity: z.number().positive(),
        notes: z.string().optional(),
        attachmentIds: z.array(z.string()).optional(),
      }),
    ),
  })

  app.post("/api/v1/bids", zValidator("json", createBidSchema), async (c) => {
    try {
      const body = await c.req.valid("json")
      const bid = await controller.createBid(body)
      return c.json(bid, 201)
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "Failed to create bid" }, 400)
    }
  })

  // Update bid
  const updateBidSchema = z.object({
    notes: z.string().optional(),
  })

  app.put("/api/v1/bids/:id", zValidator("json", updateBidSchema), async (c) => {
    const id = c.req.param("id")
    const body = await c.req.valid("json")

    const bid = await controller.updateBid(id, body)

    if (!bid) {
      return c.json({ error: "Bid not found" }, 404)
    }

    return c.json(bid)
  })

  // Delete bid
  app.delete("/api/v1/bids/:id", async (c) => {
    const id = c.req.param("id")

    const result = await controller.deleteBid(id)

    if (!result.success) {
      return c.json({ error: "Bid not found" }, 404)
    }

    return c.json({ success: true })
  })

  // Submit bid
  app.post("/api/v1/bids/:id/submit", async (c) => {
    const id = c.req.param("id")

    try {
      const bid = await controller.submitBid(id)

      if (!bid) {
        return c.json({ error: "Bid not found" }, 404)
      }

      return c.json(bid)
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "Failed to submit bid" }, 400)
    }
  })

  // Withdraw bid
  app.post("/api/v1/bids/:id/withdraw", async (c) => {
    const id = c.req.param("id")

    try {
      const bid = await controller.withdrawBid(id)

      if (!bid) {
        return c.json({ error: "Bid not found" }, 404)
      }

      return c.json(bid)
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "Failed to withdraw bid" }, 400)
    }
  })

  // Accept bid
  app.post("/api/v1/bids/:id/accept", async (c) => {
    const id = c.req.param("id")

    try {
      const bid = await controller.acceptBid(id)

      if (!bid) {
        return c.json({ error: "Bid not found" }, 404)
      }

      return c.json(bid)
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "Failed to accept bid" }, 400)
    }
  })

  // Reject bid
  app.post("/api/v1/bids/:id/reject", async (c) => {
    const id = c.req.param("id")

    try {
      const bid = await controller.rejectBid(id)

      if (!bid) {
        return c.json({ error: "Bid not found" }, 404)
      }

      return c.json(bid)
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "Failed to reject bid" }, 400)
    }
  })

  // Get item bids by bid ID
  app.get("/api/v1/bids/:bidId/items", async (c) => {
    const bidId = c.req.param("bidId")
    const itemBids = await controller.getItemBidsByBidId(bidId)
    return c.json(itemBids)
  })

  // Create item bid
  const createItemBidSchema = z.object({
    bidId: z.string(),
    itemId: z.string(),
    unitPrice: z.number().positive(),
    quantity: z.number().positive(),
    notes: z.string().optional(),
    attachmentIds: z.array(z.string()).optional(),
  })

  app.post("/api/v1/item-bids", zValidator("json", createItemBidSchema), async (c) => {
    try {
      const body = await c.req.valid("json")
      const itemBid = await controller.createItemBid(body)
      return c.json(itemBid, 201)
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "Failed to create item bid" }, 400)
    }
  })

  // Update item bid
  const updateItemBidSchema = z.object({
    unitPrice: z.number().positive().optional(),
    quantity: z.number().positive().optional(),
    notes: z.string().optional(),
    attachmentIds: z.array(z.string()).optional(),
  })

  app.put("/api/v1/item-bids/:id", zValidator("json", updateItemBidSchema), async (c) => {
    const id = c.req.param("id")
    const body = await c.req.valid("json")

    const itemBid = await controller.updateItemBid(id, body)

    if (!itemBid) {
      return c.json({ error: "Item bid not found" }, 404)
    }

    return c.json(itemBid)
  })

  // Delete item bid
  app.delete("/api/v1/item-bids/:id", async (c) => {
    const id = c.req.param("id")

    const result = await controller.deleteItemBid(id)

    if (!result.success) {
      return c.json({ error: "Item bid not found" }, 404)
    }

    return c.json({ success: true })
  })

  return app
}
