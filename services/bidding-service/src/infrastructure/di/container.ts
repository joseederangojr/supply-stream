import type { BidRepository } from "../../domain/repositories/BidRepository"
import { PostgresBidRepository } from "../../repositories/PostgresBidRepository"
import type { ItemBidRepository } from "../../domain/repositories/ItemBidRepository"
import { PostgresItemBidRepository } from "../../repositories/PostgresItemBidRepository"
import type { NotificationService } from "../../domain/services/NotificationService"
import { NotificationServiceImpl } from "../../services/NotificationServiceImpl"
import type { BidService } from "../../domain/services/BidService"
import { BidServiceImpl } from "../../services/BidServiceImpl"
import { BidController } from "../../api/controllers/BidController"

export interface Container {
  bidRepository: BidRepository
  itemBidRepository: ItemBidRepository
  notificationService: NotificationService
  bidService: BidService
  bidController: BidController
}

export function createContainer(): Container {
  // Create repositories
  const bidRepository = new PostgresBidRepository()
  const itemBidRepository = new PostgresItemBidRepository()

  // Create services
  const notificationService = new NotificationServiceImpl()
  const bidService = new BidServiceImpl(bidRepository, itemBidRepository, notificationService)

  // Create controllers
  const bidController = new BidController(bidService)

  return {
    bidRepository,
    itemBidRepository,
    notificationService,
    bidService,
    bidController,
  }
}
