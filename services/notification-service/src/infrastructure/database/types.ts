import type { Generated } from "kysely"

export interface Database {
  notifications: NotificationTable
  notification_preferences: NotificationPreferenceTable
}

export interface NotificationTable {
  id: Generated<string>
  user_id: string
  type: string
  title: string
  message: string
  data: object | null
  is_read: boolean
  created_at: Generated<Date>
  updated_at: Generated<Date>
}

export interface NotificationPreferenceTable {
  id: Generated<string>
  user_id: string
  type: string
  email: boolean
  in_app: boolean
  created_at: Generated<Date>
  updated_at: Generated<Date>
}
