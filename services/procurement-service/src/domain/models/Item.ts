export interface Item {
  id: string
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
  createdAt: Date
  updatedAt: Date
}

export interface ItemDimensions {
  length?: number
  width?: number
  height?: number
  weight?: number
  unit?: string
}
