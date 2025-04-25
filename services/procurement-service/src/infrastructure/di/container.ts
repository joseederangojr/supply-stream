import type { RequestRepository } from "../../domain/repositories/RequestRepository"
import { PostgresRequestRepository } from "../../repositories/PostgresRequestRepository"
import type { ItemRepository } from "../../domain/repositories/ItemRepository"
import { PostgresItemRepository } from "../../repositories/PostgresItemRepository"
import type { RequestService } from "../../domain/services/RequestService"
import { RequestServiceImpl } from "../../services/RequestServiceImpl"
import type { ItemService } from "../../domain/services/ItemService"
import { ItemServiceImpl } from "../../services/ItemServiceImpl"
import type { GeolocationService } from "../../domain/services/GeolocationService"
import { GeolocationServiceImpl } from "../../services/GeolocationServiceImpl"
import type { NotificationService } from "../../domain/services/NotificationService"
import { NotificationServiceImpl } from "../../services/NotificationServiceImpl"
import { RequestController } from "../../api/controllers/RequestController"
import { ItemController } from "../../api/controllers/ItemController"

export interface Container {
  requestRepository: RequestRepository
  itemRepository: ItemRepository
  geolocationService: GeolocationService
  notificationService: NotificationService
  requestService: RequestService
  itemService: ItemService
  requestController: RequestController
  itemController: ItemController
}

export function createContainer(): Container {
  // Create repositories
  const requestRepository = new PostgresRequestRepository()
  const itemRepository = new PostgresItemRepository()

  // Create services
  const geolocationService = new GeolocationServiceImpl()
  const notificationService = new NotificationServiceImpl()
  const requestService = new RequestServiceImpl(requestRepository, geolocationService, notificationService)
  const itemService = new ItemServiceImpl(itemRepository, requestRepository)

  // Create controllers
  const requestController = new RequestController(requestService)
  const itemController = new ItemController(itemService)

  return {
    requestRepository,
    itemRepository,
    geolocationService,
    notificationService,
    requestService,
    itemService,
    requestController,
    itemController,
  }
}
