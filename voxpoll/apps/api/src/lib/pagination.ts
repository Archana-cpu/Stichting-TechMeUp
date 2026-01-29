// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - PAGINATION UTILITIES
// ══════════════════════════════════════════════════════════════════════════════

import type { Context } from 'hono'
import type { PaginationParams, PaginationMeta } from '../types/common.types'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Parse Pagination from Query
// ─────────────────────────────────────────────────────────────────────────────

export function parsePagination(c: Context): PaginationParams {
  const query = c.req.query()

  const page = Math.max(1, parseInt(query['page'] || '', 10) || PAGINATION.defaultPage)
  const limit = Math.min(
    Math.max(1, parseInt(query['limit'] || '', 10) || PAGINATION.defaultLimit),
    PAGINATION.maxLimit
  )
  const cursor = query['cursor'] || undefined

  return { page, limit, cursor }
}

// ─────────────────────────────────────────────────────────────────────────────
// Build Pagination Meta
// ─────────────────────────────────────────────────────────────────────────────

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
  nextCursor?: string
): PaginationMeta {
  const totalPages = Math.ceil(total / limit)

  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
    ...(nextCursor ? { nextCursor } : {}),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Calculate Skip
// ─────────────────────────────────────────────────────────────────────────────

export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit
}

// ─────────────────────────────────────────────────────────────────────────────
// Parse Sort
// ─────────────────────────────────────────────────────────────────────────────

export interface SortParams {
  field: string
  direction: 'asc' | 'desc'
}

export function parseSort(
  c: Context,
  allowedFields: string[],
  defaultField: string = 'createdAt',
  defaultDirection: 'asc' | 'desc' = 'desc'
): SortParams {
  const query = c.req.query()

  let field = query['sortBy'] || query['sort'] || defaultField
  let direction: 'asc' | 'desc' = defaultDirection

  // Check for direction prefix (e.g., -createdAt for desc)
  if (field.startsWith('-')) {
    direction = 'desc'
    field = field.slice(1)
  } else if (field.startsWith('+')) {
    direction = 'asc'
    field = field.slice(1)
  } else if (query['order']) {
    direction = query['order'] === 'asc' ? 'asc' : 'desc'
  }

  // Validate field
  if (!allowedFields.includes(field)) {
    field = defaultField
  }

  return { field, direction }
}

// ─────────────────────────────────────────────────────────────────────────────
// Build Drizzle OrderBy
// ─────────────────────────────────────────────────────────────────────────────

export function buildOrderBy(sort: SortParams): Record<string, 'asc' | 'desc'> {
  return { [sort.field]: sort.direction }
}

// ─────────────────────────────────────────────────────────────────────────────
// Cursor-based Pagination
// ─────────────────────────────────────────────────────────────────────────────

export interface CursorPaginationParams {
  cursor?: string
  limit: number
  direction?: 'forward' | 'backward'
}

export function parseCursorPagination(c: Context): CursorPaginationParams {
  const query = c.req.query()

  const cursor = query['cursor'] || undefined
  const limit = Math.min(
    Math.max(1, parseInt(query['limit'] || '', 10) || PAGINATION.defaultLimit),
    PAGINATION.maxLimit
  )
  const direction = (query['direction'] === 'backward' ? 'backward' : 'forward') as 'forward' | 'backward'

  return { cursor, limit, direction }
}

// ─────────────────────────────────────────────────────────────────────────────
// Encode/Decode Cursor
// ─────────────────────────────────────────────────────────────────────────────

export function encodeCursor(data: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(data)).toString('base64url')
}

export function decodeCursor<T = Record<string, unknown>>(cursor: string): T | null {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf-8')
    return JSON.parse(decoded) as T
  } catch {
    return null
  }
}
