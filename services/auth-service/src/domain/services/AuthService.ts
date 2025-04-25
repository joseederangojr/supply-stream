import type { UserProfile } from "../models/User"
import type { TokenPair } from "../models/Token"

export interface AuthService {
  register(userData: RegisterUserDto): Promise<UserProfile>
  login(credentials: LoginCredentialsDto): Promise<{ user: UserProfile; tokens: TokenPair }>
  refreshToken(refreshToken: string): Promise<TokenPair>
  logout(refreshToken: string): Promise<void>
  logoutAll(userId: string): Promise<void>
  changePassword(userId: string, data: ChangePasswordDto): Promise<void>
  resetPassword(email: string): Promise<void>
  confirmResetPassword(token: string, newPassword: string): Promise<void>
  verifyToken(token: string): Promise<UserProfile>
}

export interface RegisterUserDto {
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

export interface LoginCredentialsDto {
  email: string
  password: string
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}
