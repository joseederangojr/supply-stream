import type { ItemService, CreateItemDto, UpdateItemDto } from "../domain/services/ItemService"
import type { Item } from "../domain/models/Item"
import type { ItemRepository } from "../domain/repositories/ItemRepository"
import type { RequestRepository } from "../domain/repositories/RequestRepository"
import { logger } from "../utils/logger"

export class ItemServiceImpl implements ItemService {
  constructor(
    private itemRepository: ItemRepository,
    private requestRepository: RequestRepository,
  ) {}

  async getItemById(id: string): Promise<Item | null> {
    try {
      return await this.itemRepository.findById(id)
    } catch (error) {
      logger.error("Error getting item by ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        itemId: id,
      })
      throw error
    }
  }

  async getItemsByRequestId(requestId: string): Promise<Item[]> {
    try {
      return await this.itemRepository.findByRequestId(requestId)
    } catch (error) {
      logger.error("Error getting items by request ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId,
      })
      throw error
    }
  }

  async createItem(dto: CreateItemDto): Promise<Item> {
    try {
      // Verify that the request exists
      const request = await this.requestRepository.findById(dto.requestId)

      if (!request) {
        throw new Error(`Request with ID ${dto.requestId} not found`)
      }

      const item = await this.itemRepository.create({
        requestId: dto.requestId,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        unitOfMeasure: dto.unitOfMeasure,
        quantity: dto.quantity,
        budget: dto.budget,
        manufacturer: dto.manufacturer,
        partNumber: dto.partNumber,
        leadTime: dto.leadTime,
        dimensions: dto.dimensions,
        supplierCanAttach: dto.supplierCanAttach,
      })

      logger.info("Item created successfully", {
        itemId: item.id,
        requestId: item.requestId,
      })

      return item
    } catch (error) {
      logger.error("Error creating item", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId: dto.requestId,
      })
      throw error
    }
  }

  async updateItem(id: string, updates: UpdateItemDto): Promise<Item | null> {
    try {
      const item = await this.itemRepository.findById(id)

      if (!item) {
        return null
      }

      const updatedItem = await this.itemRepository.update(id, updates)

      if (updatedItem) {
        logger.info("Item updated successfully", {
          itemId: id,
          requestId: item.requestId,
        })
      }

      return updatedItem
    } catch (error) {
      logger.error("Error updating item", {
        error: error instanceof Error ? error.message : "Unknown error",
        itemId: id,
      })
      throw error
    }
  }

  async deleteItem(id: string): Promise<boolean> {
    try {
      const success = await this.itemRepository.delete(id)

      if (success) {
        logger.info("Item deleted successfully", { itemId: id })
      }

      return success
    } catch (error) {
      logger.error("Error deleting item", {
        error: error instanceof Error ? error.message : "Unknown error",
        itemId: id,
      })
      throw error
    }
  }
}
