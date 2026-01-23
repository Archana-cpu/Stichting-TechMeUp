import { auth } from '@seq/auth';
import { setRequestLocale } from 'next-intl/server';
import { db } from '@seq/database';
import { CreateSequenceForm } from '@/components/create-sequence-form';
import type { Locale } from '@seq/i18n';

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export default async function CreatePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Auth is guaranteed by layout
  const session = await auth();

  const [emotions, triggers, people] = await Promise.all([
    db.emotion.findMany(),
    db.trigger.findMany(),
    db.person.findMany({ where: { userId: session!.user.id } }),
  ]);

  return <CreateSequenceForm emotions={emotions} triggers={triggers} people={people} />;
}
