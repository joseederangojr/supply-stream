import type { Generated } from "kysely"

export interface Database {
  requests: RequestTable
  items: ItemTable
}

export interface RequestTable {
  id: Generated<string>
  client_id: string
  branch_id: string
  requisition_number: string
  title: string
  description: string
  requestor_id: string
  delivery_address: object
  delivery_latitude: number
  delivery_longitude: number
  total_budget: number
  cost_center: string
  urgency: string
  status: string
  desired_delivery_date: Date | null
  created_at: Generated<Date>
  updated_at: Generated<Date>
}

export interface ItemTable {
  id: Generated<string>
  request_id: string
  name: string
  description: string
  category: string
  unit_of_measure: string
  quantity: number
  budget: number
  manufacturer: string | null
  part_number: string | null
  lead_time: number | null
  dimensions: object | null
  supplier_can_attach: boolean
  created_at: Generated<Date>
  updated_at: Generated<Date>
}
