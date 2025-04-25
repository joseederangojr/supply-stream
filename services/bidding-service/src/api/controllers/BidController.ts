import type { BidService } from "../../domain/services/BidService"
import { logger } from "../../utils/logger"

export class BidController {
  constructor(private bidService: BidService) {}

  async getBidById(id: string) {
    try {
      return await this.bidService.getBidById(id)
    } catch (error) {
      logger.error("Controller error: getBidById", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId: id,
      })
      throw error
    }
  }

  async getBidsByRequestId(requestId: string, page?: number, limit?: number) {
    try {
      return await this.bidService.getBidsByRequestId(requestId, page, limit)
    } catch (error) {
      logger.error("Controller error: getBidsByRequestId", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId,
      })
      throw error
    }
  }

  async getBidsBySupplierId(supplierId: string, page?: number, limit?: number) {
    try {
      return await this.bidService.getBidsBySupplierId(supplierId, page, limit)
    } catch (error) {
      logger.error("Controller error: getBidsBySupplierId", {
        error: error instanceof Error ? error.message : "Unknown error",
        supplierId,
      })
      throw error
    }
  }

  async createBid(data: any) {
    try {
      return await this.bidService.createBid(data)
    } catch (error) {
      logger.error("Controller error: createBid", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId: data.requestId,
        supplierId: data.supplierId,
      })
      throw error
    }
  }

  async updateBid(id: string, data: any) {
    try {
      return await this.bidService.updateBid(id, data)
    } catch (error) {
      logger.error("Controller error: updateBid", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId: id,
      })
      throw error
    }
  }

  async deleteBid(id: string) {
    try {
      const success = await this.bidService.deleteBid(id)
      return { success }
    } catch (error) {
      logger.error("Controller error: deleteBid", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId: id,
      })
      throw error
    }
  }

  async submitBid(id: string) {
    try {
      return await this.bidService.submitBid(id)
    } catch (error) {
      logger.error("Controller error: submitBid", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId: id,
      })
      throw error
    }
  }

  async withdrawBid(id: string) {
    try {
      return await this.bidService.withdrawBid(id)
    } catch (error) {
      logger.error("Controller error: withdrawBid", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId: id,
      })
      throw error
    }
  }

  async acceptBid(id: string) {
    try {
      return await this.bidService.acceptBid(id)
    } catch (error) {
      logger.error("Controller error: acceptBid", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId: id,
      })
      throw error
    }
  }

  async rejectBid(id: string) {
    try {
      return await this.bidService.rejectBid(id)
    } catch (error) {
      logger.error("Controller error: rejectBid", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId: id,
      })
      throw error
    }
  }

  async getItemBidsByBidId(bidId: string) {
    try {
      return await this.bidService.getItemBidsByBidId(bidId)
    } catch (error) {
      logger.error("Controller error: getItemBidsByBidId", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId,
      })
      throw error
    }
  }

  async createItemBid(data: any) {
    try {
      return await this.bidService.createItemBid(data)
    } catch (error) {
      logger.error("Controller error: createItemBid", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId: data.bidId,
        itemId: data.itemId,
      })
      throw error
    }
  }

  async updateItemBid(id: string, data: any) {
    try {
      return await this.bidService.updateItemBid(id, data)
    } catch (error) {
      logger.error("Controller error: updateItemBid", {
        error: error instanceof Error ? error.message : "Unknown error",
        itemBidId: id,
      })
      throw error
    }
  }

  async deleteItemBid(id: string) {
    try {
      const success = await this.bidService.deleteItemBid(id)
      return { success }
    } catch (error) {
      logger.error("Controller error: deleteItemBid", {
        error: error instanceof Error ? error.message : "Unknown error",
        itemBidId: id,
      })
      throw error
    }
  }
}
