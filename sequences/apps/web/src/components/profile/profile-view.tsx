'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Separator,
} from '@seq/ui';
import {
  User,
  Settings,
  Film,
  Users,
  UserPlus,
  UserMinus,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Edit,
} from 'lucide-react';
import type { User as UserType, Emotion, Sequence } from '@seq/database';
import { EmotionChart } from '../emotions/emotion-chart';

type EmotionStat = {
  emotionId: number;
  count: number;
  emotion?: Emotion;
};

type ProfileViewProps = {
  user: UserType & {
    _count: {
      sequences: number;
      followers: number;
      following: number;
    };
    sequences: (Sequence & { emotion: Emotion })[];
  };
  isOwnProfile: boolean;
  isFollowing?: boolean;
  emotionStats?: EmotionStat[];
};

export function ProfileView({ user, isOwnProfile, isFollowing: initialFollowing, emotionStats }: ProfileViewProps) {
  const t = useTranslations('profile');
  const [isFollowing, setIsFollowing] = useState(initialFollowing ?? false);
  const [followerCount, setFollowerCount] = useState(user._count.followers);

  const handleFollowToggle = async () => {
    const method = isFollowing ? 'DELETE' : 'POST';
    const res = await fetch(`/api/users/${user.id}/follow`, { method });

    if (res.ok) {
      setIsFollowing(!isFollowing);
      setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));
    }
  };

  const getInitials = (name: string | null, username: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="h-full w-full overflow-x-auto overflow-y-hidden scrollbar-hide">
      <div className="w-full h-full flex flex-col">
        {/* Fixed Header */}
        <div className="sticky top-12 left-0 right-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border shrink-0">
          <div className="w-full max-w-[1920px] mx-auto px-6 py-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg shrink-0">
                <AvatarImage src={user.image ?? undefined} alt={user.name ?? user.username} />
                <AvatarFallback className="text-2xl">
                  {getInitials(user.name, user.username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold truncate">{user.name ?? user.username}</h1>
                <p className="text-muted-foreground mt-1 text-sm">@{user.username}</p>
                {user.bio && <p className="mt-3 text-sm max-w-2xl leading-relaxed">{user.bio}</p>}
                <div className="mt-4 flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-xl font-bold">{user._count.sequences}</div>
                    <div className="text-muted-foreground">{t('sequences')}</div>
                  </div>
                  <Separator orientation="vertical" className="h-8" />
                  <div className="text-center">
                    <div className="text-xl font-bold">{followerCount}</div>
                    <div className="text-muted-foreground">{t('followers')}</div>
                  </div>
                  <Separator orientation="vertical" className="h-8" />
                  <div className="text-center">
                    <div className="text-xl font-bold">{user._count.following}</div>
                    <div className="text-muted-foreground">{t('following')}</div>
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                {isOwnProfile ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      {t('editProfile')}
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant={isFollowing ? 'outline' : 'default'}
                    size="sm"
                    onClick={handleFollowToggle}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="mr-2 h-4 w-4" />
                        {t('unfollow')}
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        {t('follow')}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Scrollable Content */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
          <div className="inline-flex h-full items-end">
            {/* Sequences Section - Asymmetric Layout */}
            {user.sequences.length > 0 && (
              <div className="h-full px-6 py-8 flex items-end">
                <div className="flex gap-6 items-end">
                  {user.sequences.map((sequence, index) => {
                    // Create asymmetric sizes - alternating between large, medium, and small
                    const sizeVariants = [
                      { width: 400, height: 560, className: 'w-[400px] h-[560px]' },
                      { width: 320, height: 440, className: 'w-[320px] h-[440px]' },
                      { width: 360, height: 500, className: 'w-[360px] h-[500px]' },
                      { width: 280, height: 380, className: 'w-[280px] h-[380px]' },
                      { width: 340, height: 480, className: 'w-[340px] h-[480px]' },
                    ];
                    const variant = sizeVariants[index % sizeVariants.length];
                    const rotation = (index % 3 - 1) * 1.5; // -1.5, 0, or 1.5 degrees
                    
                    return (
                      <Link
                        key={sequence.id}
                        href={`/sequence/${sequence.id}`}
                        className="shrink-0 group"
                        style={{ transform: `rotate(${rotation}deg)` }}
                      >
                        <Card className="overflow-hidden transition-shadow hover:shadow-xl h-full border border-border">
                          {sequence.image ? (
                            <div className={`${variant.className} overflow-hidden relative`}>
                              <Image
                                src={sequence.image}
                                alt={sequence.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 480px) 480px, 480px"
                              />
                              {/* Overlay with emotion and title */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-2xl">{sequence.emotion.icon}</span>
                                  <h3 className="text-xl font-bold text-white line-clamp-1">{sequence.title}</h3>
                                </div>
                                {sequence.summary && (
                                  <p className="text-sm text-white/90 line-clamp-2 mb-2">
                                    {sequence.summary}
                                  </p>
                                )}
                                <p className="text-xs text-white/70">
                                  {new Date(sequence.eventDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className={`${variant.className} bg-gradient-to-br from-muted to-muted-foreground/10 flex flex-col items-center justify-center p-8`}>
                              <span className="text-6xl mb-4">{sequence.emotion.icon}</span>
                              <h3 className="text-2xl font-bold text-center mb-2">{sequence.title}</h3>
                              {sequence.summary && (
                                <p className="text-sm text-muted-foreground text-center line-clamp-3">
                                  {sequence.summary}
                                </p>
                              )}
                            </div>
                          )}
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Emotion Statistics - Only for own profile */}
            {isOwnProfile && emotionStats && emotionStats.length > 0 && (
              <div className="h-full px-6 py-8 border-l border-border/40">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  {t('emotionInsights') || 'Emotion Insights'}
                </h2>
                <div className="grid gap-6 w-96">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Most Frequent Emotions</h3>
                    <EmotionChart stats={emotionStats} variant="bar" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Emotion Overview</h3>
                    <EmotionChart stats={emotionStats} variant="grid" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
