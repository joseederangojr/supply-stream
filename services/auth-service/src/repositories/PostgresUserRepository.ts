import { v4 as uuidv4 } from "uuid"
import type { UserRepository } from "../domain/repositories/UserRepository"
import type { User, UserRole, Permission } from "../domain/models/User"
import { db } from "../infrastructure/database"
import { logger } from "../utils/logger"

export class PostgresUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    try {
      const result = await db.selectFrom("users").selectAll().where("id", "=", id).executeTakeFirst()

      return result ? this.mapToModel(result) : null
    } catch (error) {
      logger.error("Error finding user by ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: id,
      })
      throw error
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await db.selectFrom("users").selectAll().where("email", "=", email).executeTakeFirst()

      return result ? this.mapToModel(result) : null
    } catch (error) {
      logger.error("Error finding user by email", {
        error: error instanceof Error ? error.message : "Unknown error",
        email,
      })
      throw error
    }
  }

  async findByOrganizationId(organizationId: string): Promise<User[]> {
    try {
      const results = await db.selectFrom("users").selectAll().where("organization_id", "=", organizationId).execute()

      return results.map(this.mapToModel)
    } catch (error) {
      logger.error("Error finding users by organization ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
      })
      throw error
    }
  }

  async create(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    try {
      const id = uuidv4()
      const now = new Date()

      const result = await db
        .insertInto("users")
        .values({
          id,
          organization_id: user.organizationId,
          email: user.email,
          password_hash: user.passwordHash,
          name: user.name,
          title: user.title || null,
          phone: user.phone || null,
          timezone: user.timezone || null,
          role: user.role,
          permissions: user.permissions,
          is_active: user.isActive,
          last_login: user.lastLogin || null,
          created_at: now,
          updated_at: now,
        })
        .returningAll()
        .executeTakeFirstOrThrow()

      return this.mapToModel(result)
    } catch (error) {
      logger.error("Error creating user", {
        error: error instanceof Error ? error.message : "Unknown error",
        email: user.email,
      })
      throw error
    }
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    try {
      // Build update object dynamically based on provided fields
      const updateValues: any = {
        updated_at: new Date(),
      }

      if (user.email !== undefined) updateValues.email = user.email
      if (user.passwordHash !== undefined) updateValues.password_hash = user.passwordHash
      if (user.name !== undefined) updateValues.name = user.name
      if (user.title !== undefined) updateValues.title = user.title
      if (user.phone !== undefined) updateValues.phone = user.phone
      if (user.timezone !== undefined) updateValues.timezone = user.timezone
      if (user.role !== undefined) updateValues.role = user.role
      if (user.permissions !== undefined) updateValues.permissions = user.permissions
      if (user.isActive !== undefined) updateValues.is_active = user.isActive
      if (user.lastLogin !== undefined) updateValues.last_login = user.lastLogin

      const result = await db
        .updateTable("users")
        .set(updateValues)
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirst()

      return result ? this.mapToModel(result) : null
    } catch (error) {
      logger.error("Error updating user", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: id,
      })
      throw error
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    try {
      await db
        .updateTable("users")
        .set({
          last_login: new Date(),
          updated_at: new Date(),
        })
        .where("id", "=", id)
        .execute()
    } catch (error) {
      logger.error("Error updating user last login", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: id,
      })
      throw error
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db.deleteFrom("users").where("id", "=", id).executeTakeFirst()

      return result.numDeletedRows > 0
    } catch (error) {
      logger.error("Error deleting user", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: id,
      })
      throw error
    }
  }

  private mapToModel(data: any): User {
    return {
      id: data.id,
      organizationId: data.organization_id,
      email: data.email,
      passwordHash: data.password_hash,
      name: data.name,
      title: data.title || undefined,
      phone: data.phone || undefined,
      timezone: data.timezone || undefined,
      role: data.role as UserRole,
      permissions: data.permissions as Permission[],
      isActive: data.is_active,
      lastLogin: data.last_login ? new Date(data.last_login) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }
}
