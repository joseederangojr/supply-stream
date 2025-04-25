import type { ItemService, CreateItemDto, UpdateItemDto } from "../../domain/services/ItemService"
import { logger } from "../../utils/logger"

export class ItemController {
  constructor(private itemService: ItemService) {}

  async getItemById(id: string) {
    try {
      return await this.itemService.getItemById(id)
    } catch (error) {
      logger.error("Controller error: getItemById", {
        error: error instanceof Error ? error.message : "Unknown error",
        itemId: id,
      })
      throw error
    }
  }

  async getItemsByRequestId(requestId: string) {
    try {
      return await this.itemService.getItemsByRequestId(requestId)
    } catch (error) {
      logger.error("Controller error: getItemsByRequestId", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId,
      })
      throw error
    }
  }

  async createItem(data: CreateItemDto) {
    try {
      return await this.itemService.createItem(data)
    } catch (error) {
      logger.error("Controller error: createItem", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId: data.requestId,
      })
      throw error
    }
  }

  async updateItem(id: string, data: UpdateItemDto) {
    try {
      return await this.itemService.updateItem(id, data)
    } catch (error) {
      logger.error("Controller error: updateItem", {
        error: error instanceof Error ? error.message : "Unknown error",
        itemId: id,
      })
      throw error
    }
  }

  async deleteItem(id: string) {
    try {
      return await this.itemService.deleteItem(id)
    } catch (error) {
      logger.error("Controller error: deleteItem", {
        error: error instanceof Error ? error.message : "Unknown error",
        itemId: id,
      })
      throw error
    }
  }
}
