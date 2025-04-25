import { v4 as uuidv4 } from "uuid"
import type { TokenRepository } from "../domain/repositories/TokenRepository"
import type { RefreshToken } from "../domain/models/Token"
import { db } from "../infrastructure/database"
import { logger } from "../utils/logger"

export class PostgresTokenRepository implements TokenRepository {
  async findById(id: string): Promise<RefreshToken | null> {
    try {
      const result = await db.selectFrom("refresh_tokens").selectAll().where("id", "=", id).executeTakeFirst()

      return result ? this.mapToModel(result) : null
    } catch (error) {
      logger.error("Error finding token by ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        tokenId: id,
      })
      throw error
    }
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    try {
      const result = await db.selectFrom("refresh_tokens").selectAll().where("token", "=", token).executeTakeFirst()

      return result ? this.mapToModel(result) : null
    } catch (error) {
      logger.error("Error finding token by value", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      throw error
    }
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    try {
      const results = await db
        .selectFrom("refresh_tokens")
        .selectAll()
        .where("user_id", "=", userId)
        .where("revoked_at", "is", null)
        .where("expires_at", ">", new Date())
        .execute()

      return results.map(this.mapToModel)
    } catch (error) {
      logger.error("Error finding tokens by user ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      })
      throw error
    }
  }

  async create(token: Omit<RefreshToken, "id" | "createdAt">): Promise<RefreshToken> {
    try {
      const id = uuidv4()
      const now = new Date()

      const result = await db
        .insertInto("refresh_tokens")
        .values({
          id,
          user_id: token.userId,
          token: token.token,
          expires_at: token.expiresAt,
          created_at: now,
          revoked_at: token.revokedAt || null,
        })
        .returningAll()
        .executeTakeFirstOrThrow()

      return this.mapToModel(result)
    } catch (error) {
      logger.error("Error creating token", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: token.userId,
      })
      throw error
    }
  }

  async revokeById(id: string): Promise<boolean> {
    try {
      const result = await db
        .updateTable("refresh_tokens")
        .set({
          revoked_at: new Date(),
        })
        .where("id", "=", id)
        .where("revoked_at", "is", null)
        .executeTakeFirst()

      return result.numUpdatedRows > 0
    } catch (error) {
      logger.error("Error revoking token by ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        tokenId: id,
      })
      throw error
    }
  }

  async revokeByUserId(userId: string): Promise<boolean> {
    try {
      const result = await db
        .updateTable("refresh_tokens")
        .set({
          revoked_at: new Date(),
        })
        .where("user_id", "=", userId)
        .where("revoked_at", "is", null)
        .executeTakeFirst()

      return result.numUpdatedRows > 0
    } catch (error) {
      logger.error("Error revoking tokens by user ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      })
      throw error
    }
  }

  async revokeExpiredTokens(): Promise<number> {
    try {
      const result = await db
        .updateTable("refresh_tokens")
        .set({
          revoked_at: new Date(),
        })
        .where("expires_at", "<=", new Date())
        .where("revoked_at", "is", null)
        .executeTakeFirst()

      return Number(result.numUpdatedRows)
    } catch (error) {
      logger.error("Error revoking expired tokens", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      throw error
    }
  }

  private mapToModel(data: any): RefreshToken {
    return {
      id: data.id,
      userId: data.user_id,
      token: data.token,
      expiresAt: new Date(data.expires_at),
      createdAt: new Date(data.created_at),
      revokedAt: data.revoked_at ? new Date(data.revoked_at) : undefined,
    }
  }
}
