export interface QueryOptions {
  page?: number
  limit?: number
  orderBy?: string
  orderDirection?: "ASC" | "DESC"
}

export function buildPaginationQuery(options?: QueryOptions): {
  limitClause: string
  offsetClause: string
  orderClause: string
  values: any[]
} {
  const limit = options?.limit || 10
  const page = options?.page || 1
  const offset = (page - 1) * limit
  const orderBy = options?.orderBy || "created_at"
  const orderDirection = options?.orderDirection || "DESC"

  return {
    limitClause: `LIMIT $1`,
    offsetClause: `OFFSET $2`,
    orderClause: `ORDER BY ${orderBy} ${orderDirection}`,
    values: [limit, offset],
  }
}
