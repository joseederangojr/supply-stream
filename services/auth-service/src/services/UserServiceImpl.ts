import * as bcrypt from "bcryptjs"
import type { UserService, CreateUserDto, UpdateUserDto } from "../domain/services/UserService"
import type { UserRepository } from "../domain/repositories/UserRepository"
import type { UserProfile } from "../domain/models/User"
import { toUserProfile } from "../domain/models/User"
import { config } from "../config"
import { logger } from "../utils/logger"

export class UserServiceImpl implements UserService {
  constructor(private userRepository: UserRepository) {}

  async getUserById(id: string): Promise<UserProfile | null> {
    try {
      const user = await this.userRepository.findById(id)
      return user ? toUserProfile(user) : null
    } catch (error) {
      logger.error("Error getting user by ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: id,
      })
      throw error
    }
  }

  async getUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      const user = await this.userRepository.findByEmail(email)
      return user ? toUserProfile(user) : null
    } catch (error) {
      logger.error("Error getting user by email", {
        error: error instanceof Error ? error.message : "Unknown error",
        email,
      })
      throw error
    }
  }

  async getUsersByOrganizationId(organizationId: string): Promise<UserProfile[]> {
    try {
      const users = await this.userRepository.findByOrganizationId(organizationId)
      return users.map(toUserProfile)
    } catch (error) {
      logger.error("Error getting users by organization ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
      })
      throw error
    }
  }

  async createUser(userData: CreateUserDto): Promise<UserProfile> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(userData.email)
      if (existingUser) {
        throw new Error("User with this email already exists")
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, config.auth.saltRounds)

      // Create user
      const user = await this.userRepository.create({
        organizationId: userData.organizationId,
        email: userData.email,
        passwordHash,
        name: userData.name,
        title: userData.title,
        phone: userData.phone,
        timezone: userData.timezone,
        role: userData.role,
        permissions: userData.permissions,
        isActive: true,
      })

      return toUserProfile(user)
    } catch (error) {
      logger.error("Error creating user", {
        error: error instanceof Error ? error.message : "Unknown error",
        email: userData.email,
      })
      throw error
    }
  }

  async updateUser(id: string, userData: UpdateUserDto): Promise<UserProfile | null> {
    try {
      const user = await this.userRepository.findById(id)
      if (!user) {
        return null
      }

      const updatedUser = await this.userRepository.update(id, userData)
      return updatedUser ? toUserProfile(updatedUser) : null
    } catch (error) {
      logger.error("Error updating user", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: id,
      })
      throw error
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      return await this.userRepository.delete(id)
    } catch (error) {
      logger.error("Error deleting user", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: id,
      })
      throw error
    }
  }

  async updateUserPermissions(id: string, permissions: string[]): Promise<UserProfile | null> {
    try {
      const user = await this.userRepository.findById(id)
      if (!user) {
        return null
      }

      const updatedUser = await this.userRepository.update(id, { permissions })
      return updatedUser ? toUserProfile(updatedUser) : null
    } catch (error) {
      logger.error("Error updating user permissions", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: id,
      })
      throw error
    }
  }

  async activateUser(id: string): Promise<UserProfile | null> {
    try {
      const user = await this.userRepository.findById(id)
      if (!user) {
        return null
      }

      const updatedUser = await this.userRepository.update(id, { isActive: true })
      return updatedUser ? toUserProfile(updatedUser) : null
    } catch (error) {
      logger.error("Error activating user", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: id,
      })
      throw error
    }
  }

  async deactivateUser(id: string): Promise<UserProfile | null> {
    try {
      const user = await this.userRepository.findById(id)
      if (!user) {
        return null
      }

      const updatedUser = await this.userRepository.update(id, { isActive: false })
      return updatedUser ? toUserProfile(updatedUser) : null
    } catch (error) {
      logger.error("Error deactivating user", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: id,
      })
      throw error
    }
  }
}
