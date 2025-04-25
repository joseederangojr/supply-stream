import { v4 as uuidv4 } from "uuid"
import type { BidRepository, PaginationOptions } from "../domain/repositories/BidRepository"
import type { Bid, BidStatus } from "../domain/models/Bid"
import { db } from "../infrastructure/database"
import { logger } from "../utils/logger"

export class PostgresBidRepository implements BidRepository {
  async findById(id: string): Promise<Bid | null> {
    try {
      const result = await db.selectFrom("bids").selectAll().where("id", "=", id).executeTakeFirst()

      return result ? this.mapToModel(result) : null
    } catch (error) {
      logger.error("Error finding bid by ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId: id,
      })
      throw error
    }
  }

  async findByRequestId(requestId: string, options?: PaginationOptions): Promise<Bid[]> {
    try {
      const page = options?.page || 1
      const limit = options?.limit || 10
      const offset = (page - 1) * limit
      const sortBy = options?.sortBy || "created_at"
      const sortDirection = options?.sortDirection || "desc"

      const results = await db
        .selectFrom("bids")
        .selectAll()
        .where("request_id", "=", requestId)
        .orderBy(sortBy, sortDirection)
        .limit(limit)
        .offset(offset)
        .execute()

      return results.map(this.mapToModel)
    } catch (error) {
      logger.error("Error finding bids by request ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId,
      })
      throw error
    }
  }

  async findBySupplierId(supplierId: string, options?: PaginationOptions): Promise<Bid[]> {
    try {
      const page = options?.page || 1
      const limit = options?.limit || 10
      const offset = (page - 1) * limit
      const sortBy = options?.sortBy || "created_at"
      const sortDirection = options?.sortDirection || "desc"

      const results = await db
        .selectFrom("bids")
        .selectAll()
        .where("supplier_id", "=", supplierId)
        .orderBy(sortBy, sortDirection)
        .limit(limit)
        .offset(offset)
        .execute()

      return results.map(this.mapToModel)
    } catch (error) {
      logger.error("Error finding bids by supplier ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        supplierId,
      })
      throw error
    }
  }

  async create(bid: Omit<Bid, "id" | "createdAt" | "updatedAt">): Promise<Bid> {
    try {
      const id = uuidv4()
      const now = new Date()

      const result = await db
        .insertInto("bids")
        .values({
          id,
          request_id: bid.requestId,
          supplier_id: bid.supplierId,
          branch_id: bid.branchId,
          total_amount: bid.totalAmount,
          status: bid.status,
          notes: bid.notes || null,
          created_at: now,
          updated_at: now,
        })
        .returningAll()
        .executeTakeFirstOrThrow()

      return this.mapToModel(result)
    } catch (error) {
      logger.error("Error creating bid", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId: bid.requestId,
        supplierId: bid.supplierId,
      })
      throw error
    }
  }

  async update(id: string, bid: Partial<Bid>): Promise<Bid | null> {
    try {
      // Build update object dynamically based on provided fields
      const updateValues: any = {
        updated_at: new Date(),
      }

      if (bid.totalAmount !== undefined) updateValues.total_amount = bid.totalAmount
      if (bid.status !== undefined) updateValues.status = bid.status
      if (bid.notes !== undefined) updateValues.notes = bid.notes

      const result = await db
        .updateTable("bids")
        .set(updateValues)
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirst()

      return result ? this.mapToModel(result) : null
    } catch (error) {
      logger.error("Error updating bid", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId: id,
      })
      throw error
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db.deleteFrom("bids").where("id", "=", id).executeTakeFirst()

      return result.numDeletedRows > 0
    } catch (error) {
      logger.error("Error deleting bid", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId: id,
      })
      throw error
    }
  }

  private mapToModel(data: any): Bid {
    return {
      id: data.id,
      requestId: data.request_id,
      supplierId: data.supplier_id,
      branchId: data.branch_id,
      totalAmount: data.total_amount,
      status: data.status as BidStatus,
      notes: data.notes || undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }
}
