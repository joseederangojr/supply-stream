import type { ItemBid } from "../models/Bid"

export interface ItemBidRepository {
  findById(id: string): Promise<ItemBid | null>
  findByBidId(bidId: string): Promise<ItemBid[]>
  findByItemId(itemId: string): Promise<ItemBid[]>
  create(itemBid: Omit<ItemBid, "id" | "createdAt" | "updatedAt">): Promise<ItemBid>
  update(id: string, itemBid: Partial<ItemBid>): Promise<ItemBid | null>
  delete(id: string): Promise<boolean>
  deleteByBidId(bidId: string): Promise<boolean>
}
