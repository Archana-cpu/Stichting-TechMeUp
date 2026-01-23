import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, type Locale } from '@seq/i18n';
import { en } from '@seq/i18n/messages/en';
import { tr } from '@seq/i18n/messages/tr';
import { nl } from '@seq/i18n/messages/nl';

const messages = { en, tr, nl };

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: messages[locale as Locale],
  };
});
