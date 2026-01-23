import { auth } from '@seq/auth';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { db } from '@seq/database';
import { Storyboard } from '@/components/storyboard';
import type { Locale } from '@seq/i18n';

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export default async function StoryboardPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Auth is guaranteed by layout, but double-check for safety
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const [sequences, emotions, triggers] = await Promise.all([
    db.sequence.findMany({
      where: { userId: session!.user.id },
      include: {
        emotion: true,
        trigger: true,
      },
      orderBy: { eventDate: 'desc' },
    }),
    db.emotion.findMany(),
    db.trigger.findMany(),
  ]);

  return (
    <Storyboard
      sequences={sequences}
      emotions={emotions}
      triggers={triggers}
    />
  );
}
