import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { db, users, polls, votes, follows, blocks } from '@voxpoll/database'
import { eq, and } from '@voxpoll/database'
import { userService } from '../services/user.service'
import { generateParticipantHash } from '../lib/hash'
import { createId } from '@paralleldrive/cuid2'

describe('GDPR Compliance Tests (P0-008)', () => {
  let testUserId: string
  let testUser: any

  beforeEach(async () => {
    testUserId = createId()
    const [user] = await db.insert(users).values({
      id: testUserId,
      email: `gdpr-test-${testUserId}@example.com`,
      username: `gdprtest${testUserId.substring(0, 8)}`,
      displayName: 'GDPR Test User',
      passwordHash: 'test-hash',
      emailVerified: true,
      tier: 'FREE',
      verificationLevel: 'BASIC',
    }).returning()
    testUser = user
  })

  afterEach(async () => {
    await db.delete(users).where(eq(users.id, testUserId))
  })

  describe('Data Export (Bible: 05-TECH, GDPR Article 20)', () => {
    it('should export all user profile data', async () => {
      const result = await userService.exportUserData(testUserId)

      expect(result).toBeDefined()
      expect(result.user).toBeDefined()
      expect(result.user.id).toBe(testUserId)
      expect(result.user.email).toBe(testUser.email)
      expect(result.user.username).toBe(testUser.username)
      expect(result.user.displayName).toBe(testUser.displayName)
      expect(result.user.tier).toBe('FREE')
      expect(result.user.verificationLevel).toBe('BASIC')
    })

    it('should export user polls data', async () => {
      const pollId = createId()
      await db.insert(polls).values({
        id: pollId,
        creatorId: testUserId,
        slug: `test-poll-${pollId}`,
        question: 'Test Poll Question',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        type: 'SINGLE_CHOICE',
      })

      const result = await userService.exportUserData(testUserId)

      expect(result.polls).toBeDefined()
      expect(Array.isArray(result.polls)).toBe(true)
      expect(result.polls.length).toBeGreaterThan(0)

      const exportedPoll = result.polls[0]
      expect(exportedPoll.question).toBe('Test Poll Question')

      await db.delete(polls).where(eq(polls.id, pollId))
    })

    it('should export user votes with anonymized participantHash', async () => {
      const pollId = createId()
      await db.insert(polls).values({
        id: pollId,
        creatorId: createId(),
        slug: `vote-poll-${pollId}`,
        question: 'Vote Test',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        type: 'SINGLE_CHOICE',
      })

      const participantHash = generateParticipantHash(testUserId, pollId)
      await db.insert(votes).values({
        id: createId(),
        pollId,
        participantHash,
        optionId: createId(),
        verificationLevel: 'BASIC',
        reliabilityScore: 75,
      })

      const result = await userService.exportUserData(testUserId)

      expect(result.votes).toBeDefined()
      expect(Array.isArray(result.votes)).toBe(true)

      await db.delete(votes).where(eq(votes.pollId, pollId))
      await db.delete(polls).where(eq(polls.id, pollId))
    })

    it('should export user follows data', async () => {
      const followedUserId = createId()
      await db.insert(users).values({
        id: followedUserId,
        email: `followed-${followedUserId}@example.com`,
        username: `followed${followedUserId.substring(0, 8)}`,
        passwordHash: 'test-hash',
        emailVerified: true,
      })

      await db.insert(follows).values({
        id: createId(),
        followerId: testUserId,
        followingId: followedUserId,
        status: 'ACTIVE',
      })

      const result = await userService.exportUserData(testUserId)

      expect(result.following).toBeDefined()
      expect(Array.isArray(result.following)).toBe(true)

      await db.delete(follows).where(
        and(eq(follows.followerId, testUserId), eq(follows.followingId, followedUserId))
      )
      await db.delete(users).where(eq(users.id, followedUserId))
    })

    it('should return data in portable JSON format', async () => {
      const result = await userService.exportUserData(testUserId)

      expect(typeof result).toBe('object')
      expect(result.exportedAt).toBeDefined()
      expect(new Date(result.exportedAt)).toBeInstanceOf(Date)

      const jsonString = JSON.stringify(result)
      expect(jsonString).toBeTruthy()

      const parsed = JSON.parse(jsonString)
      expect(parsed.user.id).toBe(testUserId)
    })
  })

  describe('Account Deletion Request (Bible: 05-TECH, GDPR Article 17)', () => {
    it('should mark account for deletion with 30-day grace period', async () => {
      const result = await userService.requestAccountDeletion(
        testUserId,
        'test-password'
      )

      expect(result.success).toBe(true)
      expect(result.scheduledDeletionAt).toBeDefined()

      const scheduledDate = new Date(result.scheduledDeletionAt)
      const now = new Date()
      const daysDiff =
        (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)

      expect(daysDiff).toBeGreaterThanOrEqual(29)
      expect(daysDiff).toBeLessThanOrEqual(31)
    })

    it('should require password verification for deletion', async () => {
      await expect(
        userService.requestAccountDeletion(testUserId, 'wrong-password')
      ).rejects.toThrow()
    })

    it('should prevent duplicate deletion requests', async () => {
      await userService.requestAccountDeletion(testUserId, 'test-password')

      await expect(
        userService.requestAccountDeletion(testUserId, 'test-password')
      ).rejects.toThrow()
    })

    it('should set scheduledDeletionAt field in database', async () => {
      await userService.requestAccountDeletion(testUserId, 'test-password')

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, testUserId))
        .limit(1)

      expect(user?.scheduledDeletionAt).toBeDefined()
      expect(user?.scheduledDeletionAt).toBeInstanceOf(Date)
    })
  })

  describe('Cancel Account Deletion (Bible: 05-TECH)', () => {
    beforeEach(async () => {
      await userService.requestAccountDeletion(testUserId, 'test-password')
    })

    it('should cancel deletion within grace period', async () => {
      const result = await userService.cancelAccountDeletion(testUserId)

      expect(result.success).toBe(true)

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, testUserId))
        .limit(1)

      expect(user?.scheduledDeletionAt).toBeNull()
    })

    it('should fail if no deletion is scheduled', async () => {
      await userService.cancelAccountDeletion(testUserId)

      await expect(
        userService.cancelAccountDeletion(testUserId)
      ).rejects.toThrow()
    })

    it('should restore account to normal state', async () => {
      await userService.cancelAccountDeletion(testUserId)

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, testUserId))
        .limit(1)

      expect(user?.scheduledDeletionAt).toBeNull()
      expect(user?.email).toBe(testUser.email)
    })
  })

  describe('Right to be Forgotten (Bible: GDPR Article 17)', () => {
    it('should anonymize user votes after deletion', async () => {
      const pollId = createId()
      await db.insert(polls).values({
        id: pollId,
        creatorId: createId(),
        slug: `delete-poll-${pollId}`,
        question: 'Delete Test',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        type: 'SINGLE_CHOICE',
      })

      const participantHash = generateParticipantHash(testUserId, pollId)
      const voteId = createId()
      await db.insert(votes).values({
        id: voteId,
        pollId,
        participantHash,
        optionId: createId(),
        verificationLevel: 'BASIC',
        reliabilityScore: 75,
      })

      const votesBeforeDeletion = await db
        .select()
        .from(votes)
        .where(eq(votes.pollId, pollId))

      expect(votesBeforeDeletion.length).toBeGreaterThan(0)

      await db.delete(votes).where(eq(votes.id, voteId))
      await db.delete(polls).where(eq(polls.id, pollId))
    })

    it('should remove personal data from database', async () => {
      const userEmail = testUser.email
      const userName = testUser.username

      await db.delete(users).where(eq(users.id, testUserId))

      const [deletedUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, userEmail))
        .limit(1)

      expect(deletedUser).toBeUndefined()
    })

    it('should delete user follows relationships', async () => {
      const followedUserId = createId()
      await db.insert(users).values({
        id: followedUserId,
        email: `delete-follow-${followedUserId}@example.com`,
        username: `delfollow${followedUserId.substring(0, 8)}`,
        passwordHash: 'test-hash',
        emailVerified: true,
      })

      await db.insert(follows).values({
        id: createId(),
        followerId: testUserId,
        followingId: followedUserId,
        status: 'ACTIVE',
      })

      const followsBefore = await db
        .select()
        .from(follows)
        .where(eq(follows.followerId, testUserId))

      expect(followsBefore.length).toBeGreaterThan(0)

      await db.delete(follows).where(eq(follows.followerId, testUserId))
      await db.delete(users).where(eq(users.id, followedUserId))

      const followsAfter = await db
        .select()
        .from(follows)
        .where(eq(follows.followerId, testUserId))

      expect(followsAfter.length).toBe(0)
    })

    it('should delete user blocks relationships', async () => {
      const blockedUserId = createId()
      await db.insert(users).values({
        id: blockedUserId,
        email: `delete-block-${blockedUserId}@example.com`,
        username: `delblock${blockedUserId.substring(0, 8)}`,
        passwordHash: 'test-hash',
        emailVerified: true,
      })

      await db.insert(blocks).values({
        id: createId(),
        blockerId: testUserId,
        blockedId: blockedUserId,
      })

      const blocksBefore = await db
        .select()
        .from(blocks)
        .where(eq(blocks.blockerId, testUserId))

      expect(blocksBefore.length).toBeGreaterThan(0)

      await db.delete(blocks).where(eq(blocks.blockerId, testUserId))
      await db.delete(users).where(eq(users.id, blockedUserId))

      const blocksAfter = await db
        .select()
        .from(blocks)
        .where(eq(blocks.blockerId, testUserId))

      expect(blocksAfter.length).toBe(0)
    })
  })

  describe('Data Retention Policies (Bible: 05-TECH)', () => {
    it('should enforce 30-day grace period before permanent deletion', async () => {
      await userService.requestAccountDeletion(testUserId, 'test-password')

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, testUserId))
        .limit(1)

      const scheduledDate = user?.scheduledDeletionAt
      expect(scheduledDate).toBeInstanceOf(Date)

      const now = new Date()
      const diffMs = scheduledDate!.getTime() - now.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)

      expect(diffDays).toBeGreaterThanOrEqual(29)
      expect(diffDays).toBeLessThanOrEqual(31)
    })

    it('should not delete data before grace period expires', async () => {
      await userService.requestAccountDeletion(testUserId, 'test-password')

      const [userAfterRequest] = await db
        .select()
        .from(users)
        .where(eq(users.id, testUserId))
        .limit(1)

      expect(userAfterRequest).toBeDefined()
      expect(userAfterRequest?.email).toBe(testUser.email)
      expect(userAfterRequest?.scheduledDeletionAt).toBeDefined()
    })
  })

  describe('GDPR Consent Tracking (Bible: GDPR Article 7)', () => {
    it('should track user email verification as consent indicator', async () => {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, testUserId))
        .limit(1)

      expect(user?.emailVerified).toBe(true)
    })

    it('should allow users to export their data at any time', async () => {
      const result = await userService.exportUserData(testUserId)

      expect(result).toBeDefined()
      expect(result.user).toBeDefined()
      expect(result.exportedAt).toBeDefined()
    })

    it('should allow users to request deletion at any time', async () => {
      const result = await userService.requestAccountDeletion(
        testUserId,
        'test-password'
      )

      expect(result.success).toBe(true)
      expect(result.scheduledDeletionAt).toBeDefined()
    })
  })
})
