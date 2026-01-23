'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@seq/ui';
import { locales, localeFlags, type Locale } from '@seq/i18n';

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: Locale) => {
    const segments = pathname.split('/');
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join('/'));
  };

  const currentIndex = locales.indexOf(locale);
  const nextLocale = locales[(currentIndex + 1) % locales.length] ?? locales[0];

  return (
    <Button variant="ghost" size="icon" onClick={() => handleLocaleChange(nextLocale!)}>
      <span className="text-lg">{localeFlags[locale]}</span>
    </Button>
  );
}
