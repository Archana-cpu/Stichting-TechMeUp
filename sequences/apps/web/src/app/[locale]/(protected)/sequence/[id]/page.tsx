import { auth } from '@seq/auth';
import { redirect, notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { db } from '@seq/database';
import { SequenceDetails } from '@/components/sequence-details';
import type { Locale } from '@seq/i18n';

type PageProps = {
  params: Promise<{ locale: Locale; id: string }>;
};

export default async function SequenceDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  // Auth is guaranteed by layout
  const session = await auth();
  const userId = session!.user.id;

  const [sequence, emotions, triggers] = await Promise.all([
    db.sequence.findUnique({
      where: { id },
      include: {
        emotion: true,
        trigger: true,
        notes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
    db.emotion.findMany(),
    db.trigger.findMany(),
  ]);

  if (!sequence) {
    notFound();
  }

  // Check access
  if (sequence.userId !== userId && !sequence.isPublic) {
    redirect(`/${locale}/storyboard`);
  }

  return (
    <SequenceDetails
      sequence={sequence}
      emotions={emotions}
      triggers={triggers}
    />
  );
}
