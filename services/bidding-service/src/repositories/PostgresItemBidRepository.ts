import { v4 as uuidv4 } from "uuid"
import type { ItemBidRepository } from "../domain/repositories/ItemBidRepository"
import type { ItemBid } from "../domain/models/Bid"
import { db } from "../infrastructure/database"
import { logger } from "../utils/logger"

export class PostgresItemBidRepository implements ItemBidRepository {
  async findById(id: string): Promise<ItemBid | null> {
    try {
      const result = await db.selectFrom("item_bids").selectAll().where("id", "=", id).executeTakeFirst()

      return result ? this.mapToModel(result) : null
    } catch (error) {
      logger.error("Error finding item bid by ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        itemBidId: id,
      })
      throw error
    }
  }

  async findByBidId(bidId: string): Promise<ItemBid[]> {
    try {
      const results = await db.selectFrom("item_bids").selectAll().where("bid_id", "=", bidId).execute()

      return results.map(this.mapToModel)
    } catch (error) {
      logger.error("Error finding item bids by bid ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId,
      })
      throw error
    }
  }

  async findByItemId(itemId: string): Promise<ItemBid[]> {
    try {
      const results = await db.selectFrom("item_bids").selectAll().where("item_id", "=", itemId).execute()

      return results.map(this.mapToModel)
    } catch (error) {
      logger.error("Error finding item bids by item ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        itemId,
      })
      throw error
    }
  }

  async create(itemBid: Omit<ItemBid, "id" | "createdAt" | "updatedAt">): Promise<ItemBid> {
    try {
      const id = uuidv4()
      const now = new Date()

      const result = await db
        .insertInto("item_bids")
        .values({
          id,
          bid_id: itemBid.bidId,
          item_id: itemBid.itemId,
          unit_price: itemBid.unitPrice,
          total_price: itemBid.totalPrice,
          quantity: itemBid.quantity,
          notes: itemBid.notes || null,
          attachment_ids: itemBid.attachmentIds || null,
          created_at: now,
          updated_at: now,
        })
        .returningAll()
        .executeTakeFirstOrThrow()

      return this.mapToModel(result)
    } catch (error) {
      logger.error("Error creating item bid", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId: itemBid.bidId,
        itemId: itemBid.itemId,
      })
      throw error
    }
  }

  async update(id: string, itemBid: Partial<ItemBid>): Promise<ItemBid | null> {
    try {
      // Build update object dynamically based on provided fields
      const updateValues: any = {
        updated_at: new Date(),
      }

      if (itemBid.unitPrice !== undefined) updateValues.unit_price = itemBid.unitPrice
      if (itemBid.totalPrice !== undefined) updateValues.total_price = itemBid.totalPrice
      if (itemBid.quantity !== undefined) updateValues.quantity = itemBid.quantity
      if (itemBid.notes !== undefined) updateValues.notes = itemBid.notes
      if (itemBid.attachmentIds !== undefined) updateValues.attachment_ids = itemBid.attachmentIds

      const result = await db
        .updateTable("item_bids")
        .set(updateValues)
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirst()

      return result ? this.mapToModel(result) : null
    } catch (error) {
      logger.error("Error updating item bid", {
        error: error instanceof Error ? error.message : "Unknown error",
        itemBidId: id,
      })
      throw error
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db.deleteFrom("item_bids").where("id", "=", id).executeTakeFirst()

      return result.numDeletedRows > 0
    } catch (error) {
      logger.error("Error deleting item bid", {
        error: error instanceof Error ? error.message : "Unknown error",
        itemBidId: id,
      })
      throw error
    }
  }

  async deleteByBidId(bidId: string): Promise<boolean> {
    try {
      const result = await db.deleteFrom("item_bids").where("bid_id", "=", bidId).executeTakeFirst()

      return result.numDeletedRows > 0
    } catch (error) {
      logger.error("Error deleting item bids by bid ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId,
      })
      throw error
    }
  }

  private mapToModel(data: any): ItemBid {
    return {
      id: data.id,
      bidId: data.bid_id,
      itemId: data.item_id,
      unitPrice: data.unit_price,
      totalPrice: data.total_price,
      quantity: data.quantity,
      notes: data.notes || undefined,
      attachmentIds: data.attachment_ids || undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }
}
