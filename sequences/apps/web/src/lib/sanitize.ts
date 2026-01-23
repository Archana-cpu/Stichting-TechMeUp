import DOMPurify from 'isomorphic-dompurify';

// ============================================================================
// HTML SANITIZATION
// ============================================================================

/**
 * User-generated HTML content için güvenli sanitization
 * Sadece temel text formatting taglarına izin verir
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });
}

/**
 * Plain text için - tüm HTML kaldırılır
 */
export function sanitizeText(dirty: string): string {
  if (!dirty) return '';

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
}

// ============================================================================
// FILENAME SANITIZATION
// ============================================================================

/**
 * Upload için güvenli filename
 * Path traversal ve özel karakter saldırılarını önler
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed';

  return (
    filename
      // Path traversal önleme
      .replace(/\.\./g, '')
      .replace(/[/\\]/g, '')
      // Sadece güvenli karakterler
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      // Multiple dots/underscores temizle
      .replace(/\.{2,}/g, '.')
      .replace(/_{2,}/g, '_')
      .replace(/-{2,}/g, '-')
      // Başta/sonda nokta/tire kaldır
      .replace(/^[._-]+|[._-]+$/g, '')
      // Max uzunluk
      .substring(0, 200) ||
    // Boşsa default
    'unnamed'
  );
}

// ============================================================================
// EMAIL NORMALIZATION
// ============================================================================

/**
 * Email'i normalize eder
 * - Lowercase
 * - Trim
 * - Gmail dot trick kaldırma (opsiyonel)
 */
export function normalizeEmail(
  email: string,
  options?: { removeGmailDots?: boolean }
): string {
  if (!email) return '';

  let normalized = email.toLowerCase().trim();

  // Gmail dot trick: firstname.lastname@gmail.com = firstnamelastname@gmail.com
  if (options?.removeGmailDots && normalized.endsWith('@gmail.com')) {
    const [localPart, domain] = normalized.split('@');
    normalized = `${localPart.replace(/\./g, '')}@${domain}`;
  }

  return normalized;
}

// ============================================================================
// SEARCH QUERY SANITIZATION
// ============================================================================

/**
 * Database LIKE query için güvenli string
 * SQL injection ve wildcard abuse önleme
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return '';

  return (
    query
      // LIKE wildcards escape
      .replace(/[%_\\]/g, '\\$&')
      // Newlines ve tabs kaldır
      .replace(/[\n\r\t]/g, ' ')
      // Multiple spaces tek space
      .replace(/\s+/g, ' ')
      // Trim
      .trim()
      // Max uzunluk
      .substring(0, 100)
  );
}

// ============================================================================
// URL SANITIZATION
// ============================================================================

/**
 * URL'i validate ve sanitize eder
 * javascript: ve data: URL'leri engeller
 */
export function sanitizeUrl(url: string): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    // Sadece http/https protokollerine izin ver
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    return parsed.href;
  } catch {
    return null;
  }
}

// ============================================================================
// USERNAME SANITIZATION
// ============================================================================

/**
 * Username için güvenli format
 * - Lowercase
 * - Sadece alfanumerik ve underscore
 * - 3-30 karakter
 */
export function sanitizeUsername(username: string): string | null {
  if (!username) return null;

  const sanitized = username
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .substring(0, 30);

  // Min 3 karakter
  if (sanitized.length < 3) return null;

  return sanitized;
}
