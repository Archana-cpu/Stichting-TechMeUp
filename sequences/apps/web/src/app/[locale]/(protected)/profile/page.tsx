import { auth } from '@seq/auth';
import { setRequestLocale } from 'next-intl/server';
import { db } from '@seq/database';
import { UserProfile } from '@/components/user-profile';
import type { Locale } from '@seq/i18n';

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export default async function ProfilePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Auth is guaranteed by layout
  const session = await auth();

  const [user, stats, emotionCounts, emotions] = await Promise.all([
    db.user.findUnique({
      where: { id: session!.user.id },
      include: {
        _count: {
          select: {
            sequences: true,
            followers: true,
            following: true,
          },
        },
      },
    }),
    db.sequence.aggregate({
      where: { userId: session!.user.id },
      _count: true,
      _avg: {
        emotionPolarity: true,
        thoughtPolarity: true,
        behaviorPolarity: true,
      },
    }),
    // Get emotion counts
    db.sequence.groupBy({
      by: ['emotionId'],
      where: { userId: session!.user.id },
      _count: { emotionId: true },
      orderBy: { _count: { emotionId: 'desc' } },
    }),
    db.emotion.findMany(),
  ]);

  if (!user) {
    return null;
  }

  // Build emotion stats with emotion details
  const emotionStats = emotionCounts.map((item) => ({
    emotionId: item.emotionId,
    count: item._count.emotionId,
    emotion: emotions.find((e) => e.id === item.emotionId),
  }));

  return (
    <UserProfile
      user={user}
      stats={{
        totalSequences: stats._count,
        avgEmotionPolarity: stats._avg.emotionPolarity ?? 0,
        avgThoughtPolarity: stats._avg.thoughtPolarity ?? 0,
        avgBehaviorPolarity: stats._avg.behaviorPolarity ?? 0,
      }}
      emotionStats={emotionStats}
    />
  );
}
