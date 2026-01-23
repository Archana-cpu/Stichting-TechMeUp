import { setRequestLocale } from 'next-intl/server';
import { db } from '@seq/database';
import { AdminDashboard } from '@/components/admin/dashboard';
import type { Locale } from '@seq/i18n';

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export default async function AdminPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Auth & admin check is guaranteed by layout
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [userCount, sequenceCount, quoteCount, recentUsers, systemSettings, recentActivity] = await Promise.all([
    db.user.count(),
    db.sequence.count(),
    db.quote.count(),
    db.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
    db.systemSettings.findUnique({ where: { id: 'system' } }),
    Promise.all([
      db.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          image: true,
          createdAt: true,
        },
      }),
      db.sequence.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      }),
    ]),
  ]);

  return (
    <AdminDashboard
      stats={{ userCount, sequenceCount, quoteCount, recentUsers }}
      systemSettings={systemSettings}
      recentActivity={{
        users: recentActivity[0],
        sequences: recentActivity[1],
      }}
    />
  );
}
