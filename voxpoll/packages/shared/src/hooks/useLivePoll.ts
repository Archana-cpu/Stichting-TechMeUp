/**
 * @voxpoll/shared - Live Poll WebSocket Hook
 * React hook for connecting to live poll sessions
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  LivePollStatus,
  WSClientMessage,
  WSServerMessage,
  HostActionType,
} from '../types/index.js'

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface LivePollOption {
  id: string
  text: string
  imageUrl?: string
}

export interface LivePollState {
  // Connection state
  isConnected: boolean
  isConnecting: boolean
  error: string | null

  // Session state
  sessionCode: string | null
  participantId: string | null
  isHost: boolean
  status: LivePollStatus

  // Poll data
  question: string
  options: LivePollOption[]
  results: Record<string, number>
  totalVotes: number
  participantCount: number
  spectatorCount: number

  // User state
  hasVoted: boolean
  votedOptionId: string | null
}

export interface UseLivePollOptions {
  wsUrl: string
  sessionCode: string
  isHost?: boolean
  participantId?: string
  onVoteUpdate?: (results: Record<string, number>, totalVotes: number) => void
  onSessionEnded?: (finalResults: Record<string, number>) => void
  onError?: (error: string) => void
  autoReconnect?: boolean
  reconnectAttempts?: number
  reconnectDelay?: number
}

export interface UseLivePollReturn extends LivePollState {
  // Actions
  connect: () => void
  disconnect: () => void
  vote: (optionId: string) => void
  hostAction: (action: HostActionType) => void
}

// ═══════════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════════

const PING_INTERVAL = 25000 // 25 seconds
const RECONNECT_DELAY = 1000 // 1 second
const MAX_RECONNECT_ATTEMPTS = 5

// ═══════════════════════════════════════════════════════════════════════════════
// Hook Implementation
// ═══════════════════════════════════════════════════════════════════════════════

export function useLivePoll(options: UseLivePollOptions): UseLivePollReturn {
  const {
    wsUrl,
    sessionCode,
    isHost = false,
    participantId: initialParticipantId,
    onVoteUpdate,
    onSessionEnded,
    onError,
    autoReconnect = true,
    reconnectAttempts = MAX_RECONNECT_ATTEMPTS,
    reconnectDelay = RECONNECT_DELAY,
  } = options

  // State
  const [state, setState] = useState<LivePollState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    sessionCode: null,
    participantId: initialParticipantId || null,
    isHost,
    status: 'WAITING',
    question: '',
    options: [],
    results: {},
    totalVotes: 0,
    participantCount: 0,
    spectatorCount: 0,
    hasVoted: false,
    votedOptionId: null,
  })

  // Refs
  const wsRef = useRef<WebSocket | null>(null)
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const reconnectCountRef = useRef(0)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─────────────────────────────────────────────────────────────────────────────
  // Send message helper
  // ─────────────────────────────────────────────────────────────────────────────

  const sendMessage = useCallback((message: WSClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  // ─────────────────────────────────────────────────────────────────────────────
  // Handle incoming messages
  // ─────────────────────────────────────────────────────────────────────────────

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data) as WSServerMessage

      switch (message.type) {
        case 'JOINED':
          setState((prev) => ({
            ...prev,
            isConnected: true,
            isConnecting: false,
            error: null,
            sessionCode: message.payload.sessionCode,
            participantId: message.payload.participantId,
            isHost: message.payload.isHost,
            status: message.payload.status,
            question: message.payload.question,
            options: message.payload.options,
            participantCount: message.payload.participantCount,
            results: message.payload.results || {},
          }))
          reconnectCountRef.current = 0
          break

        case 'VOTE_CONFIRMED':
          setState((prev) => ({
            ...prev,
            hasVoted: true,
            votedOptionId: message.payload.optionId,
          }))
          break

        case 'VOTE_UPDATE':
          setState((prev) => ({
            ...prev,
            results: message.payload.results,
            totalVotes: message.payload.totalVotes,
          }))
          onVoteUpdate?.(message.payload.results, message.payload.totalVotes)
          break

        case 'PARTICIPANT_COUNT':
          setState((prev) => ({
            ...prev,
            participantCount: message.payload.count,
            spectatorCount: message.payload.spectatorCount || 0,
          }))
          break

        case 'SESSION_STATUS':
          setState((prev) => ({
            ...prev,
            status: message.payload.status,
          }))
          break

        case 'HOST_DISCONNECTED':
          // Host disconnected - session may continue in orphan mode
          break

        case 'SESSION_ENDED':
          setState((prev) => ({
            ...prev,
            status: 'ENDED',
            results: message.payload.finalResults,
            totalVotes: message.payload.totalVotes,
            participantCount: message.payload.totalParticipants,
          }))
          onSessionEnded?.(message.payload.finalResults)
          break

        case 'ERROR':
          const errorMsg = message.payload.message
          setState((prev) => ({ ...prev, error: errorMsg }))
          onError?.(errorMsg)
          break

        case 'PONG':
          // Heartbeat response - connection is alive
          break
      }
    } catch (err) {
      console.error('[LivePoll] Failed to parse message:', err)
    }
  }, [onVoteUpdate, onSessionEnded, onError])

  // ─────────────────────────────────────────────────────────────────────────────
  // Connect to WebSocket
  // ─────────────────────────────────────────────────────────────────────────────

  const connect = useCallback(() => {
    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close()
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }))

    const url = `${wsUrl}?session=${sessionCode}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      // Send JOIN message
      sendMessage({
        type: 'JOIN',
        payload: {
          sessionCode,
          participantId: initialParticipantId,
          isHost,
        },
        timestamp: Date.now(),
      })

      // Start ping interval
      pingIntervalRef.current = setInterval(() => {
        sendMessage({ type: 'PING', timestamp: Date.now() })
      }, PING_INTERVAL)
    }

    ws.onmessage = handleMessage

    ws.onclose = (event) => {
      setState((prev) => ({ ...prev, isConnected: false, isConnecting: false }))

      // Clear ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
        pingIntervalRef.current = null
      }

      // Attempt reconnection if not intentional close
      if (autoReconnect && event.code !== 1000 && reconnectCountRef.current < reconnectAttempts) {
        reconnectCountRef.current++
        const delay = reconnectDelay * Math.pow(2, reconnectCountRef.current - 1) // Exponential backoff
        reconnectTimeoutRef.current = setTimeout(connect, delay)
      }
    }

    ws.onerror = () => {
      setState((prev) => ({
        ...prev,
        error: 'Connection failed',
        isConnecting: false,
      }))
    }
  }, [wsUrl, sessionCode, isHost, initialParticipantId, autoReconnect, reconnectAttempts, reconnectDelay, sendMessage, handleMessage])

  // ─────────────────────────────────────────────────────────────────────────────
  // Disconnect from WebSocket
  // ─────────────────────────────────────────────────────────────────────────────

  const disconnect = useCallback(() => {
    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    // Clear ping interval
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
      pingIntervalRef.current = null
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected')
      wsRef.current = null
    }

    setState((prev) => ({ ...prev, isConnected: false, isConnecting: false }))
  }, [])

  // ─────────────────────────────────────────────────────────────────────────────
  // Vote action
  // ─────────────────────────────────────────────────────────────────────────────

  const vote = useCallback((optionId: string) => {
    if (!state.isConnected || state.hasVoted) return

    sendMessage({
      type: 'VOTE',
      payload: { optionId },
      timestamp: Date.now(),
    })
  }, [state.isConnected, state.hasVoted, sendMessage])

  // ─────────────────────────────────────────────────────────────────────────────
  // Host action
  // ─────────────────────────────────────────────────────────────────────────────

  const hostAction = useCallback((action: HostActionType) => {
    if (!state.isConnected || !state.isHost) return

    sendMessage({
      type: 'HOST_ACTION',
      payload: { action },
      timestamp: Date.now(),
    })
  }, [state.isConnected, state.isHost, sendMessage])

  // ─────────────────────────────────────────────────────────────────────────────
  // Cleanup on unmount
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  // ─────────────────────────────────────────────────────────────────────────────
  // Return hook interface
  // ─────────────────────────────────────────────────────────────────────────────

  return {
    ...state,
    connect,
    disconnect,
    vote,
    hostAction,
  }
}
