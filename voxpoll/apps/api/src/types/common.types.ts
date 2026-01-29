// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - COMMON TYPES
// ══════════════════════════════════════════════════════════════════════════════

import type { User, Session, OrganizationMember } from '@voxpoll/database'

// ─────────────────────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number
  limit?: number
  cursor?: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
  nextCursor?: string
}

export interface PaginatedResult<T> {
  items: T[]
  meta: PaginationMeta
}

// ─────────────────────────────────────────────────────────────────────────────
// Query Parameters
// ─────────────────────────────────────────────────────────────────────────────

export interface QueryParams<TFilter = Record<string, unknown>> {
  pagination?: PaginationParams
  filter?: TFilter
  orderBy?: OrderByParams
  include?: string[]
}

export interface OrderByParams {
  field: string
  direction: 'asc' | 'desc'
}

// ─────────────────────────────────────────────────────────────────────────────
// API Response
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiErrorResponse
  meta?: PaginationMeta
}

export interface ApiErrorResponse {
  code: string
  message: string
  details?: Record<string, unknown>
  stack?: string // Only in development
}

// ─────────────────────────────────────────────────────────────────────────────
// Context Extensions
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthContext {
  user: User | null
  session: Session | null
  orgMembership: OrganizationMember | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Client Info
// ─────────────────────────────────────────────────────────────────────────────

export interface ClientInfo {
  ip: string | null
  userAgent: string | null
  deviceId?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Soft Delete
// ─────────────────────────────────────────────────────────────────────────────

export interface SoftDeletable {
  deletedAt: Date | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Timestamps
// ─────────────────────────────────────────────────────────────────────────────

export interface Timestamps {
  createdAt: Date
  updatedAt: Date
}

// ─────────────────────────────────────────────────────────────────────────────
// ID Types (for type safety)
// ─────────────────────────────────────────────────────────────────────────────

export type UserId = string
export type PollId = string
export type SurveyId = string
export type TestId = string
export type CommentId = string
export type OrganizationId = string
export type SessionId = string

// ─────────────────────────────────────────────────────────────────────────────
// Service Result Types
// ─────────────────────────────────────────────────────────────────────────────

export type ServiceResult<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

// ─────────────────────────────────────────────────────────────────────────────
// Utility Types
// ─────────────────────────────────────────────────────────────────────────────

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
