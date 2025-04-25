import { v4 as uuidv4 } from "uuid"
import type { RequestRepository, PaginationOptions } from "../domain/repositories/RequestRepository"
import type { Request, Address, GeoCoordinates, RequestStatus } from "../domain/models/Request"
import { db } from "../infrastructure/database"
import { logger } from "../utils/logger"

export class PostgresRequestRepository implements RequestRepository {
  async findById(id: string): Promise<Request | null> {
    try {
      const result = await db.selectFrom("requests").selectAll().where("id", "=", id).executeTakeFirst()

      return result ? this.mapToModel(result) : null
    } catch (error) {
      logger.error("Error finding request by ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId: id,
      })
      throw error
    }
  }

  async findByClientId(clientId: string, options?: PaginationOptions): Promise<Request[]> {
    try {
      const page = options?.page || 1
      const limit = options?.limit || 10
      const offset = (page - 1) * limit
      const sortBy = options?.sortBy || "created_at"
      const sortDirection = options?.sortDirection || "desc"

      const results = await db
        .selectFrom("requests")
        .selectAll()
        .where("client_id", "=", clientId)
        .orderBy(sortBy, sortDirection)
        .limit(limit)
        .offset(offset)
        .execute()

      return results.map(this.mapToModel)
    } catch (error) {
      logger.error("Error finding requests by client ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        clientId,
      })
      throw error
    }
  }

  async create(request: Omit<Request, "id" | "createdAt" | "updatedAt">): Promise<Request> {
    try {
      const id = uuidv4()
      const now = new Date()

      const result = await db
        .insertInto("requests")
        .values({
          id,
          client_id: request.clientId,
          branch_id: request.branchId,
          requisition_number: request.requisitionNumber,
          title: request.title,
          description: request.description,
          requestor_id: request.requestorId,
          delivery_address: request.deliveryAddress as any,
          delivery_latitude: request.deliveryCoordinates.latitude,
          delivery_longitude: request.deliveryCoordinates.longitude,
          total_budget: request.totalBudget,
          cost_center: request.costCenter,
          urgency: request.urgency,
          status: request.status,
          desired_delivery_date: request.desiredDeliveryDate || null,
          created_at: now,
          updated_at: now,
        })
        .returningAll()
        .executeTakeFirstOrThrow()

      return this.mapToModel(result)
    } catch (error) {
      logger.error("Error creating request", {
        error: error instanceof Error ? error.message : "Unknown error",
        clientId: request.clientId,
      })
      throw error
    }
  }

  async update(id: string, request: Partial<Request>): Promise<Request | null> {
    try {
      // Build update object dynamically based on provided fields
      const updateValues: any = {
        updated_at: new Date(),
      }

      if (request.title !== undefined) updateValues.title = request.title
      if (request.description !== undefined) updateValues.description = request.description
      if (request.deliveryAddress !== undefined) updateValues.delivery_address = request.deliveryAddress
      if (request.deliveryCoordinates !== undefined) {
        updateValues.delivery_latitude = request.deliveryCoordinates.latitude
        updateValues.delivery_longitude = request.deliveryCoordinates.longitude
      }
      if (request.totalBudget !== undefined) updateValues.total_budget = request.totalBudget
      if (request.costCenter !== undefined) updateValues.cost_center = request.costCenter
      if (request.urgency !== undefined) updateValues.urgency = request.urgency
      if (request.status !== undefined) updateValues.status = request.status
      if (request.desiredDeliveryDate !== undefined) updateValues.desired_delivery_date = request.desiredDeliveryDate

      const result = await db
        .updateTable("requests")
        .set(updateValues)
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirst()

      return result ? this.mapToModel(result) : null
    } catch (error) {
      logger.error("Error updating request", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId: id,
      })
      throw error
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db.deleteFrom("requests").where("id", "=", id).executeTakeFirst()

      return result.numDeletedRows > 0
    } catch (error) {
      logger.error("Error deleting request", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId: id,
      })
      throw error
    }
  }

  private mapToModel(data: any): Request {
    const address: Address = data.delivery_address
    const coordinates: GeoCoordinates = {
      latitude: data.delivery_latitude,
      longitude: data.delivery_longitude,
    }

    return {
      id: data.id,
      clientId: data.client_id,
      branchId: data.branch_id,
      requisitionNumber: data.requisition_number,
      title: data.title,
      description: data.description,
      requestorId: data.requestor_id,
      deliveryAddress: address,
      deliveryCoordinates: coordinates,
      totalBudget: data.total_budget,
      costCenter: data.cost_center,
      urgency: data.urgency as RequestStatus,
      status: data.status as RequestStatus,
      desiredDeliveryDate: data.desired_delivery_date ? new Date(data.desired_delivery_date) : new Date(),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }
}
