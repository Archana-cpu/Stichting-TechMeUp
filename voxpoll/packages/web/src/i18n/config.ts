// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - I18N CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════

export const locales = ['tr', 'en'] as const
export const defaultLocale = 'tr' as const

export type Locale = (typeof locales)[number]

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}
