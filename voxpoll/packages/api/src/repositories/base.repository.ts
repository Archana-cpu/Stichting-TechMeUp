// ════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - BASE REPOSITORY
// Common patterns and helpers for repositories
// ════════════════════════════════════════════════════════════════════════════

import { db } from "@voxpoll/database"
import type { PaginationParams, PaginatedResult, PaginationMeta } from "../types/common.types"
import { PAGINATION } from "../constants/limits"

export type { PaginationParams, PaginatedResult, PaginationMeta }

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export interface FindManyParams<TFilter = Record<string, unknown>> {
  where?: TFilter
  orderBy?: Record<string, "asc" | "desc"> | Array<Record<string, "asc" | "desc">>
  pagination?: PaginationParams
}

export interface FindOneParams {
  select?: Record<string, boolean>
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Build Pagination Meta
// ────────────────────────────────────────────────────────────────────────────

function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit)
  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Parse Pagination Params
// ────────────────────────────────────────────────────────────────────────────

function parsePaginationParams(query: Record<string, string | undefined>): PaginationParams {
  const page = parseInt(query["page"] || "", 10) || PAGINATION.defaultPage
  const limit = Math.min(
    parseInt(query["limit"] || "", 10) || PAGINATION.defaultLimit,
    PAGINATION.maxLimit
  )
  return { page, limit }
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Calculate Skip (Offset)
// ────────────────────────────────────────────────────────────────────────────

function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Soft Delete Data
// ────────────────────────────────────────────────────────────────────────────

function softDeleteData() {
  return {
    deletedAt: new Date(),
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Transaction Helper
// ────────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runTransaction<TResult>(
  fn: (tx: any) => Promise<TResult>
): Promise<TResult> {
  return db.transaction(fn)
}

// ────────────────────────────────────────────────────────────────────────────
// Build Paginated Result
// ────────────────────────────────────────────────────────────────────────────

function buildPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  return {
    items,
    meta: buildPaginationMeta(page, limit, total),
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Exports
// ────────────────────────────────────────────────────────────────────────────

export {
  db,
  buildPaginationMeta,
  parsePaginationParams,
  calculateSkip,
  softDeleteData,
  runTransaction,
  buildPaginatedResult
}
