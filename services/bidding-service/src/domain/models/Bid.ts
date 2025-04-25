export interface Bid {
  id: string
  requestId: string
  supplierId: string
  branchId: string
  totalAmount: number
  status: BidStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export enum BidStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN",
}

export interface ItemBid {
  id: string
  bidId: string
  itemId: string
  unitPrice: number
  totalPrice: number
  quantity: number
  notes?: string
  attachmentIds?: string[]
  createdAt: Date
  updatedAt: Date
}
