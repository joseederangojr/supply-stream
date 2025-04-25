import type { RequestService, CreateRequestDto, UpdateRequestDto } from "../domain/services/RequestService"
import { type Request, RequestStatus } from "../domain/models/Request"
import type { RequestRepository } from "../domain/repositories/RequestRepository"
import type { GeolocationService } from "../domain/services/GeolocationService"
import type { NotificationService } from "../domain/services/NotificationService"
import { generateRequisitionNumber } from "../utils/idGenerator"
import { logger } from "../utils/logger"

export class RequestServiceImpl implements RequestService {
  constructor(
    private requestRepository: RequestRepository,
    private geolocationService: GeolocationService,
    private notificationService: NotificationService,
  ) {}

  async getRequestById(id: string): Promise<Request | null> {
    try {
      return await this.requestRepository.findById(id)
    } catch (error) {
      logger.error("Error getting request by ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId: id,
      })
      throw error
    }
  }

  async getRequestsByClientId(clientId: string, page?: number, limit?: number): Promise<Request[]> {
    try {
      return await this.requestRepository.findByClientId(clientId, { page, limit })
    } catch (error) {
      logger.error("Error getting requests by client ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        clientId,
      })
      throw error
    }
  }

  async createRequest(dto: CreateRequestDto): Promise<Request> {
    try {
      // Geocode the address
      const coordinates = await this.geolocationService.geocodeAddress(dto.deliveryAddress)

      // Generate requisition number
      const requisitionNumber = generateRequisitionNumber()

      const request = await this.requestRepository.create({
        clientId: dto.clientId,
        branchId: dto.branchId,
        requisitionNumber,
        title: dto.title,
        description: dto.description,
        requestorId: dto.requestorId,
        deliveryAddress: dto.deliveryAddress,
        deliveryCoordinates: coordinates,
        totalBudget: dto.totalBudget,
        costCenter: dto.costCenter || "",
        urgency: dto.urgency,
        status: RequestStatus.DRAFT,
        desiredDeliveryDate: dto.desiredDeliveryDate || new Date(),
      })

      logger.info("Request created successfully", {
        requestId: request.id,
        clientId: request.clientId,
      })

      return request
    } catch (error) {
      logger.error("Error creating request", {
        error: error instanceof Error ? error.message : "Unknown error",
        clientId: dto.clientId,
      })
      throw error
    }
  }

  async updateRequest(id: string, updates: UpdateRequestDto): Promise<Request | null> {
    try {
      const request = await this.requestRepository.findById(id)

      if (!request) {
        return null
      }

      // If address is updated, geocode it
      let coordinates = request.deliveryCoordinates
      if (updates.deliveryAddress) {
        coordinates = await this.geolocationService.geocodeAddress(updates.deliveryAddress)
      }

      const updatedRequest = await this.requestRepository.update(id, {
        ...updates,
        deliveryCoordinates: coordinates,
      })

      if (updatedRequest) {
        logger.info("Request updated successfully", {
          requestId: id,
          clientId: request.clientId,
        })
      }

      return updatedRequest
    } catch (error) {
      logger.error("Error updating request", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId: id,
      })
      throw error
    }
  }

  async deleteRequest(id: string): Promise<boolean> {
    try {
      const success = await this.requestRepository.delete(id)

      if (success) {
        logger.info("Request deleted successfully", { requestId: id })
      }

      return success
    } catch (error) {
      logger.error("Error deleting request", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId: id,
      })
      throw error
    }
  }

  async publishRequest(id: string): Promise<Request | null> {
    try {
      const request = await this.requestRepository.findById(id)

      if (!request) {
        return null
      }

      if (request.status !== RequestStatus.DRAFT) {
        logger.warn("Cannot publish request that is not in DRAFT status", {
          requestId: id,
          currentStatus: request.status,
        })
        return request
      }

      const updatedRequest = await this.requestRepository.update(id, {
        status: RequestStatus.PUBLISHED,
      })

      if (updatedRequest) {
        // Notify relevant suppliers
        await this.notificationService.notifySuppliers({
          requestId: updatedRequest.id,
          title: updatedRequest.title,
          clientId: updatedRequest.clientId,
        })

        logger.info("Request published successfully", {
          requestId: id,
          clientId: request.clientId,
        })
      }

      return updatedRequest
    } catch (error) {
      logger.error("Error publishing request", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId: id,
      })
      throw error
    }
  }
}
