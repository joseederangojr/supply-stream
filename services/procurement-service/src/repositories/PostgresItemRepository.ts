import { v4 as uuidv4 } from "uuid"
import type { ItemRepository } from "../domain/repositories/ItemRepository"
import type { Item, ItemDimensions } from "../domain/models/Item"
import { db } from "../infrastructure/database"
import { logger } from "../utils/logger"

export class PostgresItemRepository implements ItemRepository {
  async findById(id: string): Promise<Item | null> {
    try {
      const result = await db.selectFrom("items").selectAll().where("id", "=", id).executeTakeFirst()

      return result ? this.mapToModel(result) : null
    } catch (error) {
      logger.error("Error finding item by ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        itemId: id,
      })
      throw error
    }
  }

  async findByRequestId(requestId: string): Promise<Item[]> {
    try {
      const results = await db.selectFrom("items").selectAll().where("request_id", "=", requestId).execute()

      return results.map(this.mapToModel)
    } catch (error) {
      logger.error("Error finding items by request ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId,
      })
      throw error
    }
  }

  async create(item: Omit<Item, "id" | "createdAt" | "updatedAt">): Promise<Item> {
    try {
      const id = uuidv4()
      const now = new Date()

      const result = await db
        .insertInto("items")
        .values({
          id,
          request_id: item.requestId,
          name: item.name,
          description: item.description,
          category: item.category,
          unit_of_measure: item.unitOfMeasure,
          quantity: item.quantity,
          budget: item.budget,
          manufacturer: item.manufacturer || null,
          part_number: item.partNumber || null,
          lead_time: item.leadTime || null,
          dimensions: (item.dimensions as any) || null,
          supplier_can_attach: item.supplierCanAttach,
          created_at: now,
          updated_at: now,
        })
        .returningAll()
        .executeTakeFirstOrThrow()

      return this.mapToModel(result)
    } catch (error) {
      logger.error("Error creating item", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId: item.requestId,
      })
      throw error
    }
  }

  async update(id: string, item: Partial<Item>): Promise<Item | null> {
    try {
      // Build update object dynamically based on provided fields
      const updateValues: any = {
        updated_at: new Date(),
      }

      if (item.name !== undefined) updateValues.name = item.name
      if (item.description !== undefined) updateValues.description = item.description
      if (item.category !== undefined) updateValues.category = item.category
      if (item.unitOfMeasure !== undefined) updateValues.unit_of_measure = item.unitOfMeasure
      if (item.quantity !== undefined) updateValues.quantity = item.quantity
      if (item.budget !== undefined) updateValues.budget = item.budget
      if (item.manufacturer !== undefined) updateValues.manufacturer = item.manufacturer
      if (item.partNumber !== undefined) updateValues.part_number = item.partNumber
      if (item.leadTime !== undefined) updateValues.lead_time = item.leadTime
      if (item.dimensions !== undefined) updateValues.dimensions = item.dimensions
      if (item.supplierCanAttach !== undefined) updateValues.supplier_can_attach = item.supplierCanAttach

      const result = await db
        .updateTable("items")
        .set(updateValues)
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirst()

      return result ? this.mapToModel(result) : null
    } catch (error) {
      logger.error("Error updating item", {
        error: error instanceof Error ? error.message : "Unknown error",
        itemId: id,
      })
      throw error
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db.deleteFrom("items").where("id", "=", id).executeTakeFirst()

      return result.numDeletedRows > 0
    } catch (error) {
      logger.error("Error deleting item", {
        error: error instanceof Error ? error.message : "Unknown error",
        itemId: id,
      })
      throw error
    }
  }

  private mapToModel(data: any): Item {
    return {
      id: data.id,
      requestId: data.request_id,
      name: data.name,
      description: data.description,
      category: data.category,
      unitOfMeasure: data.unit_of_measure,
      quantity: data.quantity,
      budget: data.budget,
      manufacturer: data.manufacturer || undefined,
      partNumber: data.part_number || undefined,
      leadTime: data.lead_time || undefined,
      dimensions: (data.dimensions as ItemDimensions) || undefined,
      supplierCanAttach: data.supplier_can_attach,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }
}
