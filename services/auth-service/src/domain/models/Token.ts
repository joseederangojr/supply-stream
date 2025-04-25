export interface RefreshToken {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
  revokedAt?: Date
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface TokenPayload {
  sub: string // userId
  org: string // organizationId
  role: string
  permissions: string[]
  iat: number
  exp: number
}
