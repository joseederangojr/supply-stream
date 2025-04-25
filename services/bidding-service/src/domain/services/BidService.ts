import type { Bid, BidStatus, ItemBid } from "../models/Bid"

export interface BidService {
  getBidById(id: string): Promise<Bid | null>
  getBidsByRequestId(requestId: string, page?: number, limit?: number): Promise<Bid[]>
  getBidsBySupplierId(supplierId: string, page?: number, limit?: number): Promise<Bid[]>
  createBid(bid: CreateBidDto): Promise<Bid>
  updateBid(id: string, updates: UpdateBidDto): Promise<Bid | null>
  deleteBid(id: string): Promise<boolean>
  submitBid(id: string): Promise<Bid | null>
  withdrawBid(id: string): Promise<Bid | null>
  acceptBid(id: string): Promise<Bid | null>
  rejectBid(id: string): Promise<Bid | null>
  getItemBidsByBidId(bidId: string): Promise<ItemBid[]>
  createItemBid(itemBid: CreateItemBidDto): Promise<ItemBid>
  updateItemBid(id: string, updates: UpdateItemBidDto): Promise<ItemBid | null>
  deleteItemBid(id: string): Promise<boolean>
}

export interface CreateBidDto {
  requestId: string
  supplierId: string
  branchId: string
  notes?: string
  itemBids: CreateItemBidDto[]
}

export interface UpdateBidDto {
  notes?: string
  status?: BidStatus
}

export interface CreateItemBidDto {
  bidId?: string
  itemId: string
  unitPrice: number
  quantity: number
  notes?: string
  attachmentIds?: string[]
}

export interface UpdateItemBidDto {
  unitPrice?: number
  quantity?: number
  notes?: string
  attachmentIds?: string[]
}
