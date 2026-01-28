// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - SEARCH SERVICE
// Global search functionality
// ══════════════════════════════════════════════════════════════════════════════

import { db, eq, and, or, sql, desc, ilike } from '@voxpoll/database'
import { polls, users } from '@voxpoll/database'
import { buildPaginationMeta } from '../repositories/base.repository'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SearchResult {
  type: 'poll' | 'user' | 'tag'
  id: string
  title?: string
  username?: string
  displayName?: string | null
  avatarUrl?: string | null
  slug?: string
  participantCount?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Search Service Class
// ─────────────────────────────────────────────────────────────────────────────

class SearchServiceClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Global Search
  // ─────────────────────────────────────────────────────────────────────────────

  async search(
    query: string,
    type: 'all' | 'polls' | 'users' | 'tags' = 'all',
    page: number = 1,
    limit: number = PAGINATION.defaultLimit,
    userId?: string
  ) {
    const offset = (page - 1) * limit
    const searchPattern = `%${query}%`
    const results: SearchResult[] = []

    if (type === 'all' || type === 'polls') {
      const pollResults = await db
        .select({
          id: polls.id,
          title: polls.title,
          slug: polls.slug,
          participantCount: polls.participantCount,
        })
        .from(polls)
        .where(
          and(
            or(ilike(polls.title, searchPattern), ilike(polls.description, searchPattern)),
            eq(polls.visibility, 'PUBLIC'),
            eq(polls.status, 'ACTIVE'),
            sql`${polls.deletedAt} IS NULL`
          )
        )
        .orderBy(desc(polls.participantCount))
        .limit(type === 'polls' ? limit : Math.floor(limit / 2))

      results.push(
        ...pollResults.map((p) => ({
          type: 'poll' as const,
          id: p.id,
          title: p.title,
          slug: p.slug,
          participantCount: p.participantCount,
        }))
      )
    }

    if (type === 'all' || type === 'users') {
      const userResults = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        })
        .from(users)
        .where(
          and(
            or(ilike(users.username, searchPattern), ilike(users.displayName, searchPattern)),
            eq(users.status, 'ACTIVE')
          )
        )
        .orderBy(desc(users.trustScoreValue))
        .limit(type === 'users' ? limit : Math.floor(limit / 2))

      results.push(
        ...userResults.map((u) => ({
          type: 'user' as const,
          id: u.id,
          username: u.username,
          displayName: u.displayName,
          avatarUrl: u.avatarUrl,
        }))
      )
    }

    if (type === 'all' || type === 'tags') {
      const tagResults = await this.searchTags(query, type === 'tags' ? limit : 5)
      results.push(
        ...tagResults.map((t) => ({
          type: 'tag' as const,
          id: t.name,
          title: t.name,
        }))
      )
    }

    const total = results.length

    return {
      items: results.slice(offset, offset + limit),
      meta: buildPaginationMeta(page, limit, total),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Search Tags
  // ─────────────────────────────────────────────────────────────────────────────

  async searchTags(query: string, limit: number = 10) {
    const searchPattern = `%${query}%`

    const tagResults = await db
      .select({
        name: sql<string>`DISTINCT unnest(${polls.tags})`,
      })
      .from(polls)
      .where(
        and(
          sql`${query} = ANY(${polls.tags}) OR EXISTS (SELECT 1 FROM unnest(${polls.tags}) tag WHERE tag ILIKE ${searchPattern})`,
          eq(polls.visibility, 'PUBLIC'),
          sql`${polls.deletedAt} IS NULL`
        )
      )
      .limit(limit)

    return tagResults.map((t) => ({ name: t.name, count: 0 }))
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Suggestions
  // ─────────────────────────────────────────────────────────────────────────────

  async getSuggestions(query: string, limit: number = 10) {
    const searchPattern = `${query}%`

    const [pollSuggestions, userSuggestions] = await Promise.all([
      db
        .select({ title: polls.title })
        .from(polls)
        .where(
          and(
            ilike(polls.title, searchPattern),
            eq(polls.visibility, 'PUBLIC'),
            eq(polls.status, 'ACTIVE'),
            sql`${polls.deletedAt} IS NULL`
          )
        )
        .orderBy(desc(polls.participantCount))
        .limit(Math.floor(limit / 2)),
      db
        .select({ username: users.username, displayName: users.displayName })
        .from(users)
        .where(
          and(
            or(ilike(users.username, searchPattern), ilike(users.displayName, searchPattern)),
            eq(users.status, 'ACTIVE')
          )
        )
        .limit(Math.floor(limit / 2)),
    ])

    return {
      polls: pollSuggestions.map((p) => p.title),
      users: userSuggestions.map((u) => ({ username: u.username, displayName: u.displayName })),
    }
  }
}

// Export singleton
export const searchService = new SearchServiceClass()

// Export class for testing
export { SearchServiceClass as SearchService }
