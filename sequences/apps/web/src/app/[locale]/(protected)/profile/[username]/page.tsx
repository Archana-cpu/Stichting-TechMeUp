import { auth } from '@seq/auth';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { db } from '@seq/database';
import { ProfileView } from '@/components/profile/profile-view';
import type { Locale } from '@seq/i18n';

type PageProps = {
  params: Promise<{ locale: Locale; username: string }>;
};

export default async function UserProfilePage({ params }: PageProps) {
  const { locale, username } = await params;
  setRequestLocale(locale);

  // Auth is guaranteed by layout
  const session = await auth();

  const user = await db.user.findUnique({
    where: { username },
    include: {
      _count: {
        select: {
          sequences: true,
          followers: true,
          following: true,
        },
      },
      sequences: {
        where: { isPublic: true },
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          emotion: true,
        },
      },
      followers: {
        where: { followerId: session!.user.id },
        take: 1,
      },
    },
  });

  if (!user) {
    notFound();
  }

  const isOwnProfile = session!.user.id === user.id;
  const isFollowing = user.followers && user.followers.length > 0;

  return <ProfileView user={user} isOwnProfile={isOwnProfile} isFollowing={isFollowing} />;
}
