import type { Generated } from "kysely"

export interface Database {
  bids: BidTable
  item_bids: ItemBidTable
}

export interface BidTable {
  id: Generated<string>
  request_id: string
  supplier_id: string
  branch_id: string
  total_amount: number
  status: string
  notes: string | null
  created_at: Generated<Date>
  updated_at: Generated<Date>
}

export interface ItemBidTable {
  id: Generated<string>
  bid_id: string
  item_id: string
  unit_price: number
  total_price: number
  quantity: number
  notes: string | null
  attachment_ids: string[] | null
  created_at: Generated<Date>
  updated_at: Generated<Date>
}
