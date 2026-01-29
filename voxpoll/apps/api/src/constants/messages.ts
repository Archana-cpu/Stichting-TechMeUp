// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - ERROR & SUCCESS MESSAGES
// ══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// Error Codes
// ─────────────────────────────────────────────────────────────────────────────

export const ERROR_CODES = {
  // General
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
  UNAUTHORIZED: 'UNAUTHORIZED',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  BAD_REQUEST: 'BAD_REQUEST',

  // Auth
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  USERNAME_EXISTS: 'USERNAME_EXISTS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  ACCOUNT_BANNED: 'ACCOUNT_BANNED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  ACCOUNT_DEACTIVATED: 'ACCOUNT_DEACTIVATED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  INVALID_VERIFICATION_CODE: 'INVALID_VERIFICATION_CODE',
  INVALID_RESET_TOKEN: 'INVALID_RESET_TOKEN',
  PASSWORD_MISMATCH: 'PASSWORD_MISMATCH',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  NO_PASSWORD_SET: 'NO_PASSWORD_SET',
  PASSWORD_ALREADY_SET: 'PASSWORD_ALREADY_SET',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Two-Factor Authentication
  TWO_FACTOR_REQUIRED: 'TWO_FACTOR_REQUIRED',
  TWO_FACTOR_ALREADY_ENABLED: 'TWO_FACTOR_ALREADY_ENABLED',
  TWO_FACTOR_NOT_ENABLED: 'TWO_FACTOR_NOT_ENABLED',
  TWO_FACTOR_NOT_SETUP: 'TWO_FACTOR_NOT_SETUP',
  INVALID_TWO_FACTOR_CODE: 'INVALID_TWO_FACTOR_CODE',

  // OAuth
  OAUTH_FAILED: 'OAUTH_FAILED',
  OAUTH_STATE_MISMATCH: 'OAUTH_STATE_MISMATCH',
  OAUTH_ALREADY_LINKED: 'OAUTH_ALREADY_LINKED',
  OAUTH_CANNOT_UNLINK: 'OAUTH_CANNOT_UNLINK',

  // Users
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  CANNOT_FOLLOW_SELF: 'CANNOT_FOLLOW_SELF',
  ALREADY_FOLLOWING: 'ALREADY_FOLLOWING',
  NOT_FOLLOWING: 'NOT_FOLLOWING',
  USER_BLOCKED: 'USER_BLOCKED',

  // Content
  POLL_NOT_FOUND: 'POLL_NOT_FOUND',
  SURVEY_NOT_FOUND: 'SURVEY_NOT_FOUND',
  SURVEY_B2B_REQUIRED: 'SURVEY_B2B_REQUIRED',
  TEST_NOT_FOUND: 'TEST_NOT_FOUND',
  COMMENT_NOT_FOUND: 'COMMENT_NOT_FOUND',
  ALREADY_VOTED: 'ALREADY_VOTED',
  POLL_CLOSED: 'POLL_CLOSED',
  POLL_NOT_PUBLISHED: 'POLL_NOT_PUBLISHED',
  INVALID_OPTION: 'INVALID_OPTION',

  // Pre-test (P-007, P-030)
  PRETEST_MAX_ATTEMPTS: 'PRETEST_MAX_ATTEMPTS',

  // Organizations
  ORG_NOT_FOUND: 'ORG_NOT_FOUND',
  ORG_MEMBER_EXISTS: 'ORG_MEMBER_EXISTS',
  ORG_MEMBER_NOT_FOUND: 'ORG_MEMBER_NOT_FOUND',
  ORG_ROLE_REQUIRED: 'ORG_ROLE_REQUIRED',
  CANNOT_REMOVE_OWNER: 'CANNOT_REMOVE_OWNER',

  // Subscriptions
  SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
  PREMIUM_REQUIRED: 'PREMIUM_REQUIRED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',

  // Moderation
  CONTENT_REPORTED: 'CONTENT_REPORTED',
  ALREADY_REPORTED: 'ALREADY_REPORTED',

  // PULSE Access
  PULSE_ACCESS_DENIED: 'PULSE_ACCESS_DENIED',

  // Comment Access (P-060)
  COMMENT_READ_DENIED: 'COMMENT_READ_DENIED',
  COMMENT_WRITE_DENIED: 'COMMENT_WRITE_DENIED',
} as const

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]

// ─────────────────────────────────────────────────────────────────────────────
// Error Messages
// ─────────────────────────────────────────────────────────────────────────────

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // General
  INTERNAL_ERROR: 'An unexpected error occurred. Please try again later.',
  VALIDATION_ERROR: 'Invalid request data.',
  NOT_FOUND: 'The requested resource was not found.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  UNAUTHORIZED: 'Authentication required.',
  CONFLICT: 'A conflict occurred with the current state.',
  RATE_LIMITED: 'Too many requests. Please try again later.',
  BAD_REQUEST: 'Invalid request.',

  // Auth
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_EXISTS: 'An account with this email already exists.',
  USERNAME_EXISTS: 'This username is already taken.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address.',
  ACCOUNT_BANNED: 'Your account has been banned.',
  ACCOUNT_SUSPENDED: 'Your account is currently suspended.',
  ACCOUNT_DEACTIVATED: 'Your account has been deactivated.',
  INVALID_TOKEN: 'Invalid authentication token.',
  EXPIRED_TOKEN: 'Your session has expired. Please log in again.',
  INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token.',
  INVALID_VERIFICATION_CODE: 'Invalid or expired verification code.',
  INVALID_RESET_TOKEN: 'Invalid or expired password reset link.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  WEAK_PASSWORD: 'Password does not meet security requirements.',
  NO_PASSWORD_SET: 'No password set for this account.',
  PASSWORD_ALREADY_SET: 'Password is already set. Use change password instead.',
  SESSION_NOT_FOUND: 'Session not found.',
  SESSION_EXPIRED: 'Session has expired.',

  // Two-Factor Authentication
  TWO_FACTOR_REQUIRED: 'Two-factor authentication code required.',
  TWO_FACTOR_ALREADY_ENABLED: '2FA is already enabled on this account.',
  TWO_FACTOR_NOT_ENABLED: '2FA is not enabled on this account.',
  TWO_FACTOR_NOT_SETUP: '2FA setup not initiated. Please start setup first.',
  INVALID_TWO_FACTOR_CODE: 'Invalid or expired 2FA code.',

  // OAuth
  OAUTH_FAILED: 'OAuth authentication failed.',
  OAUTH_STATE_MISMATCH: 'OAuth state mismatch. Please try again.',
  OAUTH_ALREADY_LINKED: 'This provider is already linked to your account.',
  OAUTH_CANNOT_UNLINK: 'Cannot unlink the only authentication method.',

  // Users
  USER_NOT_FOUND: 'User not found.',
  CANNOT_FOLLOW_SELF: 'You cannot follow yourself.',
  ALREADY_FOLLOWING: 'You are already following this user.',
  NOT_FOLLOWING: 'You are not following this user.',
  USER_BLOCKED: 'This user has blocked you.',

  // Content
  POLL_NOT_FOUND: 'Poll not found.',
  SURVEY_NOT_FOUND: 'Survey not found.',
  SURVEY_B2B_REQUIRED: 'Surveys are only available to B2B organization members.',
  TEST_NOT_FOUND: 'Test not found.',
  COMMENT_NOT_FOUND: 'Comment not found.',
  ALREADY_VOTED: 'You have already voted on this poll.',
  POLL_CLOSED: 'This poll is no longer accepting votes.',
  POLL_NOT_PUBLISHED: 'This poll has not been published yet.',
  INVALID_OPTION: 'Invalid option selected.',

  // Pre-test (P-007, P-030)
  PRETEST_MAX_ATTEMPTS: 'You have reached the maximum number of attempts for this pre-test.',

  // Organizations
  ORG_NOT_FOUND: 'Organization not found.',
  ORG_MEMBER_EXISTS: 'This user is already a member of the organization.',
  ORG_MEMBER_NOT_FOUND: 'Member not found in organization.',
  ORG_ROLE_REQUIRED: 'Insufficient role in organization.',
  CANNOT_REMOVE_OWNER: 'Cannot remove the organization owner.',

  // Subscriptions
  SUBSCRIPTION_REQUIRED: 'A subscription is required for this feature.',
  PREMIUM_REQUIRED: 'Premium subscription required.',
  QUOTA_EXCEEDED: 'You have exceeded your usage quota.',
  PAYMENT_FAILED: 'Payment processing failed.',

  // Moderation
  CONTENT_REPORTED: 'This content has been reported.',
  ALREADY_REPORTED: 'You have already reported this content.',

  // PULSE Access
  PULSE_ACCESS_DENIED: 'You must participate in this content to view results.',

  // Comment Access (P-060)
  COMMENT_READ_DENIED: 'You must participate in this content to read comments.',
  COMMENT_WRITE_DENIED: 'You must participate in this content to write comments.',
}

// ─────────────────────────────────────────────────────────────────────────────
// Success Messages
// ─────────────────────────────────────────────────────────────────────────────

export const SUCCESS_MESSAGES = {
  // Auth
  REGISTER_SUCCESS: 'Registration successful. Please verify your email.',
  LOGIN_SUCCESS: 'Logged in successfully.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  LOGOUT_ALL_SUCCESS: 'Logged out from all devices.',
  EMAIL_VERIFIED: 'Email verified successfully.',
  VERIFICATION_SENT: 'Verification code sent to your email.',
  PASSWORD_RESET_SENT: 'Password reset link sent to your email.',
  PASSWORD_RESET_SUCCESS: 'Password has been reset successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  PASSWORD_SET: 'Password has been set successfully.',
  SESSION_REVOKED: 'Session revoked successfully.',
  TWO_FACTOR_SETUP_INITIATED: '2FA setup initiated. Scan the QR code with your authenticator app.',
  TWO_FACTOR_ENABLED: '2FA has been enabled successfully.',
  TWO_FACTOR_DISABLED: '2FA has been disabled successfully.',
  BACKUP_CODES_REGENERATED: 'Backup codes have been regenerated.',

  // Content
  POLL_CREATED: 'Poll created successfully.',
  POLL_UPDATED: 'Poll updated successfully.',
  POLL_DELETED: 'Poll deleted successfully.',
  VOTE_RECORDED: 'Your vote has been recorded.',
  SURVEY_CREATED: 'Survey created successfully.',
  SURVEY_PUBLISHED: 'Survey published successfully.',
  RESPONSE_SUBMITTED: 'Response submitted successfully.',
  TEST_CREATED: 'Test created successfully.',
  TEST_UPDATED: 'Test updated successfully.',
  TEST_DELETED: 'Test deleted successfully.',
  TEST_PUBLISHED: 'Test published successfully.',
  COMMENT_CREATED: 'Comment posted successfully.',
  COMMENT_DELETED: 'Comment deleted successfully.',

  // Users
  PROFILE_UPDATED: 'Profile updated successfully.',
  SETTINGS_UPDATED: 'Settings updated successfully.',
  FOLLOW_SUCCESS: 'You are now following this user.',
  UNFOLLOW_SUCCESS: 'You have unfollowed this user.',
  BLOCK_SUCCESS: 'User blocked successfully.',
  UNBLOCK_SUCCESS: 'User unblocked successfully.',

  // Organizations
  ORG_CREATED: 'Organization created successfully.',
  ORG_UPDATED: 'Organization updated successfully.',
  ORG_DELETED: 'Organization deleted successfully.',
  MEMBER_ADDED: 'Member added successfully.',
  MEMBER_REMOVED: 'Member removed successfully.',
  ROLE_UPDATED: 'Member role updated successfully.',
  INVITATION_SENT: 'Invitation sent successfully.',

  // Reports
  REPORT_SUBMITTED: 'Report submitted. Thank you for helping keep VoxPoll safe.',
} as const

export type SuccessMessage = (typeof SUCCESS_MESSAGES)[keyof typeof SUCCESS_MESSAGES]

// ─────────────────────────────────────────────────────────────────────────────
// Helper Function
// ─────────────────────────────────────────────────────────────────────────────

export function getErrorMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.INTERNAL_ERROR
}
