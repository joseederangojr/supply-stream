import * as bcrypt from "bcryptjs"
import * as jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"
import type {
  AuthService,
  RegisterUserDto,
  LoginCredentialsDto,
  ChangePasswordDto,
} from "../domain/services/AuthService"
import type { UserRepository } from "../domain/repositories/UserRepository"
import type { TokenRepository } from "../domain/repositories/TokenRepository"
import type { UserProfile } from "../domain/models/User"
import { toUserProfile } from "../domain/models/User"
import type { TokenPair, TokenPayload } from "../domain/models/Token"
import { config } from "../config"
import { logger } from "../utils/logger"
import { sendMessage } from "../infrastructure/messaging/serviceBus"

export class AuthServiceImpl implements AuthService {
  constructor(
    private userRepository: UserRepository,
    private tokenRepository: TokenRepository,
  ) {}

  async register(userData: RegisterUserDto): Promise<UserProfile> {
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

      // Send welcome email notification
      await this.sendUserCreatedNotification(user.id, user.email, user.name)

      return toUserProfile(user)
    } catch (error) {
      logger.error("Error registering user", {
        error: error instanceof Error ? error.message : "Unknown error",
        email: userData.email,
      })
      throw error
    }
  }

  async login(credentials: LoginCredentialsDto): Promise<{ user: UserProfile; tokens: TokenPair }> {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(credentials.email)
      if (!user) {
        throw new Error("Invalid email or password")
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error("User account is inactive")
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash)
      if (!isPasswordValid) {
        throw new Error("Invalid email or password")
      }

      // Generate tokens
      const tokens = await this.generateTokens(user.id, user.organizationId, user.role, user.permissions)

      // Update last login
      await this.userRepository.updateLastLogin(user.id)

      return {
        user: toUserProfile(user),
        tokens,
      }
    } catch (error) {
      logger.error("Error logging in user", {
        error: error instanceof Error ? error.message : "Unknown error",
        email: credentials.email,
      })
      throw error
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Find token in database
      const tokenRecord = await this.tokenRepository.findByToken(refreshToken)
      if (!tokenRecord) {
        throw new Error("Invalid refresh token")
      }

      // Check if token is expired or revoked
      if (tokenRecord.expiresAt < new Date() || tokenRecord.revokedAt) {
        throw new Error("Refresh token expired or revoked")
      }

      // Find user
      const user = await this.userRepository.findById(tokenRecord.userId)
      if (!user) {
        throw new Error("User not found")
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error("User account is inactive")
      }

      // Revoke the current refresh token
      await this.tokenRepository.revokeById(tokenRecord.id)

      // Generate new tokens
      return await this.generateTokens(user.id, user.organizationId, user.role, user.permissions)
    } catch (error) {
      logger.error("Error refreshing token", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      throw error
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      // Find token in database
      const tokenRecord = await this.tokenRepository.findByToken(refreshToken)
      if (!tokenRecord) {
        return // Token not found, nothing to do
      }

      // Revoke the token
      await this.tokenRepository.revokeById(tokenRecord.id)
    } catch (error) {
      logger.error("Error logging out user", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      throw error
    }
  }

  async logoutAll(userId: string): Promise<void> {
    try {
      // Revoke all tokens for the user
      await this.tokenRepository.revokeByUserId(userId)
    } catch (error) {
      logger.error("Error logging out user from all devices", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      })
      throw error
    }
  }

  async changePassword(userId: string, data: ChangePasswordDto): Promise<void> {
    try {
      // Find user
      const user = await this.userRepository.findById(userId)
      if (!user) {
        throw new Error("User not found")
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(data.currentPassword, user.passwordHash)
      if (!isPasswordValid) {
        throw new Error("Current password is incorrect")
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(data.newPassword, config.auth.saltRounds)

      // Update user
      await this.userRepository.update(userId, { passwordHash })

      // Revoke all refresh tokens
      await this.tokenRepository.revokeByUserId(userId)

      // Send password changed notification
      await this.sendPasswordChangedNotification(userId, user.email)
    } catch (error) {
      logger.error("Error changing password", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      })
      throw error
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(email)
      if (!user) {
        // Don't reveal that the user doesn't exist
        return
      }

      // Generate reset token (JWT with short expiry)
      const resetToken = jwt.sign(
        {
          sub: user.id,
          type: "password_reset",
        },
        config.auth.jwtSecret,
        { expiresIn: "1h" },
      )

      // Send password reset notification with token
      await this.sendPasswordResetNotification(user.id, email, resetToken)
    } catch (error) {
      logger.error("Error requesting password reset", {
        error: error instanceof Error ? error.message : "Unknown error",
        email,
      })
      throw error
    }
  }

  async confirmResetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Verify token
      let payload: any
      try {
        payload = jwt.verify(token, config.auth.jwtSecret)
      } catch (error) {
        throw new Error("Invalid or expired token")
      }

      // Check token type
      if (payload.type !== "password_reset") {
        throw new Error("Invalid token type")
      }

      // Find user
      const userId = payload.sub
      const user = await this.userRepository.findById(userId)
      if (!user) {
        throw new Error("User not found")
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, config.auth.saltRounds)

      // Update user
      await this.userRepository.update(userId, { passwordHash })

      // Revoke all refresh tokens
      await this.tokenRepository.revokeByUserId(userId)

      // Send password changed notification
      await this.sendPasswordChangedNotification(userId, user.email)
    } catch (error) {
      logger.error("Error confirming password reset", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      throw error
    }
  }

  async verifyToken(token: string): Promise<UserProfile> {
    try {
      // Verify token
      let payload: TokenPayload
      try {
        payload = jwt.verify(token, config.auth.jwtSecret) as TokenPayload
      } catch (error) {
        throw new Error("Invalid or expired token")
      }

      // Find user
      const userId = payload.sub
      const user = await this.userRepository.findById(userId)
      if (!user) {
        throw new Error("User not found")
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error("User account is inactive")
      }

      return toUserProfile(user)
    } catch (error) {
      logger.error("Error verifying token", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      throw error
    }
  }

  private async generateTokens(
    userId: string,
    organizationId: string,
    role: string,
    permissions: string[],
  ): Promise<TokenPair> {
    // Generate access token
    const accessToken = jwt.sign(
      {
        sub: userId,
        org: organizationId,
        role,
        permissions,
      },
      config.auth.jwtSecret,
      { expiresIn: config.auth.accessTokenExpiry },
    )

    // Generate refresh token
    const refreshTokenValue = uuidv4()
    const expiresIn = this.getExpirySeconds(config.auth.refreshTokenExpiry)
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    // Store refresh token in database
    await this.tokenRepository.create({
      userId,
      token: refreshTokenValue,
      expiresAt,
    })

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      expiresIn,
    }
  }

  private getExpirySeconds(expiryString: string): number {
    const match = expiryString.match(/^(\d+)([smhd])$/)
    if (!match) {
      return 3600 // Default to 1 hour
    }

    const value = Number.parseInt(match[1], 10)
    const unit = match[2]

    switch (unit) {
      case "s":
        return value
      case "m":
        return value * 60
      case "h":
        return value * 60 * 60
      case "d":
        return value * 24 * 60 * 60
      default:
        return 3600
    }
  }

  private async sendUserCreatedNotification(userId: string, email: string, name: string): Promise<void> {
    try {
      await sendMessage(
        {
          type: "USER_CREATED",
          data: {
            userId,
            email,
            name,
          },
        },
        "notification.user.created",
      )
    } catch (error) {
      logger.error("Error sending user created notification", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      })
      // Don't throw, this is a non-critical operation
    }
  }

  private async sendPasswordChangedNotification(userId: string, email: string): Promise<void> {
    try {
      await sendMessage(
        {
          type: "PASSWORD_CHANGED",
          data: {
            userId,
            email,
          },
        },
        "notification.password.changed",
      )
    } catch (error) {
      logger.error("Error sending password changed notification", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      })
      // Don't throw, this is a non-critical operation
    }
  }

  private async sendPasswordResetNotification(userId: string, email: string, resetToken: string): Promise<void> {
    try {
      await sendMessage(
        {
          type: "PASSWORD_RESET",
          data: {
            userId,
            email,
            resetToken,
          },
        },
        "notification.password.reset",
      )
    } catch (error) {
      logger.error("Error sending password reset notification", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      })
      // Don't throw, this is a non-critical operation
    }
  }
}
