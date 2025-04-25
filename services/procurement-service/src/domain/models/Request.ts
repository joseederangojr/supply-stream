export interface Request {
  id: string
  clientId: string
  branchId: string
  requisitionNumber: string
  title: string
  description: string
  requestorId: string
  deliveryAddress: Address
  deliveryCoordinates: GeoCoordinates
  totalBudget: number
  costCenter: string
  urgency: RequestUrgency
  status: RequestStatus
  desiredDeliveryDate: Date
  createdAt: Date
  updatedAt: Date
}

export enum RequestStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum RequestUrgency {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export interface Address {
  street: string
  city: string
  postalCode: string
  country: string
}

export interface GeoCoordinates {
  latitude: number
  longitude: number
}
