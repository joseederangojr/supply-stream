import type { UserProfile } from "../models/User"

export interface UserService {
  getUserById(id: string): Promise<UserProfile | null>
  getUserByEmail(email: string): Promise<UserProfile | null>
  getUsersByOrganizationId(organizationId: string): Promise<UserProfile[]>
  createUser(userData: CreateUserDto): Promise<UserProfile>
  updateUser(id: string, userData: UpdateUserDto): Promise<UserProfile | null>
  deleteUser(id: string): Promise<boolean>
  updateUserPermissions(id: string, permissions: string[]): Promise<UserProfile | null>
  activateUser(id: string): Promise<UserProfile | null>
  deactivateUser(id: string): Promise<UserProfile | null>
}

export interface CreateUserDto {
  organizationId: string
  email: string
  password: string
  name: string
  title?: string
  phone?: string
  timezone?: string
  role: string
  permissions: string[]
}

export interface UpdateUserDto {
  name?: string
  title?: string
  phone?: string
  timezone?: string
  role?: string
}
