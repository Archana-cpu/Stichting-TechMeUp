import { auth } from '@seq/auth';
import { setRequestLocale } from 'next-intl/server';
import { db } from '@seq/database';
import type { Locale } from '@seq/i18n';
import { LifeTreeClient } from '@/components/lifetree/lifetree-client';

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export default async function LifeTreePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Auth is guaranteed by layout
  const session = await auth();

  const people = await db.person.findMany({
    where: { userId: session!.user.id },
    include: {
      _count: { select: { sequences: true } },
      relationsFrom: true,
      relationsTo: true,
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="w-full h-full overflow-hidden">
      <LifeTreeClient people={people} />
    </div>
  );
}
