import type { Generated } from "kysely"

export interface Database {
  users: UserTable
  refresh_tokens: RefreshTokenTable
}

export interface UserTable {
  id: Generated<string>
  organization_id: string
  email: string
  password_hash: string
  name: string
  title: string | null
  phone: string | null
  timezone: string | null
  role: string
  permissions: string[]
  is_active: boolean
  last_login: Date | null
  created_at: Generated<Date>
  updated_at: Generated<Date>
}

export interface RefreshTokenTable {
  id: Generated<string>
  user_id: string
  token: string
  expires_at: Date
  created_at: Generated<Date>
  revoked_at: Date | null
}
