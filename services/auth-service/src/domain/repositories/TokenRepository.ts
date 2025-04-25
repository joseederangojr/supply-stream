import type { RefreshToken } from "../models/Token"

export interface TokenRepository {
  findById(id: string): Promise<RefreshToken | null>
  findByToken(token: string): Promise<RefreshToken | null>
  findByUserId(userId: string): Promise<RefreshToken[]>
  create(token: Omit<RefreshToken, "id" | "createdAt">): Promise<RefreshToken>
  revokeById(id: string): Promise<boolean>
  revokeByUserId(userId: string): Promise<boolean>
  revokeExpiredTokens(): Promise<number>
}
