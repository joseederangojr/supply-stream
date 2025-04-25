import type { Request } from "../models/Request"

export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortDirection?: "asc" | "desc"
}

export interface RequestRepository {
  findById(id: string): Promise<Request | null>
  findByClientId(clientId: string, options?: PaginationOptions): Promise<Request[]>
  create(request: Omit<Request, "id" | "createdAt" | "updatedAt">): Promise<Request>
  update(id: string, request: Partial<Request>): Promise<Request | null>
  delete(id: string): Promise<boolean>
}
