import type { Bid } from "../models/Bid"

export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortDirection?: "asc" | "desc"
}

export interface BidRepository {
  findById(id: string): Promise<Bid | null>
  findByRequestId(requestId: string, options?: PaginationOptions): Promise<Bid[]>
  findBySupplierId(supplierId: string, options?: PaginationOptions): Promise<Bid[]>
  create(bid: Omit<Bid, "id" | "createdAt" | "updatedAt">): Promise<Bid>
  update(id: string, bid: Partial<Bid>): Promise<Bid | null>
  delete(id: string): Promise<boolean>
}
