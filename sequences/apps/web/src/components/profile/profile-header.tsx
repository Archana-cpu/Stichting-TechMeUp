'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Button, Card, CardContent } from '@seq/ui';
import { User, MapPin, Calendar, Link as LinkIcon, Settings, UserPlus, UserMinus } from 'lucide-react';
import type { User as UserType } from '@seq/database';

// ============================================================================
// TYPES
// ============================================================================

type ProfileHeaderProps = {
  user: UserType & {
    _count: {
      sequences: number;
      memories: number;
      followers: number;
      following: number;
    };
  };
  isOwnProfile: boolean;
  isFollowing?: boolean;
};

// ============================================================================
// COMPONENT
// ============================================================================

export function ProfileHeader({ user, isOwnProfile, isFollowing = false }: ProfileHeaderProps) {
  const t = useTranslations('profile');
  const [following, setFollowing] = useState(isFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async () => {
    setIsLoading(true);
    try {
      if (following) {
        await fetch(`/api/users/${user.id}/unfollow`, { method: 'POST' });
        setFollowing(false);
      } else {
        await fetch(`/api/users/${user.id}/follow`, { method: 'POST' });
        setFollowing(true);
      }
    } catch (error) {
      console.error('Follow error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-primary/20 bg-muted">
            {user.image ? (
              <Image src={user.image} alt={user.name || user.username} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
                <p className="text-muted-foreground">@{user.username}</p>
              </div>

              {isOwnProfile ? (
                <Button variant="outline" asChild>
                  <a href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    {t('editProfile')}
                  </a>
                </Button>
              ) : (
                <Button
                  variant={following ? 'outline' : 'default'}
                  onClick={handleFollowToggle}
                  disabled={isLoading}
                >
                  {following ? (
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

            {/* Bio */}
            {user.bio && <p className="mt-4 text-sm">{user.bio}</p>}

            {/* Stats */}
            <div className="mt-6 flex flex-wrap justify-center gap-6 sm:justify-start">
              <div className="text-center">
                <div className="text-2xl font-bold">{user._count.sequences}</div>
                <div className="text-xs text-muted-foreground">{t('sequences')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{user._count.memories}</div>
                <div className="text-xs text-muted-foreground">{t('memories')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{user._count.followers}</div>
                <div className="text-xs text-muted-foreground">{t('followers')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{user._count.following}</div>
                <div className="text-xs text-muted-foreground">{t('following')}</div>
              </div>
            </div>

            {/* Meta */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
              {user.birthday && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(user.birthday).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
