import type { RequestService, CreateRequestDto, UpdateRequestDto } from "../../domain/services/RequestService"
import { logger } from "../../utils/logger"

export class RequestController {
  constructor(private requestService: RequestService) {}

  async getRequestById(id: string) {
    try {
      return await this.requestService.getRequestById(id)
    } catch (error) {
      logger.error("Controller error: getRequestById", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId: id,
      })
      throw error
    }
  }

  async getRequestsByClientId(clientId: string, page?: number, limit?: number) {
    try {
      return await this.requestService.getRequestsByClientId(clientId, page, limit)
    } catch (error) {
      logger.error("Controller error: getRequestsByClientId", {
        error: error instanceof Error ? error.message : "Unknown error",
        clientId,
      })
      throw error
    }
  }

  async createRequest(data: CreateRequestDto) {
    try {
      return await this.requestService.createRequest(data)
    } catch (error) {
      logger.error("Controller error: createRequest", {
        error: error instanceof Error ? error.message : "Unknown error",
        clientId: data.clientId,
      })
      throw error
    }
  }

  async updateRequest(id: string, data: UpdateRequestDto) {
    try {
      return await this.requestService.updateRequest(id, data)
    } catch (error) {
      logger.error("Controller error: updateRequest", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId: id,
      })
      throw error
    }
  }

  async deleteRequest(id: string) {
    try {
      return await this.requestService.deleteRequest(id)
    } catch (error) {
      logger.error("Controller error: deleteRequest", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId: id,
      })
      throw error
    }
  }

  async publishRequest(id: string) {
    try {
      return await this.requestService.publishRequest(id)
    } catch (error) {
      logger.error("Controller error: publishRequest", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId: id,
      })
      throw error
    }
  }
}
