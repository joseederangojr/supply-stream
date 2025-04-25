import type { UserRepository } from "../../domain/repositories/UserRepository"
import { PostgresUserRepository } from "../../repositories/PostgresUserRepository"
import type { TokenRepository } from "../../domain/repositories/TokenRepository"
import { PostgresTokenRepository } from "../../repositories/PostgresTokenRepository"
import type { AuthService } from "../../domain/services/AuthService"
import { AuthServiceImpl } from "../../services/AuthServiceImpl"
import type { UserService } from "../../domain/services/UserService"
import { UserServiceImpl } from "../../services/UserServiceImpl"
import { AuthController } from "../../api/controllers/AuthController"
import { UserController } from "../../api/controllers/UserController"

export interface Container {
  userRepository: UserRepository
  tokenRepository: TokenRepository
  authService: AuthService
  userService: UserService
  authController: AuthController
  userController: UserController
}

export function createContainer(): Container {
  // Create repositories
  const userRepository = new PostgresUserRepository()
  const tokenRepository = new PostgresTokenRepository()

  // Create services
  const authService = new AuthServiceImpl(userRepository, tokenRepository)
  const userService = new UserServiceImpl(userRepository)

  // Create controllers
  const authController = new AuthController(authService)
  const userController = new UserController(userService)

  return {
    userRepository,
    tokenRepository,
    authService,
    userService,
    authController,
    userController,
  }
}
