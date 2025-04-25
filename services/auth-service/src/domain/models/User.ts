export interface User {
  id: string
  organizationId: string
  email: string
  passwordHash: string
  name: string
  title?: string
  phone?: string
  timezone?: string
  role: UserRole
  permissions: Permission[]
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export enum UserRole {
  ADMIN = "ADMIN",
  CLIENT_ADMIN = "CLIENT_ADMIN",
  CLIENT_USER = "CLIENT_USER",
  SUPPLIER_ADMIN = "SUPPLIER_ADMIN",
  SUPPLIER_USER = "SUPPLIER_USER",
  SYSTEM = "SYSTEM",
}

export enum Permission {
  // Client permissions
  CREATE_REQUEST = "CREATE_REQUEST",
  EDIT_REQUEST = "EDIT_REQUEST",
  DELETE_REQUEST = "DELETE_REQUEST",
  PUBLISH_REQUEST = "PUBLISH_REQUEST",
  VIEW_REQUESTS = "VIEW_REQUESTS",
  AWARD_BID = "AWARD_BID",
  MANAGE_USERS = "MANAGE_USERS",
  MANAGE_BILLING = "MANAGE_BILLING",

  // Supplier permissions
  VIEW_OPPORTUNITIES = "VIEW_OPPORTUNITIES",
  SUBMIT_BID = "SUBMIT_BID",
  EDIT_BID = "EDIT_BID",
  DELETE_BID = "DELETE_BID",
  VIEW_BIDS = "VIEW_BIDS",

  // Admin permissions
  MANAGE_ORGANIZATIONS = "MANAGE_ORGANIZATIONS",
  MANAGE_SYSTEM = "MANAGE_SYSTEM",
}

export interface UserProfile {
  id: string
  organizationId: string
  email: string
  name: string
  title?: string
  phone?: string
  timezone?: string
  role: UserRole
  permissions: Permission[]
  isActive: boolean
  lastLogin?: Date
}

export function toUserProfile(user: User): UserProfile {
  const { passwordHash, ...profile } = user
  return profile
}
