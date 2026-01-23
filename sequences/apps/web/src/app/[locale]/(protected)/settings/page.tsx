import { auth } from '@seq/auth';
import { setRequestLocale } from 'next-intl/server';
import { db } from '@seq/database';
import { SettingsForm } from '@/components/settings-form';
import type { Locale } from '@seq/i18n';

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export default async function SettingsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Auth is guaranteed by layout
  const session = await auth();

  const userSettings = await db.userSettings.findUnique({
    where: { userId: session!.user.id },
  });

  return <SettingsForm user={session!.user} settings={userSettings} />;
}
