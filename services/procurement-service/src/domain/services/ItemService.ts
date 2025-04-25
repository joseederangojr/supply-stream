import type { Item, ItemDimensions } from "../models/Item"

export interface ItemService {
  getItemById(id: string): Promise<Item | null>
  getItemsByRequestId(requestId: string): Promise<Item[]>
  createItem(item: CreateItemDto): Promise<Item>
  updateItem(id: string, updates: UpdateItemDto): Promise<Item | null>
  deleteItem(id: string): Promise<boolean>
}

export interface CreateItemDto {
  requestId: string
  name: string
  description: string
  category: string
  unitOfMeasure: string
  quantity: number
  budget: number
  manufacturer?: string
  partNumber?: string
  leadTime?: number
  dimensions?: ItemDimensions
  supplierCanAttach: boolean
}

export interface UpdateItemDto {
  name?: string
  description?: string
  category?: string
  unitOfMeasure?: string
  quantity?: number
  budget?: number
  manufacturer?: string
  partNumber?: string
  leadTime?: number
  dimensions?: ItemDimensions
  supplierCanAttach?: boolean
}
