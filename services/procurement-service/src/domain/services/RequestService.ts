import type { Request, Address, RequestUrgency } from "../models/Request"

export interface RequestService {
  getRequestById(id: string): Promise<Request | null>
  getRequestsByClientId(clientId: string, page?: number, limit?: number): Promise<Request[]>
  createRequest(request: CreateRequestDto): Promise<Request>
  updateRequest(id: string, updates: UpdateRequestDto): Promise<Request | null>
  deleteRequest(id: string): Promise<boolean>
  publishRequest(id: string): Promise<Request | null>
}

export interface CreateRequestDto {
  clientId: string
  branchId: string
  title: string
  description: string
  requestorId: string
  deliveryAddress: Address
  totalBudget: number
  costCenter?: string
  urgency: RequestUrgency
  desiredDeliveryDate?: Date
}

export interface UpdateRequestDto {
  title?: string
  description?: string
  deliveryAddress?: Address
  totalBudget?: number
  costCenter?: string
  urgency?: RequestUrgency
  desiredDeliveryDate?: Date
}
