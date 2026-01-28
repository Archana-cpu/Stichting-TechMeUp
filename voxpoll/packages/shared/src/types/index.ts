/**
 * Shared type definitions
 * Aligned with BIBLE-013 Database Schema
 */

// ═══════════════════════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGINATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER-RELATED TYPES
// Aligned with BIBLE-005, BIBLE-013
// ═══════════════════════════════════════════════════════════════════════════════

export type UserRole = "USER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";

export type UserStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "BANNED"
  | "PENDING_VERIFICATION"
  | "DEACTIVATED"
  | "DORMANT"
  | "DELETED";

export type SubscriptionTier = "FREE" | "PLUS" | "PREMIUM";

export type VerificationLevel = 0 | 1 | 2 | 3 | 4;

export interface BaseUser {
  id: string;
  email: string | null;
  username: string;
  displayName: string | null;
  image: string | null;
  role: UserRole;
  status: UserStatus;
  subscriptionTier: SubscriptionTier;
  verificationLevel: VerificationLevel;
  createdAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT STATUS & VISIBILITY
// Aligned with BIBLE-006, BIBLE-013 Database Schema
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Content lifecycle status
 * Used for Polls, Surveys, and Tests
 * Aligned with database enum: ContentStatus
 */
export type ContentStatus =
  | "DRAFT"      // Created but not published
  | "SCHEDULED"  // Scheduled for future publishing
  | "ACTIVE"     // Currently live and accepting responses
  | "PAUSED"     // Temporarily stopped
  | "ENDED"      // Finished accepting responses
  | "ARCHIVED"   // Hidden from feeds but accessible

/**
 * Content visibility settings
 */
export type ContentVisibility =
  | "PUBLIC"           // Visible to everyone
  | "UNLISTED"         // Accessible via link only
  | "PRIVATE"          // Creator only
  | "ORGANIZATION_ONLY" // Organization members only
  | "FOLLOWERS_ONLY";   // Creator's followers only

/**
 * Results visibility settings
 */
export type ResultsVisibility =
  | "ALWAYS_VISIBLE"       // Anyone can see results
  | "AFTER_PARTICIPATION"  // Must participate first
  | "AFTER_END"            // Only after content closes
  | "CREATOR_ONLY";        // Only creator can see

// ═══════════════════════════════════════════════════════════════════════════════
// POLL-RELATED TYPES
// Aligned with BIBLE-006 §6.8.2
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Poll types
 * QUICK: Simple 2-4 option poll
 * EXTENDED: Advanced poll with more options and settings
 */
export type PollType = "QUICK" | "EXTENDED";

/**
 * Media types for poll attachments
 */
export type MediaType = "IMAGE" | "VIDEO" | "GIF";

export interface BasePoll {
  id: string;
  type: PollType;
  creatorId: string;
  question: string;
  description: string | null;
  mediaUrl: string | null;
  mediaType: MediaType | null;
  status: ContentStatus;
  visibility: ContentVisibility;
  totalVotes: number;
  uniqueVoters: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  closesAt: Date | null;
  closedAt: Date | null;
}

export interface PollOption {
  id: string;
  pollId: string;
  text: string;
  imageUrl: string | null;
  position: number;
  voteCount: number;
}

export interface PollSettings {
  allowMultipleChoice: boolean;
  maxSelections: number | null;
  showResultsBeforeVote: boolean;
  showVoterCount: boolean;
  allowChangeVote: boolean;
  requireComment: boolean;
  randomizeOptions: boolean;
  hideResultsUntilClose: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// VOTE-RELATED TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface VoteResult {
  optionId: string;
  text: string;
  count: number;
  percentage: number;
}

export interface PollResults {
  pollId: string;
  totalVotes: number;
  uniqueVoters: number;
  options: VoteResult[];
  userVote?: {
    optionId: string;
    votedAt: Date;
  } | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMMENT-RELATED TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type VoteDirection = "UP" | "DOWN";

export interface BaseComment {
  id: string;
  contentId: string;
  authorId: string;
  parentId: string | null;
  content: string;
  upvotes: number;
  downvotes: number;
  replyCount: number;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ORGANIZATION-RELATED TYPES
// Aligned with BIBLE-005, BIBLE-020
// ═══════════════════════════════════════════════════════════════════════════════

export type OrganizationRole =
  | "OWNER"
  | "ADMIN"
  | "MANAGER"
  | "ANALYST"
  | "CREATOR"
  | "MEMBER";

export interface BaseOrganization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  createdAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION TYPES
// Aligned with BIBLE-012
// ═══════════════════════════════════════════════════════════════════════════════

export type NotificationType =
  | "NEW_FOLLOWER"
  | "COMMENT_REPLY"
  | "POLL_MILESTONE"
  | "POLL_ENDED"
  | "DM_RECEIVED"
  | "BADGE_EARNED"
  | "ACCOUNT_SECURITY"
  | "SYSTEM_ALERT";

// ═══════════════════════════════════════════════════════════════════════════════
// GENERIC UTILITY TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Sort options for content listing
 */
export type SortOption = "recent" | "popular" | "trending" | "hot";

/**
 * Date range filter
 */
export interface DateRange {
  from: Date;
  to: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIVE POLL WEBSOCKET TYPES
// Client-server message protocol for real-time polling
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Live poll session status
 */
export type LivePollStatus = "WAITING" | "ACTIVE" | "PAUSED" | "ENDED";

/**
 * Client-to-server message types
 */
export type WSClientMessageType =
  | "JOIN"
  | "VOTE"
  | "HOST_ACTION"
  | "PING";

/**
 * Server-to-client message types
 */
export type WSServerMessageType =
  | "JOINED"
  | "VOTE_CONFIRMED"
  | "VOTE_UPDATE"
  | "PARTICIPANT_COUNT"
  | "SESSION_STATUS"
  | "HOST_DISCONNECTED"
  | "SESSION_ENDED"
  | "ERROR"
  | "PONG";

/**
 * Host action types
 */
export type HostActionType = "START" | "PAUSE" | "RESUME" | "END" | "REVEAL_RESULTS";

/**
 * Base WebSocket message structure
 */
export interface WSMessage<T extends string = string, P = unknown> {
  type: T;
  payload?: P;
  timestamp: number;
}

/**
 * Client messages
 */
export interface WSClientJoinMessage extends WSMessage<"JOIN"> {
  payload: {
    sessionCode: string;
    participantId?: string;
    isHost?: boolean;
  };
}

export interface WSClientVoteMessage extends WSMessage<"VOTE"> {
  payload: {
    optionId: string;
  };
}

export interface WSClientHostActionMessage extends WSMessage<"HOST_ACTION"> {
  payload: {
    action: HostActionType;
  };
}

export interface WSClientPingMessage extends WSMessage<"PING"> {}

export type WSClientMessage =
  | WSClientJoinMessage
  | WSClientVoteMessage
  | WSClientHostActionMessage
  | WSClientPingMessage;

/**
 * Server messages
 */
export interface WSServerJoinedMessage extends WSMessage<"JOINED"> {
  payload: {
    sessionCode: string;
    participantId: string;
    isHost: boolean;
    status: LivePollStatus;
    question: string;
    options: Array<{ id: string; text: string; imageUrl?: string }>;
    participantCount: number;
    results?: Record<string, number>;
  };
}

export interface WSServerVoteConfirmedMessage extends WSMessage<"VOTE_CONFIRMED"> {
  payload: {
    optionId: string;
  };
}

export interface WSServerVoteUpdateMessage extends WSMessage<"VOTE_UPDATE"> {
  payload: {
    results: Record<string, number>;
    totalVotes: number;
  };
}

export interface WSServerParticipantCountMessage extends WSMessage<"PARTICIPANT_COUNT"> {
  payload: {
    count: number;
    spectatorCount?: number;
  };
}

export interface WSServerSessionStatusMessage extends WSMessage<"SESSION_STATUS"> {
  payload: {
    status: LivePollStatus;
  };
}

export interface WSServerHostDisconnectedMessage extends WSMessage<"HOST_DISCONNECTED"> {
  payload: {
    orphanMode: boolean;
    autoEndAt?: string;
  };
}

export interface WSServerSessionEndedMessage extends WSMessage<"SESSION_ENDED"> {
  payload: {
    finalResults: Record<string, number>;
    totalVotes: number;
    totalParticipants: number;
  };
}

export interface WSServerErrorMessage extends WSMessage<"ERROR"> {
  payload: {
    code: string;
    message: string;
  };
}

export interface WSServerPongMessage extends WSMessage<"PONG"> {}

export type WSServerMessage =
  | WSServerJoinedMessage
  | WSServerVoteConfirmedMessage
  | WSServerVoteUpdateMessage
  | WSServerParticipantCountMessage
  | WSServerSessionStatusMessage
  | WSServerHostDisconnectedMessage
  | WSServerSessionEndedMessage
  | WSServerErrorMessage
  | WSServerPongMessage;
