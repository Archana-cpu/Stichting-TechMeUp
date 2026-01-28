// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - INPUT SANITIZATION UTILITIES
// [SECURITY] Prevents XSS and other injection attacks in user-generated content
// ══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// HTML Entity Encoding
// Escapes dangerous characters to prevent XSS
// ─────────────────────────────────────────────────────────────────────────────

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
}

/**
 * Escapes HTML entities to prevent XSS attacks
 * Use this for any user-generated content that will be rendered as text
 */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char)
}

// ─────────────────────────────────────────────────────────────────────────────
// Strip All HTML Tags
// Removes all HTML completely - use for plain text fields
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Removes all HTML tags from input
 * Use for fields that should never contain HTML (usernames, titles, etc.)
 */
export function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/gi, ' ') // Convert &nbsp; to spaces
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .trim()
}

// ─────────────────────────────────────────────────────────────────────────────
// Safe Markdown Sanitization
// Allows basic markdown while preventing XSS
// ─────────────────────────────────────────────────────────────────────────────

const DANGEROUS_PATTERNS = [
  // Script injection
  /<script\b[^>]*>[\s\S]*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // onclick, onerror, etc.
  /data:/gi, // data: URLs
  /vbscript:/gi,

  // Style injection
  /<style\b[^>]*>[\s\S]*?<\/style>/gi,
  /style\s*=\s*["'][^"']*expression\s*\(/gi,

  // Embedded objects
  /<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi,
  /<embed\b[^>]*>/gi,
  /<object\b[^>]*>[\s\S]*?<\/object>/gi,
  /<applet\b[^>]*>[\s\S]*?<\/applet>/gi,

  // Form hijacking
  /<form\b[^>]*>[\s\S]*?<\/form>/gi,
  /<input\b[^>]*>/gi,
  /<button\b[^>]*>[\s\S]*?<\/button>/gi,
  /<textarea\b[^>]*>[\s\S]*?<\/textarea>/gi,

  // Link hijacking
  /<a\b[^>]*href\s*=\s*["']javascript:[^"']*["'][^>]*>/gi,

  // SVG attacks
  /<svg\b[^>]*>[\s\S]*?<\/svg>/gi,
  /<math\b[^>]*>[\s\S]*?<\/math>/gi,

  // Meta refresh
  /<meta\b[^>]*>/gi,

  // Base URL hijacking
  /<base\b[^>]*>/gi,
]

/**
 * Removes dangerous HTML patterns while preserving safe content
 * Use for rich text fields that may contain markdown or limited HTML
 */
export function sanitizeContent(input: string): string {
  let result = input

  for (const pattern of DANGEROUS_PATTERNS) {
    result = result.replace(pattern, '')
  }

  // Remove null bytes and other dangerous characters
  result = result.replace(/\0/g, '')
  result = result.replace(/\x00/g, '')

  return result.trim()
}

// ─────────────────────────────────────────────────────────────────────────────
// URL Sanitization
// Validates and sanitizes URLs to prevent protocol attacks
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_URL_PROTOCOLS = ['http:', 'https:', 'mailto:']

/**
 * Sanitizes URLs to prevent javascript: and other dangerous protocols
 * Returns null if URL is invalid or dangerous
 */
export function sanitizeUrl(input: string): string | null {
  if (!input) return null

  try {
    const url = new URL(input)

    if (!ALLOWED_URL_PROTOCOLS.includes(url.protocol)) {
      return null
    }

    return url.href
  } catch {
    // If it's a relative URL, allow it
    if (input.startsWith('/') && !input.startsWith('//')) {
      return input
    }
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Username/Slug Sanitization
// Allows only alphanumeric characters, underscores, and hyphens
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sanitizes usernames and slugs
 * Only allows: a-z, 0-9, underscore, hyphen
 */
export function sanitizeUsername(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 30) // Max length
}

/**
 * Sanitizes slugs for URLs
 * Only allows: a-z, 0-9, hyphen
 */
export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric except hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .slice(0, 200) // Max length
}

// ─────────────────────────────────────────────────────────────────────────────
// Email Sanitization
// Normalizes email addresses
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sanitizes and normalizes email addresses
 */
export function sanitizeEmail(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s/g, '') // Remove all whitespace
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON Field Sanitization
// Sanitizes JSON strings that will be stored in database
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Recursively sanitizes all string values in an object
 * Use for JSON fields that contain user-generated content
 */
export function sanitizeJsonContent<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj }

  for (const key of Object.keys(result)) {
    const value = result[key as keyof T]

    if (typeof value === 'string') {
      (result as Record<string, unknown>)[key] = sanitizeContent(value)
    } else if (Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = value.map((item) =>
        typeof item === 'string'
          ? sanitizeContent(item)
          : typeof item === 'object' && item !== null
          ? sanitizeJsonContent(item as Record<string, unknown>)
          : item
      )
    } else if (typeof value === 'object' && value !== null) {
      (result as Record<string, unknown>)[key] = sanitizeJsonContent(value as Record<string, unknown>)
    }
  }

  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// Comprehensive Sanitization
// Applies all relevant sanitization based on field type
// ─────────────────────────────────────────────────────────────────────────────

export type SanitizeOptions = {
  allowHtml?: boolean
  maxLength?: number
  isUrl?: boolean
  isEmail?: boolean
  isUsername?: boolean
  isSlug?: boolean
}

/**
 * Applies appropriate sanitization based on field type
 */
export function sanitize(input: string, options: SanitizeOptions = {}): string {
  if (!input) return ''

  let result = input

  // Apply type-specific sanitization
  if (options.isEmail) {
    return sanitizeEmail(result)
  }

  if (options.isUsername) {
    return sanitizeUsername(result)
  }

  if (options.isSlug) {
    return sanitizeSlug(result)
  }

  if (options.isUrl) {
    return sanitizeUrl(result) || ''
  }

  // Apply content sanitization
  if (options.allowHtml) {
    result = sanitizeContent(result)
  } else {
    result = stripHtml(result)
    result = escapeHtml(result)
  }

  // Apply max length
  if (options.maxLength && result.length > options.maxLength) {
    result = result.slice(0, options.maxLength)
  }

  return result.trim()
}
