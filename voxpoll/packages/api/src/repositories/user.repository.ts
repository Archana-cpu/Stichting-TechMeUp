// ════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - USER REPOSITORY
// ════════════════════════════════════════════════════════════════════════════

import { db, eq, and, or, ilike, sql } from "@voxpoll/database"
import { users, accounts, follows, blocks } from "@voxpoll/database"
import type { InferSelectModel, InferInsertModel } from "drizzle-orm"

type User = InferSelectModel<typeof users>
type UserInsert = InferInsertModel<typeof users>

// ────────────────────────────────────────────────────────────────────────────
// User Repository
// ────────────────────────────────────────────────────────────────────────────

class UserRepositoryClass {
  // ────────────────────────────────────────────────────────────────────────────
  // Basic CRUD
  // ────────────────────────────────────────────────────────────────────────────

  async findById(id: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1)
    return result[0] ?? null
  }

  async create(data: {
    email: string
    username: string
    displayName: string
    passwordHash: string
    status: User["status"]
  }): Promise<User> {
    const result = await db.insert(users).values({
      email: data.email.toLowerCase(),
      username: data.username.toLowerCase(),
      displayName: data.displayName,
      passwordHash: data.passwordHash,
      status: data.status
    }).returning()
    if (!result[0]) throw new Error('Failed to create user')
    return result[0]
  }

  async update(id: string, data: Partial<UserInsert>): Promise<User | null> {
    const result = await db.update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
    return result[0] ?? null
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Find by Email
  // ────────────────────────────────────────────────────────────────────────────

  async findByEmail(email: string): Promise<User | null> {
    const result = await db.select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)
    return result[0] ?? null
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Find by Username
  // ────────────────────────────────────────────────────────────────────────────

  async findByUsername(username: string): Promise<User | null> {
    const result = await db.select()
      .from(users)
      .where(eq(users.username, username.toLowerCase()))
      .limit(1)
    return result[0] ?? null
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Find with OAuth Accounts
  // ────────────────────────────────────────────────────────────────────────────

  async findWithOAuthAccounts(id: string) {
    const result = await db.select({
      user: users,
      accounts: accounts
    })
    .from(users)
    .leftJoin(accounts, eq(users.id, accounts.userId))
    .where(eq(users.id, id))

    const first = result[0]
    if (!first) return null

    const user = first.user
    const userAccounts = result
      .filter(r => r.accounts)
      .map(r => ({ provider: r.accounts!.provider }))

    return { ...user, accounts: userAccounts }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Find Public Profile
  // ────────────────────────────────────────────────────────────────────────────

  async findPublicProfile(username: string) {
    const result = await db.select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
      website: users.website,
      location: users.location,
      verificationLevel: users.verificationLevel,
      createdAt: users.createdAt
    })
    .from(users)
    .where(eq(users.username, username.toLowerCase()))
    .limit(1)

    const user = result[0]
    if (!user) return null

    const [followersCount, followingCount, pollsCount] = await Promise.all([
      this.getFollowersCount(user.id),
      this.getFollowingCount(user.id),
      db.select({ count: sql<number>`count(*)::int` })
        .from(sql`polls`)
        .where(sql`"creatorId" = ${user.id}`)
        .then(r => r[0]?.count ?? 0)
    ])

    return {
      ...user,
      _count: {
        polls: pollsCount,
        followers: followersCount,
        following: followingCount
      }
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Get Followers Count
  // ────────────────────────────────────────────────────────────────────────────

  async getFollowersCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` })
      .from(follows)
      .where(and(
        eq(follows.followingId, userId),
        eq(follows.status, "ACTIVE")
      ))
    return result[0]?.count ?? 0
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Get Following Count
  // ────────────────────────────────────────────────────────────────────────────

  async getFollowingCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` })
      .from(follows)
      .where(and(
        eq(follows.followerId, userId),
        eq(follows.status, "ACTIVE")
      ))
    return result[0]?.count ?? 0
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Check if Following
  // ────────────────────────────────────────────────────────────────────────────

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const result = await db.select({ status: follows.status })
      .from(follows)
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      ))
      .limit(1)
    return result[0]?.status === "ACTIVE"
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Check if Blocked
  // ────────────────────────────────────────────────────────────────────────────

  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const result = await db.select({ id: blocks.id })
      .from(blocks)
      .where(and(
        eq(blocks.blockerId, blockerId),
        eq(blocks.blockedId, blockedId)
      ))
      .limit(1)
    return result.length > 0
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Search Users
  // ────────────────────────────────────────────────────────────────────────────

  async search(query: string, limit: number = 20) {
    return db.select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      verificationLevel: users.verificationLevel
    })
    .from(users)
    .where(and(
      eq(users.status, "ACTIVE"),
      or(
        ilike(users.username, `%${query}%`),
        ilike(users.displayName, `%${query}%`)
      )
    ))
    .limit(limit)
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Update Last Active
  // ────────────────────────────────────────────────────────────────────────────

  async updateLastActive(userId: string): Promise<void> {
    await db.update(users)
      .set({ lastActiveAt: new Date() })
      .where(eq(users.id, userId))
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Verify Email
  // ────────────────────────────────────────────────────────────────────────────

  async verifyEmail(userId: string): Promise<User | null> {
    const result = await db.update(users)
      .set({
        emailVerified: true,
        emailVerifiedAt: new Date(),
        status: "ACTIVE",
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning()
    return result[0] ?? null
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Update Password
  // ────────────────────────────────────────────────────────────────────────────

  async updatePassword(userId: string, passwordHash: string): Promise<User | null> {
    const result = await db.update(users)
      .set({
        passwordHash,
        passwordChangedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning()
    return result[0] ?? null
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Get OAuth Providers
  // ────────────────────────────────────────────────────────────────────────────

  async getOAuthProviders(userId: string): Promise<string[]> {
    const result = await db.select({ provider: accounts.provider })
      .from(accounts)
      .where(eq(accounts.userId, userId))
    return result.map(a => a.provider)
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Exports
// ────────────────────────────────────────────────────────────────────────────

const userRepository = new UserRepositoryClass()

export { userRepository, UserRepositoryClass as UserRepository }
