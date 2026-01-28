// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - ERROR HANDLER
// Centralized error handling for API requests
// ══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// API Error Class
// ─────────────────────────────────────────────────────────────────────────────

class VoxPollApiError extends Error {
  code: string
  statusCode: number

  constructor(message: string, code: string, statusCode: number) {
    super(message)
    this.name = 'VoxPollApiError'
    this.code = code
    this.statusCode = statusCode
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Codes
// ─────────────────────────────────────────────────────────────────────────────

const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Please login to continue',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  VALIDATION_ERROR: 'Please check your input and try again',
  RATE_LIMITED: 'Too many requests. Please wait a moment',
  INTERNAL_ERROR: 'Something went wrong. Please try again later',
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
  USERNAME_ALREADY_EXISTS: 'This username is already taken',
  POLL_CLOSED: 'This poll is no longer accepting votes',
  ALREADY_VOTED: 'You have already voted on this poll',
  VERIFICATION_REQUIRED: 'Please verify your email to continue',
  SUBSCRIPTION_REQUIRED: 'This feature requires a premium subscription',
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Handler
// ─────────────────────────────────────────────────────────────────────────────

interface FormattedError {
  message: string
  code: string
  isRetryable: boolean
  shouldLogout: boolean
}

function formatError(error: unknown): FormattedError {
  if (error instanceof VoxPollApiError) {
    return {
      message: ERROR_MESSAGES[error.code] || error.message,
      code: error.code,
      isRetryable: error.statusCode >= 500,
      shouldLogout: error.statusCode === 401,
    }
  }

  if (error instanceof Error) {
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return {
        message: ERROR_MESSAGES.NETWORK_ERROR,
        code: 'NETWORK_ERROR',
        isRetryable: true,
        shouldLogout: false,
      }
    }

    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      isRetryable: false,
      shouldLogout: false,
    }
  }

  return {
    message: ERROR_MESSAGES.INTERNAL_ERROR,
    code: 'UNKNOWN_ERROR',
    isRetryable: false,
    shouldLogout: false,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function isApiError(error: unknown): error is VoxPollApiError {
  return error instanceof VoxPollApiError
}

function getErrorMessage(error: unknown): string {
  return formatError(error).message
}

function isRetryableError(error: unknown): boolean {
  return formatError(error).isRetryable
}

function shouldRedirectToLogin(error: unknown): boolean {
  return formatError(error).shouldLogout
}

// ─────────────────────────────────────────────────────────────────────────────
// React Query Error Handler
// ─────────────────────────────────────────────────────────────────────────────

function handleQueryError(error: unknown) {
  const formatted = formatError(error)

  if (process.env.NODE_ENV === 'development') {
    console.error('Query Error:', {
      message: formatted.message,
      code: formatted.code,
      original: error,
    })
  }

  return formatted
}

function handleMutationError(error: unknown) {
  const formatted = formatError(error)

  if (process.env.NODE_ENV === 'development') {
    console.error('Mutation Error:', {
      message: formatted.message,
      code: formatted.code,
      original: error,
    })
  }

  return formatted
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export {
  formatError,
  isApiError,
  getErrorMessage,
  isRetryableError,
  shouldRedirectToLogin,
  handleQueryError,
  handleMutationError,
  ERROR_MESSAGES,
}

export type { FormattedError }
