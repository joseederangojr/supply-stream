import type { AuthService } from "../../domain/services/AuthService"
import { logger } from "../../utils/logger"

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(data: any) {
    try {
      return await this.authService.register(data)
    } catch (error) {
      logger.error("Controller error: register", {
        error: error instanceof Error ? error.message : "Unknown error",
        email: data.email,
      })
      throw error
    }
  }

  async login(credentials: { email: string; password: string }) {
    try {
      return await this.authService.login(credentials)
    } catch (error) {
      logger.error("Controller error: login", {
        error: error instanceof Error ? error.message : "Unknown error",
        email: credentials.email,
      })
      throw error
    }
  }

  async refreshToken(token: string) {
    try {
      return await this.authService.refreshToken(token)
    } catch (error) {
      logger.error("Controller error: refreshToken", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      throw error
    }
  }

  async logout(token: string) {
    try {
      await this.authService.logout(token)
      return { success: true }
    } catch (error) {
      logger.error("Controller error: logout", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      throw error
    }
  }

  async logoutAll(userId: string) {
    try {
      await this.authService.logoutAll(userId)
      return { success: true }
    } catch (error) {
      logger.error("Controller error: logoutAll", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      })
      throw error
    }
  }

  async changePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
    try {
      await this.authService.changePassword(userId, data)
      return { success: true }
    } catch (error) {
      logger.error("Controller error: changePassword", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      })
      throw error
    }
  }

  async resetPassword(email: string) {
    try {
      await this.authService.resetPassword(email)
      return { success: true }
    } catch (error) {
      logger.error("Controller error: resetPassword", {
        error: error instanceof Error ? error.message : "Unknown error",
        email,
      })
      throw error
    }
  }

  async confirmResetPassword(token: string, newPassword: string) {
    try {
      await this.authService.confirmResetPassword(token, newPassword)
      return { success: true }
    } catch (error) {
      logger.error("Controller error: confirmResetPassword", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      throw error
    }
  }

  async verifyToken(token: string) {
    try {
      return await this.authService.verifyToken(token)
    } catch (error) {
      logger.error("Controller error: verifyToken", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      throw error
    }
  }
}
