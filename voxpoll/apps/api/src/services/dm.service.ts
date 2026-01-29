// ═══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - DIRECT MESSAGE SERVICE
// Bible: 03-FEATURES, P-022
// Text-only DMs with tier limits and auto-delete
// ═══════════════════════════════════════════════════════════════════════════════

import { db, eq, and, or, desc, sql, ne } from '@voxpoll/database'
import { users, conversations, directMessages, blocks } from '@voxpoll/database'
import { ApiError } from '../middleware/error-handler'
import { ERROR_MESSAGES, ERROR_CODES } from '../constants/messages'
import { PAGINATION, TIER_QUOTAS } from '../constants/limits'
import { socialService } from './social.service'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ' | 'DELETED'

export interface ConversationPreview {
  id: string
  participant: {
    id: string
    username: string
    displayName: string
    avatarUrl: string | null
  }
  lastMessage: {
    content: string
    senderId: string
    createdAt: Date
  } | null
  unreadCount: number
  isArchived: boolean
  updatedAt: Date
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  status: MessageStatus
  deliveredAt: Date | null
  readAt: Date | null
  createdAt: Date
}

export interface SendMessageResult {
  message: Message
  conversationId: string
  isNewConversation: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DM_EXPIRY_DAYS = 365
const MAX_MESSAGE_LENGTH = 2000

// ─────────────────────────────────────────────────────────────────────────────
// DM Service Class
// ─────────────────────────────────────────────────────────────────────────────

class DMServiceClass {
  // ═══════════════════════════════════════════════════════════════════════════
  // SEND MESSAGE
  // ═══════════════════════════════════════════════════════════════════════════

  async sendMessage(
    senderId: string,
    recipientId: string,
    content: string,
    senderTier: string
  ): Promise<SendMessageResult> {
    if (senderId === recipientId) {
      throw ApiError.badRequest('Cannot send message to yourself', 'CANNOT_MESSAGE_SELF')
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      throw ApiError.badRequest(`Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters`, 'MESSAGE_TOO_LONG')
    }

    await this.checkDMPermission(senderId, senderTier)

    const isBlocked = await socialService.isBlockedBidirectional(senderId, recipientId)
    if (isBlocked) {
      throw ApiError.forbidden(ERROR_MESSAGES.USER_BLOCKED, ERROR_CODES.USER_BLOCKED)
    }

    const [recipient] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, recipientId), sql`${users.deletedAt} IS NULL`))
      .limit(1)

    if (!recipient) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND, ERROR_CODES.USER_NOT_FOUND)
    }

    let conversation = await this.findConversation(senderId, recipientId)
    let isNewConversation = false

    if (!conversation) {
      conversation = await this.createConversation(senderId, recipientId)
      isNewConversation = true
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + DM_EXPIRY_DAYS)

    const preview = content.length > 100 ? content.substring(0, 97) + '...' : content

    const [message] = await db.transaction(async (tx) => {
      const [msg] = await tx
        .insert(directMessages)
        .values({
          conversationId: conversation!.id,
          senderId,
          content,
          status: 'SENT',
          expiresAt,
        })
        .returning()

      const isParticipant1 = conversation!.participant1Id === senderId

      await tx
        .update(conversations)
        .set({
          lastMessageAt: new Date(),
          lastMessagePreview: preview,
          ...(isParticipant1
            ? { participant2UnreadCount: sql`${conversations.participant2UnreadCount} + 1` }
            : { participant1UnreadCount: sql`${conversations.participant1UnreadCount} + 1` }),
          updatedAt: new Date(),
        })
        .where(eq(conversations.id, conversation!.id))

      return [msg]
    })

    return {
      message: {
        id: message!.id,
        conversationId: message!.conversationId,
        senderId: message!.senderId,
        content: message!.content,
        status: message!.status as MessageStatus,
        deliveredAt: message!.deliveredAt,
        readAt: message!.readAt,
        createdAt: message!.createdAt,
      },
      conversationId: conversation.id,
      isNewConversation,
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONVERSATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  async getConversations(
    userId: string,
    page: number = 1,
    limit: number = PAGINATION.defaultLimit,
    includeArchived: boolean = false
  ): Promise<{ items: ConversationPreview[]; meta: { page: number; limit: number; total: number } }> {
    const offset = (page - 1) * limit

    const conditions = [
      or(eq(conversations.participant1Id, userId), eq(conversations.participant2Id, userId)),
      eq(conversations.status, 'ACTIVE'),
    ]

    if (!includeArchived) {
      conditions.push(
        or(
          and(eq(conversations.participant1Id, userId), sql`${conversations.participant1ArchivedAt} IS NULL`),
          and(eq(conversations.participant2Id, userId), sql`${conversations.participant2ArchivedAt} IS NULL`)
        )
      )
    }

    conditions.push(
      or(
        and(eq(conversations.participant1Id, userId), sql`${conversations.participant1DeletedAt} IS NULL`),
        and(eq(conversations.participant2Id, userId), sql`${conversations.participant2DeletedAt} IS NULL`)
      )
    )

    const convs = await db
      .select()
      .from(conversations)
      .where(and(...conditions))
      .orderBy(desc(conversations.lastMessageAt))
      .limit(limit)
      .offset(offset)

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(conversations)
      .where(and(...conditions))

    const participantIds = convs.map((c) =>
      c.participant1Id === userId ? c.participant2Id : c.participant1Id
    )

    const participantDetails = participantIds.length > 0
      ? await db
          .select({
            id: users.id,
            username: users.username,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
          })
          .from(users)
          .where(sql`${users.id} IN (${sql.join(participantIds.map(id => sql`${id}`), sql`, `)})`)
      : []

    const participantMap = new Map(participantDetails.map((p) => [p.id, p]))

    const items: ConversationPreview[] = convs.map((conv) => {
      const isParticipant1 = conv.participant1Id === userId
      const otherParticipantId = isParticipant1 ? conv.participant2Id : conv.participant1Id
      const participant = participantMap.get(otherParticipantId)

      return {
        id: conv.id,
        participant: {
          id: otherParticipantId,
          username: participant?.username || '',
          displayName: participant?.displayName || '',
          avatarUrl: participant?.avatarUrl || null,
        },
        lastMessage: conv.lastMessagePreview
          ? {
              content: conv.lastMessagePreview,
              senderId: '',
              createdAt: conv.lastMessageAt || conv.updatedAt,
            }
          : null,
        unreadCount: isParticipant1 ? conv.participant1UnreadCount : conv.participant2UnreadCount,
        isArchived: isParticipant1
          ? conv.participant1ArchivedAt !== null
          : conv.participant2ArchivedAt !== null,
        updatedAt: conv.updatedAt,
      }
    })

    return {
      items,
      meta: {
        page,
        limit,
        total: countResult?.count || 0,
      },
    }
  }

  async getMessages(
    userId: string,
    conversationId: string,
    page: number = 1,
    limit: number = PAGINATION.defaultLimit
  ): Promise<{ items: Message[]; meta: { page: number; limit: number; total: number } }> {
    const conversation = await this.getConversationForUser(conversationId, userId)
    if (!conversation) {
      throw ApiError.notFound('Conversation not found', 'CONVERSATION_NOT_FOUND')
    }

    const offset = (page - 1) * limit
    const isParticipant1 = conversation.participant1Id === userId

    const messages = await db
      .select()
      .from(directMessages)
      .where(
        and(
          eq(directMessages.conversationId, conversationId),
          ne(directMessages.status, 'DELETED'),
          isParticipant1
            ? sql`${directMessages.senderDeletedAt} IS NULL OR ${directMessages.senderId} != ${userId}`
            : sql`${directMessages.recipientDeletedAt} IS NULL OR ${directMessages.senderId} = ${userId}`
        )
      )
      .orderBy(desc(directMessages.createdAt))
      .limit(limit)
      .offset(offset)

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(directMessages)
      .where(
        and(
          eq(directMessages.conversationId, conversationId),
          ne(directMessages.status, 'DELETED')
        )
      )

    return {
      items: messages.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        content: m.content,
        status: m.status as MessageStatus,
        deliveredAt: m.deliveredAt,
        readAt: m.readAt,
        createdAt: m.createdAt,
      })),
      meta: {
        page,
        limit,
        total: countResult?.count || 0,
      },
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // READ RECEIPTS
  // ═══════════════════════════════════════════════════════════════════════════

  async markAsRead(userId: string, conversationId: string): Promise<void> {
    const conversation = await this.getConversationForUser(conversationId, userId)
    if (!conversation) {
      throw ApiError.notFound('Conversation not found', 'CONVERSATION_NOT_FOUND')
    }

    const isParticipant1 = conversation.participant1Id === userId
    const now = new Date()

    await db.transaction(async (tx) => {
      await tx
        .update(directMessages)
        .set({
          status: 'READ',
          readAt: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(directMessages.conversationId, conversationId),
            ne(directMessages.senderId, userId),
            ne(directMessages.status, 'READ'),
            ne(directMessages.status, 'DELETED')
          )
        )

      await tx
        .update(conversations)
        .set({
          ...(isParticipant1
            ? { participant1LastReadAt: now, participant1UnreadCount: 0 }
            : { participant2LastReadAt: now, participant2UnreadCount: 0 }),
          updatedAt: now,
        })
        .where(eq(conversations.id, conversationId))
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ARCHIVE / DELETE
  // ═══════════════════════════════════════════════════════════════════════════

  async archiveConversation(userId: string, conversationId: string): Promise<void> {
    const conversation = await this.getConversationForUser(conversationId, userId)
    if (!conversation) {
      throw ApiError.notFound('Conversation not found', 'CONVERSATION_NOT_FOUND')
    }

    const isParticipant1 = conversation.participant1Id === userId
    const now = new Date()

    await db
      .update(conversations)
      .set({
        ...(isParticipant1
          ? { participant1ArchivedAt: now }
          : { participant2ArchivedAt: now }),
        updatedAt: now,
      })
      .where(eq(conversations.id, conversationId))
  }

  async unarchiveConversation(userId: string, conversationId: string): Promise<void> {
    const conversation = await this.getConversationForUser(conversationId, userId)
    if (!conversation) {
      throw ApiError.notFound('Conversation not found', 'CONVERSATION_NOT_FOUND')
    }

    const isParticipant1 = conversation.participant1Id === userId

    await db
      .update(conversations)
      .set({
        ...(isParticipant1
          ? { participant1ArchivedAt: null }
          : { participant2ArchivedAt: null }),
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId))
  }

  async deleteConversation(userId: string, conversationId: string): Promise<void> {
    const conversation = await this.getConversationForUser(conversationId, userId)
    if (!conversation) {
      throw ApiError.notFound('Conversation not found', 'CONVERSATION_NOT_FOUND')
    }

    const isParticipant1 = conversation.participant1Id === userId
    const now = new Date()

    await db
      .update(conversations)
      .set({
        ...(isParticipant1
          ? { participant1DeletedAt: now }
          : { participant2DeletedAt: now }),
        updatedAt: now,
      })
      .where(eq(conversations.id, conversationId))

    const refreshedConv = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1)

    if (
      refreshedConv[0] &&
      refreshedConv[0].participant1DeletedAt &&
      refreshedConv[0].participant2DeletedAt
    ) {
      await db
        .update(conversations)
        .set({ status: 'DELETED', updatedAt: now })
        .where(eq(conversations.id, conversationId))
    }
  }

  async deleteMessage(userId: string, messageId: string): Promise<void> {
    const [message] = await db
      .select()
      .from(directMessages)
      .where(eq(directMessages.id, messageId))
      .limit(1)

    if (!message) {
      throw ApiError.notFound('Message not found', 'MESSAGE_NOT_FOUND')
    }

    const conversation = await this.getConversationForUser(message.conversationId, userId)
    if (!conversation) {
      throw ApiError.notFound('Conversation not found', 'CONVERSATION_NOT_FOUND')
    }

    const now = new Date()

    if (message.senderId === userId) {
      await db
        .update(directMessages)
        .set({ senderDeletedAt: now, updatedAt: now })
        .where(eq(directMessages.id, messageId))
    } else {
      await db
        .update(directMessages)
        .set({ recipientDeletedAt: now, updatedAt: now })
        .where(eq(directMessages.id, messageId))
    }

    const refreshedMsg = await db
      .select()
      .from(directMessages)
      .where(eq(directMessages.id, messageId))
      .limit(1)

    if (
      refreshedMsg[0] &&
      refreshedMsg[0].senderDeletedAt &&
      refreshedMsg[0].recipientDeletedAt
    ) {
      await db
        .update(directMessages)
        .set({ status: 'DELETED', updatedAt: now })
        .where(eq(directMessages.id, messageId))
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DAILY COUNT FOR RATE LIMITING
  // ═══════════════════════════════════════════════════════════════════════════

  async getDailyMessageCount(userId: string): Promise<number> {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(directMessages)
      .where(
        and(
          eq(directMessages.senderId, userId),
          sql`${directMessages.createdAt} >= ${startOfDay}`
        )
      )

    return result?.count || 0
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEANUP EXPIRED MESSAGES
  // ═══════════════════════════════════════════════════════════════════════════

  async cleanupExpiredMessages(): Promise<number> {
    const now = new Date()

    const expiredMessages = await db
      .select({ id: directMessages.id })
      .from(directMessages)
      .where(
        and(
          sql`${directMessages.expiresAt} IS NOT NULL`,
          sql`${directMessages.expiresAt} < ${now}`
        )
      )

    if (expiredMessages.length === 0) {
      return 0
    }

    const ids = expiredMessages.map((m) => m.id)

    await db
      .delete(directMessages)
      .where(sql`${directMessages.id} IN (${sql.join(ids.map(id => sql`${id}`), sql`, `)})`)

    return ids.length
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  private async findConversation(userId1: string, userId2: string) {
    const [conv] = await db
      .select()
      .from(conversations)
      .where(
        or(
          and(eq(conversations.participant1Id, userId1), eq(conversations.participant2Id, userId2)),
          and(eq(conversations.participant1Id, userId2), eq(conversations.participant2Id, userId1))
        )
      )
      .limit(1)

    return conv || null
  }

  private async createConversation(userId1: string, userId2: string) {
    const [p1, p2] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1]

    const [conv] = await db
      .insert(conversations)
      .values({
        participant1Id: p1,
        participant2Id: p2,
        status: 'ACTIVE',
      })
      .returning()

    return conv!
  }

  private async getConversationForUser(conversationId: string, userId: string) {
    const [conv] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          or(eq(conversations.participant1Id, userId), eq(conversations.participant2Id, userId))
        )
      )
      .limit(1)

    return conv || null
  }

  private async checkDMPermission(userId: string, tier: string): Promise<void> {
    const tierUpper = tier.toUpperCase() as keyof typeof TIER_QUOTAS
    const quota = TIER_QUOTAS[tierUpper] || TIER_QUOTAS.FREE

    if (quota.dmsPerDay === 0) {
      throw ApiError.forbidden('Direct messages are not available on your plan', 'DM_NOT_AVAILABLE')
    }

    if (quota.dmsPerDay > 0) {
      const dailyCount = await this.getDailyMessageCount(userId)
      if (dailyCount >= quota.dmsPerDay) {
        throw ApiError.forbidden('Daily message limit reached', 'DM_LIMIT_REACHED')
      }
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    const convs = await db
      .select({
        participant1Id: conversations.participant1Id,
        participant1UnreadCount: conversations.participant1UnreadCount,
        participant2UnreadCount: conversations.participant2UnreadCount,
      })
      .from(conversations)
      .where(
        and(
          or(eq(conversations.participant1Id, userId), eq(conversations.participant2Id, userId)),
          eq(conversations.status, 'ACTIVE')
        )
      )

    return convs.reduce((total, conv) => {
      const isParticipant1 = conv.participant1Id === userId
      return total + (isParticipant1 ? conv.participant1UnreadCount : conv.participant2UnreadCount)
    }, 0)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export const dmService = new DMServiceClass()
