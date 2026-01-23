'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@seq/ui';
import { User } from 'lucide-react';
import type { User as UserType } from '@seq/database';

// ============================================================================
// TYPES
// ============================================================================

type ProfileCardProps = {
  user: Pick<UserType, 'id' | 'username' | 'name' | 'image' | 'bio'> & {
    _count: { sequences: number; followers: number };
  };
};

// ============================================================================
// COMPONENT
// ============================================================================

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <Link href={`/profile/${user.username}`}>
      <Card className="overflow-hidden transition-all hover:shadow-lg">
        <CardContent className="p-4 text-center">
          {/* Avatar */}
          <div className="mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full bg-muted">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || user.username}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Name */}
          <h3 className="font-semibold">{user.name || user.username}</h3>
          <p className="text-sm text-muted-foreground">@{user.username}</p>

          {/* Bio */}
          {user.bio && (
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{user.bio}</p>
          )}

          {/* Stats */}
          <div className="mt-4 flex justify-center gap-4 text-xs">
            <div>
              <span className="font-semibold">{user._count.sequences}</span>
              <span className="ml-1 text-muted-foreground">sequences</span>
            </div>
            <div>
              <span className="font-semibold">{user._count.followers}</span>
              <span className="ml-1 text-muted-foreground">followers</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
