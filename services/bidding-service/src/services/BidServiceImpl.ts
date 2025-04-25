import type {
  BidService,
  CreateBidDto,
  UpdateBidDto,
  CreateItemBidDto,
  UpdateItemBidDto,
} from "../domain/services/BidService"
import type { BidRepository } from "../domain/repositories/BidRepository"
import type { ItemBidRepository } from "../domain/repositories/ItemBidRepository"
import type { NotificationService } from "../domain/services/NotificationService"
import { BidStatus, type Bid, type ItemBid } from "../domain/models/Bid"
import { logger } from "../utils/logger"

export class BidServiceImpl implements BidService {
  constructor(
    private bidRepository: BidRepository,
    private itemBidRepository: ItemBidRepository,
    private notificationService: NotificationService,
  ) {}

  async getBidById(id: string): Promise<Bid | null> {
    try {
      return await this.bidRepository.findById(id)
    } catch (error) {
      logger.error("Error getting bid by ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId: id,
      })
      throw error
    }
  }

  async getBidsByRequestId(requestId: string, page?: number, limit?: number): Promise<Bid[]> {
    try {
      return await this.bidRepository.findByRequestId(requestId, { page, limit })
    } catch (error) {
      logger.error("Error getting bids by request ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId,
      })
      throw error
    }
  }

  async getBidsBySupplierId(supplierId: string, page?: number, limit?: number): Promise<Bid[]> {
    try {
      return await this.bidRepository.findBySupplierId(supplierId, { page, limit })
    } catch (error) {
      logger.error("Error getting bids by supplier ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        supplierId,
      })
      throw error
    }
  }

  async createBid(dto: CreateBidDto): Promise<Bid> {
    try {
      // Calculate total amount from item bids
      let totalAmount = 0
      for (const itemBid of dto.itemBids) {
        totalAmount += itemBid.unitPrice * itemBid.quantity
      }

      // Create bid
      const bid = await this.bidRepository.create({
        requestId: dto.requestId,
        supplierId: dto.supplierId,
        branchId: dto.branchId,
        totalAmount,
        status: BidStatus.DRAFT,
        notes: dto.notes,
      })

      // Create item bids
      for (const itemBidDto of dto.itemBids) {
        await this.createItemBid({
          ...itemBidDto,
          bidId: bid.id,
        })
      }

      logger.info("Bid created successfully", {
        bidId: bid.id,
        requestId: bid.requestId,
        supplierId: bid.supplierId,
      })

      return bid
    } catch (error) {
      logger.error("Error creating bid", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId: dto.requestId,
        supplierId: dto.supplierId,
      })
      throw error
    }
  }

  async updateBid(id: string, updates: UpdateBidDto): Promise<Bid | null> {
    try {
      const bid = await this.bidRepository.findById(id)

      if (!bid) {
        return null
      }

      // Only allow updates to draft bids
      if (bid.status !== BidStatus.DRAFT && updates.status === undefined) {
        throw new Error("Cannot update a bid that is not in draft status")
      }

      const updatedBid = await this.bidRepository.update(id, updates)

      if (updatedBid) {
        logger.info("Bid updated successfully", {
          bidId: id,
          requestId: bid.requestId,
          supplierId: bid.supplierId,
        })
      }

      return updatedBid
    } catch (error) {
      logger.error("Error updating bid", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId: id,
      })
      throw error
    }
  }

  async deleteBid(id: string): Promise<boolean> {
    try {
      const bid = await this.bidRepository.findById(id)

      if (!bid) {
        return false
      }

      // Only allow deletion of draft bids
      if (bid.status !== BidStatus.DRAFT) {
        throw new Error("Cannot delete a bid that is not in draft status")
      }

      // Delete item bids first
      await this.itemBidRepository.deleteByBidId(id)

      // Delete bid
      const success = await this.bidRepository.delete(id)

      if (success) {
        logger.info("Bid deleted successfully", {
          bidId: id,
          requestId: bid.requestId,
          supplierId: bid.supplierId,
        })
      }

      return success
    } catch (error) {
      logger.error("Error deleting bid", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId: id,
      })
      throw error
    }
  }

  async submitBid(id: string): Promise<Bid | null> {
    try {
      const bid = await this.bidRepository.findById(id)

      if (!bid) {
        return null
      }

      // Only allow submission of draft bids
      if (bid.status !== BidStatus.DRAFT) {
        throw new Error("Cannot submit a bid that is not in draft status")
      }

      // Get item bids to ensure they exist
      const itemBids = await this.itemBidRepository.findByBidId(id)
      if (itemBids.length === 0) {
        throw new Error("Cannot submit a bid with no item bids")
      }

      // Update bid status
      const updatedBid = await this.bidRepository.update(id, {
        status: BidStatus.SUBMITTED,
      })

      if (updatedBid) {
        // Notify about bid submission
        await this.notificationService.notifyBidSubmitted({
          bidId: updatedBid.id,
          requestId: updatedBid.requestId,
          supplierId: updatedBid.supplierId,
          clientId: "", // This would be fetched from the request in a real implementation
          status: updatedBid.status,
        })

        logger.info("Bid submitted successfully", {
          bidId: id,
          requestId: bid.requestId,
          supplierId: bid.supplierId,
        })
      }

      return updatedBid
    } catch (error) {
      logger.error("Error submitting bid", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId: id,
      })
      throw error
    }
  }

  async withdrawBid(id: string): Promise<Bid | null> {
    try {
      const bid = await this.bidRepository.findById(id)

      if (!bid) {
        return null
      }

      // Only allow withdrawal of submitted or under review bids
      if (bid.status !== BidStatus.SUBMITTED && bid.status !== BidStatus.UNDER_REVIEW) {
        throw new Error("Cannot withdraw a bid that is not in submitted or under review status")
      }

      // Update bid status
      const updatedBid = await this.bidRepository.update(id, {
        status: BidStatus.WITHDRAWN,
      })

      if (updatedBid) {
        // Notify about bid status change
        await this.notificationService.notifyBidStatusChanged({
          bidId: updatedBid.id,
          requestId: updatedBid.requestId,
          supplierId: updatedBid.supplierId,
          clientId: "", // This would be fetched from the request in a real implementation
          status: updatedBid.status,
        })

        logger.info("Bid withdrawn successfully", {
          bidId: id,
          requestId: bid.requestId,
          supplierId: bid.supplierId,
        })
      }

      return updatedBid
    } catch (error) {
      logger.error("Error withdrawing bid", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId: id,
      })
      throw error
    }
  }

  async acceptBid(id: string): Promise<Bid | null> {
    try {
      const bid = await this.bidRepository.findById(id)

      if (!bid) {
        return null
      }

      // Only allow acceptance of submitted or under review bids
      if (bid.status !== BidStatus.SUBMITTED && bid.status !== BidStatus.UNDER_REVIEW) {
        throw new Error("Cannot accept a bid that is not in submitted or under review status")
      }

      // Update bid status
      const updatedBid = await this.bidRepository.update(id, {
        status: BidStatus.ACCEPTED,
      })

      if (updatedBid) {
        // Notify about bid status change
        await this.notificationService.notifyBidStatusChanged({
          bidId: updatedBid.id,
          requestId: updatedBid.requestId,
          supplierId: updatedBid.supplierId,
          clientId: "", // This would be fetched from the request in a real implementation
          status: updatedBid.status,
        })

        logger.info("Bid accepted successfully", {
          bidId: id,
          requestId: bid.requestId,
          supplierId: bid.supplierId,
        })
      }

      return updatedBid
    } catch (error) {
      logger.error("Error accepting bid", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId: id,
      })
      throw error
    }
  }

  async rejectBid(id: string): Promise<Bid | null> {
    try {
      const bid = await this.bidRepository.findById(id)

      if (!bid) {
        return null
      }

      // Only allow rejection of submitted or under review bids
      if (bid.status !== BidStatus.SUBMITTED && bid.status !== BidStatus.UNDER_REVIEW) {
        throw new Error("Cannot reject a bid that is not in submitted or under review status")
      }

      // Update bid status
      const updatedBid = await this.bidRepository.update(id, {
        status: BidStatus.REJECTED,
      })

      if (updatedBid) {
        // Notify about bid status change
        await this.notificationService.notifyBidStatusChanged({
          bidId: updatedBid.id,
          requestId: updatedBid.requestId,
          supplierId: updatedBid.supplierId,
          clientId: "", // This would be fetched from the request in a real implementation
          status: updatedBid.status,
        })

        logger.info("Bid rejected successfully", {
          bidId: id,
          requestId: bid.requestId,
          supplierId: bid.supplierId,
        })
      }

      return updatedBid
    } catch (error) {
      logger.error("Error rejecting bid", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId: id,
      })
      throw error
    }
  }

  async getItemBidsByBidId(bidId: string): Promise<ItemBid[]> {
    try {
      return await this.itemBidRepository.findByBidId(bidId)
    } catch (error) {
      logger.error("Error getting item bids by bid ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId,
      })
      throw error
    }
  }

  async createItemBid(dto: CreateItemBidDto): Promise<ItemBid> {
    try {
      if (!dto.bidId) {
        throw new Error("Bid ID is required")
      }

      // Calculate total price
      const totalPrice = dto.unitPrice * dto.quantity

      // Create item bid
      const itemBid = await this.itemBidRepository.create({
        bidId: dto.bidId,
        itemId: dto.itemId,
        unitPrice: dto.unitPrice,
        totalPrice,
        quantity: dto.quantity,
        notes: dto.notes,
        attachmentIds: dto.attachmentIds,
      })

      // Update bid total amount
      const bid = await this.bidRepository.findById(dto.bidId)
      if (bid) {
        const itemBids = await this.itemBidRepository.findByBidId(dto.bidId)
        const totalAmount = itemBids.reduce((sum, ib) => sum + ib.totalPrice, 0)
        await this.bidRepository.update(dto.bidId, { totalAmount })
      }

      logger.info("Item bid created successfully", {
        itemBidId: itemBid.id,
        bidId: itemBid.bidId,
        itemId: itemBid.itemId,
      })

      return itemBid
    } catch (error) {
      logger.error("Error creating item bid", {
        error: error instanceof Error ? error.message : "Unknown error",
        bidId: dto.bidId,
        itemId: dto.itemId,
      })
      throw error
    }
  }

  async updateItemBid(id: string, updates: UpdateItemBidDto): Promise<ItemBid | null> {
    try {
      const itemBid = await this.itemBidRepository.findById(id)

      if (!itemBid) {
        return null
      }

      // Get bid to check status
      const bid = await this.bidRepository.findById(itemBid.bidId)
      if (!bid) {
        throw new Error("Bid not found")
      }

      // Only allow updates to item bids of draft bids
      if (bid.status !== BidStatus.DRAFT) {
        throw new Error("Cannot update an item bid for a bid that is not in draft status")
      }

      // Calculate new total price if unit price or quantity is updated
      let totalPrice = itemBid.totalPrice
      if (updates.unitPrice !== undefined || updates.quantity !== undefined) {
        const unitPrice = updates.unitPrice !== undefined ? updates.unitPrice : itemBid.unitPrice
        const quantity = updates.quantity !== undefined ? updates.quantity : itemBid.quantity
        totalPrice = unitPrice * quantity
      }

      // Update item bid
      const updatedItemBid = await this.itemBidRepository.update(id, {
        ...updates,
        totalPrice,
      })

      if (updatedItemBid) {
        // Update bid total amount
        const itemBids = await this.itemBidRepository.findByBidId(itemBid.bidId)
        const totalAmount = itemBids.reduce((sum, ib) => sum + ib.totalPrice, 0)
        await this.bidRepository.update(itemBid.bidId, { totalAmount })

        logger.info("Item bid updated successfully", {
          itemBidId: id,
          bidId: itemBid.bidId,
          itemId: itemBid.itemId,
        })
      }

      return updatedItemBid
    } catch (error) {
      logger.error("Error updating item bid", {
        error: error instanceof Error ? error.message : "Unknown error",
        itemBidId: id,
      })
      throw error
    }
  }

  async deleteItemBid(id: string): Promise<boolean> {
    try {
      const itemBid = await this.itemBidRepository.findById(id)

      if (!itemBid) {
        return false
      }

      // Get bid to check status
      const bid = await this.bidRepository.findById(itemBid.bidId)
      if (!bid) {
        throw new Error("Bid not found")
      }

      // Only allow deletion of item bids of draft bids
      if (bid.status !== BidStatus.DRAFT) {
        throw new Error("Cannot delete an item bid for a bid that is not in draft status")
      }

      // Delete item bid
      const success = await this.itemBidRepository.delete(id)

      if (success) {
        // Update bid total amount
        const itemBids = await this.itemBidRepository.findByBidId(itemBid.bidId)
        const totalAmount = itemBids.reduce((sum, ib) => sum + ib.totalPrice, 0)
        await this.bidRepository.update(itemBid.bidId, { totalAmount })

        logger.info("Item bid deleted successfully", {
          itemBidId: id,
          bidId: itemBid.bidId,
          itemId: itemBid.itemId,
        })
      }

      return success
    } catch (error) {
      logger.error("Error deleting item bid", {
        error: error instanceof Error ? error.message : "Unknown error",
        itemBidId: id,
      })
      throw error
    }
  }
}
