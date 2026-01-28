// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - PUSH NOTIFICATION SERVICE
// Expo Push Notifications - Simple HTTP-based push for React Native + Expo
// ══════════════════════════════════════════════════════════════════════════════

import { db, sql } from '@voxpoll/database'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'
const EXPO_RECEIPTS_URL = 'https://exp.host/--/api/v2/push/getReceipts'
const MAX_BATCH_SIZE = 100 // Expo's limit per request

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PushNotification {
  title: string
  body: string
  subtitle?: string
  imageUrl?: string
  data?: Record<string, unknown>
  sound?: 'default' | null
  badge?: number
  channelId?: string // Android notification channel
  categoryId?: string // iOS notification category
  priority?: 'default' | 'normal' | 'high'
  ttl?: number // Time to live in seconds
}

export interface PushTarget {
  token?: string // Single Expo push token (ExponentPushToken[xxx])
  tokens?: string[] // Multiple Expo push tokens
}

export interface PushResult {
  success: boolean
  successCount: number
  failureCount: number
  failedTokens?: string[]
  tickets?: ExpoPushTicket[]
}

// Expo Push API types
interface ExpoPushMessage {
  to: string | string[]
  title?: string
  subtitle?: string
  body?: string
  data?: Record<string, unknown>
  sound?: 'default' | null
  badge?: number
  channelId?: string
  categoryId?: string
  priority?: 'default' | 'normal' | 'high'
  ttl?: number
}

interface ExpoPushTicket {
  status: 'ok' | 'error'
  id?: string // Receipt ID for successful sends
  message?: string
  details?: {
    error?: 'DeviceNotRegistered' | 'InvalidCredentials' | 'MessageTooBig' | 'MessageRateExceeded'
  }
}

interface ExpoPushReceipt {
  status: 'ok' | 'error'
  message?: string
  details?: {
    error?: 'DeviceNotRegistered' | 'InvalidCredentials' | 'MessageTooBig' | 'MessageRateExceeded'
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Validate Expo Push Token
// ─────────────────────────────────────────────────────────────────────────────

export function isValidExpoPushToken(token: string): boolean {
  return /^ExponentPushToken\[.+\]$/.test(token) || /^ExpoPushToken\[.+\]$/.test(token)
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Chunk array for batching
// ─────────────────────────────────────────────────────────────────────────────

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Mark Token as Invalid
// ─────────────────────────────────────────────────────────────────────────────

async function markTokenAsInvalid(token: string, reason: string): Promise<void> {
  try {
    await db.execute(sql`
      UPDATE push_tokens
      SET "isActive" = false,
          "failureCount" = 999,
          "lastFailureAt" = NOW(),
          "lastFailureReason" = ${reason},
          "updatedAt" = NOW()
      WHERE token = ${token}
    `)
  } catch (error) {
    console.error(`[Push] Failed to mark token as invalid: ${token}`, error)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Console Push Service (Development)
// ─────────────────────────────────────────────────────────────────────────────

class ConsolePushService {
  async send(notification: PushNotification, target: PushTarget): Promise<PushResult> {
    const tokenCount = target.token ? 1 : (target.tokens?.length || 0)
    console.log('[Push] Would send notification:', {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      targetCount: tokenCount,
    })
    return {
      success: true,
      successCount: tokenCount,
      failureCount: 0,
    }
  }

  async getReceipts(_ticketIds: string[]): Promise<Map<string, ExpoPushReceipt>> {
    console.log('[Push] Would check receipts for tickets')
    return new Map()
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Expo Push Service (Production)
// ─────────────────────────────────────────────────────────────────────────────

class ExpoPushService {
  private accessToken?: string

  constructor() {
    // Optional: Expo access token for higher rate limits
    this.accessToken = process.env['EXPO_ACCESS_TOKEN']
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    return headers
  }

  async send(notification: PushNotification, target: PushTarget): Promise<PushResult> {
    // Collect and validate tokens
    let tokens: string[] = []

    if (target.token) {
      tokens = [target.token]
    } else if (target.tokens) {
      tokens = target.tokens
    }

    // Filter valid Expo push tokens
    const validTokens = tokens.filter(isValidExpoPushToken)
    const invalidCount = tokens.length - validTokens.length

    if (invalidCount > 0) {
      console.warn(`[Push] Filtered out ${invalidCount} invalid Expo push tokens`)
    }

    if (validTokens.length === 0) {
      return {
        success: true,
        successCount: 0,
        failureCount: invalidCount,
        failedTokens: tokens.filter((t) => !isValidExpoPushToken(t)),
      }
    }

    try {
      // Build messages - batch if needed
      const allTickets: ExpoPushTicket[] = []
      const failedTokens: string[] = []
      let successCount = 0
      let failureCount = invalidCount

      // Chunk tokens for batch processing
      const tokenChunks = chunkArray(validTokens, MAX_BATCH_SIZE)

      for (const chunk of tokenChunks) {
        const messages: ExpoPushMessage[] = chunk.map((token) => ({
          to: token,
          title: notification.title,
          body: notification.body,
          subtitle: notification.subtitle,
          data: notification.data,
          sound: notification.sound ?? 'default',
          badge: notification.badge,
          channelId: notification.channelId,
          categoryId: notification.categoryId,
          priority: notification.priority ?? 'high',
          ttl: notification.ttl,
        }))

        const response = await fetch(EXPO_PUSH_URL, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(messages),
        })

        if (!response.ok) {
          console.error('[Push] Expo API error:', response.status, await response.text())
          failureCount += chunk.length
          failedTokens.push(...chunk)
          continue
        }

        const result = await response.json() as { data: ExpoPushTicket[] }
        const tickets = result.data

        // Process tickets
        tickets.forEach((ticket, index) => {
          allTickets.push(ticket)
          if (ticket.status === 'ok') {
            successCount++
          } else {
            failureCount++
            const token = chunk[index]
            if (token) {
              failedTokens.push(token)
            }

            // Handle specific errors
            if (ticket.details?.error === 'DeviceNotRegistered' && token) {
              console.log(`[Push] Token no longer valid: ${token}`)
              markTokenAsInvalid(token, 'DeviceNotRegistered')
            }
          }
        })
      }

      return {
        success: failureCount === 0,
        successCount,
        failureCount,
        failedTokens: failedTokens.length > 0 ? failedTokens : undefined,
        tickets: allTickets,
      }
    } catch (error) {
      console.error('[Push] Failed to send notification:', error)
      return {
        success: false,
        successCount: 0,
        failureCount: validTokens.length + invalidCount,
        failedTokens: tokens,
      }
    }
  }

  /**
   * Check delivery receipts for sent notifications
   * Call this after ~15 minutes to verify delivery
   */
  async getReceipts(ticketIds: string[]): Promise<Map<string, ExpoPushReceipt>> {
    const receipts = new Map<string, ExpoPushReceipt>()

    if (ticketIds.length === 0) {
      return receipts
    }

    try {
      // Chunk ticket IDs for batch processing
      const ticketChunks = chunkArray(ticketIds, MAX_BATCH_SIZE)

      for (const chunk of ticketChunks) {
        const response = await fetch(EXPO_RECEIPTS_URL, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ ids: chunk }),
        })

        if (!response.ok) {
          console.error('[Push] Failed to get receipts:', response.status)
          continue
        }

        const result = await response.json() as { data: Record<string, ExpoPushReceipt> }

        for (const [id, receipt] of Object.entries(result.data)) {
          receipts.set(id, receipt)

          // Log errors for debugging
          if (receipt.status === 'error') {
            console.warn(`[Push] Receipt error for ${id}:`, receipt.message)
          }
        }
      }
    } catch (error) {
      console.error('[Push] Failed to fetch receipts:', error)
    }

    return receipts
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Export Push Service
// ─────────────────────────────────────────────────────────────────────────────

const isProduction = process.env['NODE_ENV'] === 'production'

export const pushService = isProduction
  ? new ExpoPushService()
  : new ConsolePushService()

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Send notification to user
// ─────────────────────────────────────────────────────────────────────────────

export async function sendPushToUser(
  _userId: string,
  notification: PushNotification,
  tokens: string[]
): Promise<PushResult> {
  if (tokens.length === 0) {
    return { success: true, successCount: 0, failureCount: 0 }
  }

  return pushService.send(notification, { tokens })
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Send notification to multiple users
// ─────────────────────────────────────────────────────────────────────────────

export async function sendPushToUsers(
  notification: PushNotification,
  tokens: string[]
): Promise<PushResult> {
  if (tokens.length === 0) {
    return { success: true, successCount: 0, failureCount: 0 }
  }

  return pushService.send(notification, { tokens })
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Templates
// ─────────────────────────────────────────────────────────────────────────────

export const NOTIFICATION_TEMPLATES = {
  // Poll notifications
  newPoll: (creatorName: string, pollTitle: string) => ({
    title: `${creatorName} yeni bir anket oluşturdu`,
    body: pollTitle,
    data: { type: 'new_poll' },
  }),

  pollEnding: (pollTitle: string, timeLeft: string) => ({
    title: 'Anket bitiyor!',
    body: `"${pollTitle}" anketi ${timeLeft} içinde sona erecek`,
    data: { type: 'poll_ending' },
  }),

  pollResults: (pollTitle: string) => ({
    title: 'Anket sonuçları açıklandı',
    body: `"${pollTitle}" anketinin sonuçlarını gör`,
    data: { type: 'poll_results' },
  }),

  // Social notifications
  newFollower: (followerName: string) => ({
    title: 'Yeni takipçi',
    body: `${followerName} seni takip etmeye başladı`,
    data: { type: 'new_follower' },
  }),

  voteReceived: (voterName: string, pollTitle: string) => ({
    title: 'Yeni oy',
    body: `${voterName} "${pollTitle}" anketine oy verdi`,
    data: { type: 'vote_received' },
  }),

  // System notifications
  welcome: (userName: string) => ({
    title: `Hoş geldin, ${userName}!`,
    body: 'VoxPoll\'a katıldığın için teşekkürler. İlk anketini oluşturmaya hazır mısın?',
    data: { type: 'welcome' },
  }),

  weeklyDigest: (pollCount: number, voteCount: number) => ({
    title: 'Haftalık özet',
    body: `Bu hafta ${pollCount} anket ve ${voteCount} oy aldın`,
    data: { type: 'weekly_digest' },
  }),
}

// ─────────────────────────────────────────────────────────────────────────────
// Android Notification Channels
// ─────────────────────────────────────────────────────────────────────────────

export const NOTIFICATION_CHANNELS = {
  DEFAULT: 'default',
  POLLS: 'polls',
  SOCIAL: 'social',
  REMINDERS: 'reminders',
  SYSTEM: 'system',
}
