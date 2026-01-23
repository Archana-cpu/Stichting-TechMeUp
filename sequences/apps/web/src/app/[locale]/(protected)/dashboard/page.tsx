import { auth } from '@seq/auth';
import { setRequestLocale } from 'next-intl/server';
import { db } from '@seq/database';
import { Dashboard } from '@/components/dashboard';
import type { Locale } from '@seq/i18n';

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export default async function DashboardPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Auth is guaranteed by layout
  const session = await auth();
  const userId = session!.user.id;

  const [
    recentSequences,
    sequenceStats,
    emotionStats,
    userSettings,
  ] = await Promise.all([
    db.sequence.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { emotion: true, trigger: true },
    }),
    db.sequence.aggregate({
      where: { userId },
      _count: true,
      _avg: {
        emotionPolarity: true,
        thoughtPolarity: true,
        behaviorPolarity: true,
      },
    }),
    db.sequence.groupBy({
      by: ['emotionId'],
      where: { userId },
      _count: true,
      orderBy: { _count: { emotionId: 'desc' } },
      take: 5,
    }),
    db.userSettings.findUnique({
      where: { userId },
    }),
  ]);

  const emotions = await db.emotion.findMany();

  return (
    <Dashboard
      user={session!.user}
      recentSequences={recentSequences}
      stats={{
        totalSequences: sequenceStats._count,
        avgEmotionPolarity: sequenceStats._avg.emotionPolarity ?? 0,
        avgThoughtPolarity: sequenceStats._avg.thoughtPolarity ?? 0,
        avgBehaviorPolarity: sequenceStats._avg.behaviorPolarity ?? 0,
      }}
      emotionStats={emotionStats.map((stat) => ({
        emotionId: stat.emotionId,
        count: stat._count,
        emotion: emotions.find((e) => e.id === stat.emotionId),
      }))}
    />
  );
}
