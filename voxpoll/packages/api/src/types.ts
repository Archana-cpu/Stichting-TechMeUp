// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - TYPE DEFINITIONS
// ══════════════════════════════════════════════════════════════════════════════

import type { InferSelectModel } from '@voxpoll/database'
import type { users, organizationMembers } from '@voxpoll/database'

// ─────────────────────────────────────────────────────────────────────────────
// Database Model Types
// ─────────────────────────────────────────────────────────────────────────────

export type User = InferSelectModel<typeof users>
export type OrganizationMember = InferSelectModel<typeof organizationMembers>

// ─────────────────────────────────────────────────────────────────────────────
// Hono Environment Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AppEnv {
  Variables: {
    user?: User
    userId?: string
    requestId: string
    orgMembership?: OrganizationMember
    pulseAccessReason?: string
    commentAccessReason?: string
    requiresVoiceAccess?: boolean
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// API Response Types [AUTHORITATIVE: bible-030]
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
    hasMore?: boolean
  }
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// ─────────────────────────────────────────────────────────────────────────────
// Pagination Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number
  limit?: number
  cursor?: string
}

export interface PaginatedResult<T> {
  items: T[]
  meta: {
    page: number
    limit: number
    total: number
    hasMore: boolean
    nextCursor?: string
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthPayload {
  userId: string
  email: string
  sessionId: string
  iat: number
  exp: number
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
}
