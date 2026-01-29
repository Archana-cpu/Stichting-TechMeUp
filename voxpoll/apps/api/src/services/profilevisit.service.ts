// ═══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - PROFILE VISIT TRACKING SERVICE
// Bible: 03-FEATURES/08-social.md#Profile-Visits
// ═══════════════════════════════════════════════════════════════════════════════

import { db, eq, and, desc, gte, users, profileVisits } from '@voxpoll/database'
import type { InferSelectModel } from '@voxpoll/database'
import { ApiError } from '../middleware/error-handler'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ProfileVisit = InferSelectModel<typeof profileVisits>

type ProfileVisitSource = 'SEARCH' | 'FEED' | 'COMMENT' | 'MENTION' | 'DIRECT' | 'EXTERNAL'

interface ProfileVisitFeatures {
  canSeeVisitors: boolean
  canVisitAnonymously: boolean
  visitHistoryDays: number
}

interface ProfileVisitorWithUser {
  id: string
  visitorId: string | null
  profileId: string
  source: ProfileVisitSource
  isAnonymous: boolean
  visitedAt: Date
  visitor: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
    verificationLevel: number
  } | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants (Bible: 03-FEATURES/08-social.md)
// ─────────────────────────────────────────────────────────────────────────────

const PROFILE_VISIT_FEATURES: Record<string, ProfileVisitFeatures> = {
  FREE: {
    canSeeVisitors: false,
    canVisitAnonymously: false,
    visitHistoryDays: 0,
  },
  PLUS: {
    canSeeVisitors: true,
    canVisitAnonymously: false,
    visitHistoryDays: 7,
  },
  PREMIUM: {
    canSeeVisitors: true,
    canVisitAnonymously: true,
    visitHistoryDays: 30,
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Service Functions
// ─────────────────────────────────────────────────────────────────────────────

async function trackVisit(
  profileId: string,
  visitorId: string | null,
  source: ProfileVisitSource,
  isAnonymous: boolean = false
): Promise<ProfileVisit> {
  if (visitorId === profileId) {
    return Promise.reject(new Error('Cannot track self-visit'))
  }

  const [visit] = await db
    .insert(profileVisits)
    .values({
      profileId,
      visitorId: isAnonymous ? null : visitorId,
      source,
      isAnonymous,
    })
    .returning()

  return visit!
}

async function getVisitors(
  profileId: string,
  viewerId: string,
  limit: number = 20,
  offset: number = 0
): Promise<ProfileVisitorWithUser[]> {
  const [viewer] = await db
    .select({
      subscriptionTier: users.subscriptionTier,
    })
    .from(users)
    .where(eq(users.id, viewerId))
    .limit(1)

  if (!viewer) {
    throw ApiError.notFound('Kullanıcı bulunamadı.', 'USER_NOT_FOUND')
  }

  const tier = viewer.subscriptionTier || 'FREE'
  const features = PROFILE_VISIT_FEATURES[tier]

  if (!features || !features.canSeeVisitors) {
    throw ApiError.forbidden(
      'Profil ziyaretçilerini görmek için Plus veya Premium üyelik gereklidir.',
      'UPGRADE_REQUIRED'
    )
  }

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - features.visitHistoryDays)

  const visits = await db
    .select({
      id: profileVisits.id,
      visitorId: profileVisits.visitorId,
      profileId: profileVisits.profileId,
      source: profileVisits.source,
      isAnonymous: profileVisits.isAnonymous,
      visitedAt: profileVisits.visitedAt,
      visitor: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        verificationLevel: users.verificationLevel,
      },
    })
    .from(profileVisits)
    .leftJoin(users, eq(profileVisits.visitorId, users.id))
    .where(
      and(
        eq(profileVisits.profileId, profileId),
        gte(profileVisits.visitedAt, cutoffDate),
        eq(profileVisits.isAnonymous, false)
      )
    )
    .orderBy(desc(profileVisits.visitedAt))
    .limit(limit)
    .offset(offset)

  return visits as ProfileVisitorWithUser[]
}

async function getVisitorCount(
  profileId: string,
  viewerId: string
): Promise<{
  total: number
  unique: number
  period: string
}> {
  const [viewer] = await db
    .select({
      subscriptionTier: users.subscriptionTier,
    })
    .from(users)
    .where(eq(users.id, viewerId))
    .limit(1)

  if (!viewer) {
    throw ApiError.notFound('Kullanıcı bulunamadı.', 'USER_NOT_FOUND')
  }

  const tier = viewer.subscriptionTier || 'FREE'
  const features = PROFILE_VISIT_FEATURES[tier]

  if (!features || !features.canSeeVisitors) {
    throw ApiError.forbidden(
      'Profil ziyaretçi sayısını görmek için Plus veya Premium üyelik gereklidir.',
      'UPGRADE_REQUIRED'
    )
  }

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - features.visitHistoryDays)

  const totalVisits = await db
    .select()
    .from(profileVisits)
    .where(
      and(
        eq(profileVisits.profileId, profileId),
        gte(profileVisits.visitedAt, cutoffDate),
        eq(profileVisits.isAnonymous, false)
      )
    )

  const uniqueVisitorIds = new Set(
    totalVisits
      .map((v) => v.visitorId)
      .filter((id): id is string => id !== null)
  )

  return {
    total: totalVisits.length,
    unique: uniqueVisitorIds.size,
    period: `${features.visitHistoryDays} days`,
  }
}

async function canVisitAnonymously(userId: string): Promise<boolean> {
  const [user] = await db
    .select({
      subscriptionTier: users.subscriptionTier,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    return false
  }

  const tier = user.subscriptionTier || 'FREE'
  const features = PROFILE_VISIT_FEATURES[tier]

  return features?.canVisitAnonymously || false
}

async function getFeatures(userId: string): Promise<ProfileVisitFeatures> {
  const [user] = await db
    .select({
      subscriptionTier: users.subscriptionTier,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    return PROFILE_VISIT_FEATURES['FREE']
  }

  const tier = user.subscriptionTier || 'FREE'
  const features = PROFILE_VISIT_FEATURES[tier]
  return features ? features : PROFILE_VISIT_FEATURES['FREE']
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const profileVisitService = {
  trackVisit,
  getVisitors,
  getVisitorCount,
  canVisitAnonymously,
  getFeatures,
}

export type {
  ProfileVisit,
  ProfileVisitSource,
  ProfileVisitFeatures,
  ProfileVisitorWithUser,
}
