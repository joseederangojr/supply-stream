import type { User } from "../models/User"

export interface UserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findByOrganizationId(organizationId: string): Promise<User[]>
  create(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User>
  update(id: string, user: Partial<User>): Promise<User | null>
  updateLastLogin(id: string): Promise<void>
  delete(id: string): Promise<boolean>
}
