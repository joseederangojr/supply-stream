import request from "supertest"
import { app } from "../../app"
import { db } from "../../infrastructure/database"
import { container } from "../../infrastructure/di/container"
import type { AnalyticsService } from "../../domain/services/AnalyticsService"
import type { CreateAnalyticsEventDto } from "../../domain/models/AnalyticsEvent"
import { describe, beforeAll, afterAll, it, jest, beforeEach } from "@jest/globals"

// Mock JWT verification
jest.mock("../../api/middleware/authMiddleware", () => ({
  authenticate: (req, res, next) => {
    req.user = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "test@example.com",
      role: "CLIENT",
      organizationId: "123e4567-e89b-12d3-a456-426614174001",
    }
    next()
  },
}))

describe("Analytics API Integration Tests", () => {
  beforeAll(async () => {
    // Clear test data
    await db.deleteFrom("analytics_events").execute()
  })

  afterAll(async () => {
    // Clean up
    await db.deleteFrom("analytics_events").execute()
    await db.destroy()
  })

  describe("POST /api/analytics/events", () => {
    it("should create a new analytics event", async () => {
      const eventData: CreateAnalyticsEventDto = {
        type: "PAGE_VIEW",
        userId: "123e4567-e89b-12d3-a456-426614174000",
        organizationId: "123e4567-e89b-12d3-a456-426614174001",
        data: {
          page: "/dashboard",
          referrer: "/login",
        },
      }

      const response = await request(app).post("/api/analytics/events").send(eventData).expect(201)

      expect(response.body).toHaveProperty("id")
      expect(response.body.type).toBe(eventData.type)
      expect(response.body.userId).toBe(eventData.userId)
      expect(response.body.organizationId).toBe(eventData.organizationId)
      expect(response.body.data).toEqual(eventData.data)
    })
  })

  describe("GET /api/analytics/events", () => {
    beforeEach(async () => {
      // Create test events
      const analyticsService = container.get<AnalyticsService>("AnalyticsService")

      await analyticsService.trackEvent({
        type: "PAGE_VIEW",
        userId: "123e4567-e89b-12d3-a456-426614174000",
        organizationId: "123e4567-e89b-12d3-a456-426614174001",
        data: { page: "/dashboard" },
      })

      await analyticsService.trackEvent({
        type: "BUTTON_CLICK",
        userId: "123e4567-e89b-12d3-a456-426614174000",
        organizationId: "123e4567-e89b-12d3-a456-426614174001",
        data: { button: "create-request" },
      })
    })

    it("should get events by type", async () => {
      const response = await request(app).get("/api/analytics/events?type=PAGE_VIEW").expect(200)

      expect(response.body).toBeInstanceOf(Array)
      expect(response.body.length).toBeGreaterThanOrEqual(1)
      expect(response.body[0].type).toBe("PAGE_VIEW")
    })

    it("should get events by user ID", async () => {
      const response = await request(app)
        .get("/api/analytics/events/user/123e4567-e89b-12d3-a456-426614174000")
        .expect(200)

      expect(response.body).toBeInstanceOf(Array)
      expect(response.body.length).toBeGreaterThanOrEqual(2)
      expect(response.body[0].userId).toBe("123e4567-e89b-12d3-a456-426614174000")
    })
  })
})
