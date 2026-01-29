// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - I18N REQUEST CONFIG
// ══════════════════════════════════════════════════════════════════════════════

import { getRequestConfig } from 'next-intl/server'
import { locales, defaultLocale, type Locale } from './config'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: 'Europe/Istanbul',
    now: new Date(),
  }
})
