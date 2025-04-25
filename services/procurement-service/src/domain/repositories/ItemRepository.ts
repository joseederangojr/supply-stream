import type { Item } from "../models/Item"

export interface ItemRepository {
  findById(id: string): Promise<Item | null>
  findByRequestId(requestId: string): Promise<Item[]>
  create(item: Omit<Item, "id" | "createdAt" | "updatedAt">): Promise<Item>
  update(id: string, item: Partial<Item>): Promise<Item | null>
  delete(id: string): Promise<boolean>
}
