import { Kysely, PostgresDialect } from "kysely"
import { Pool } from "pg"
import { config } from "../../config"
import { logger } from "../../utils/logger"
import type { Database } from "./schema"

// Create a connection pool
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  max: config.database.max,
  idleTimeoutMillis: config.database.idleTimeoutMillis,
})

// Log pool errors
pool.on("error", (err) => {
  logger.error("Unexpected error on idle client", { error: err.message })
})

// Create Kysely instance
export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool,
  }),
})

// Function to close the pool
export async function closeDatabase(): Promise<void> {
  await db.destroy()
}
