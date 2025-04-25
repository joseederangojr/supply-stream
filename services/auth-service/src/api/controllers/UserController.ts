import type { UserService } from "../../domain/services/UserService"
import { logger } from "../../utils/logger"

export class UserController {
  constructor(private userService: UserService) {}

  async getUserById(id: string) {
    try {
      return await this.userService.getUserById(id)
    } catch (error) {
      logger.error("Controller error: getUserById", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: id,
      })
      throw error
    }
  }

  async getUserByEmail(email: string) {
    try {
      return await this.userService.getUserByEmail(email)
    } catch (error) {
      logger.error("Controller error: getUserByEmail", {
        error: error instanceof Error ? error.message : "Unknown error",
        email,
      })
      throw error
    }
  }

  async getUsersByOrganizationId(organizationId: string) {
    try {
      return await this.userService.getUsersByOrganizationId(organizationId)
    } catch (error) {
      logger.error("Controller error: getUsersByOrganizationId", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
      })
      throw error
    }
  }

  async createUser(data: any) {
    try {
      return await this.userService.createUser(data)
    } catch (error) {
      logger.error("Controller error: createUser", {
        error: error instanceof Error ? error.message : "Unknown error",
        email: data.email,
      })
      throw error
    }
  }

  async updateUser(id: string, data: any) {
    try {
      return await this.userService.updateUser(id, data)
    } catch (error) {
      logger.error("Controller error: updateUser", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: id,
      })
      throw error
    }
  }

  async deleteUser(id: string) {
    try {
      const success = await this.userService.deleteUser(id)
      return { success }
    } catch (error) {
      logger.error("Controller error: deleteUser", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: id,
      })
      throw error
    }
  }

  async updateUserPermissions(id: string, permissions: string[]) {
    try {
      return await this.userService.updateUserPermissions(id, permissions)
    } catch (error) {
      logger.error("Controller error: updateUserPermissions", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: id,
      })
      throw error
    }
  }

  async activateUser(id: string) {
    try {
      return await this.userService.activateUser(id)
    } catch (error) {
      logger.error("Controller error: activateUser", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: id,
      })
      throw error
    }
  }

  async deactivateUser(id: string) {
    try {
      return await this.userService.deactivateUser(id)
    } catch (error) {
      logger.error("Controller error: deactivateUser", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: id,
      })
      throw error
    }
  }
}
