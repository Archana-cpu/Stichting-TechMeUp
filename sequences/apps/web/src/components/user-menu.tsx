'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@seq/ui';
import { LogOut, Settings, User } from 'lucide-react';

type UserMenuProps = {
  user: {
    name?: string | null;
    email: string;
    image?: string | null;
    username: string;
  };
};

export function UserMenu({ user }: UserMenuProps) {
  const t = useTranslations('common');
  const [open, setOpen] = useState(false);

  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'User'} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </button>

      {open && (
        <>
          <div className="fixed inset-0" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 rounded-md border bg-popover p-1 shadow-lg">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            </div>
            <div className="h-px bg-border" />
            <Link
              href={`/@${user.username}`}
              className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              <User className="h-4 w-4" />
              {t('profile')}
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-4 w-4" />
              {t('settings')}
            </Link>
            <div className="h-px bg-border" />
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-destructive hover:bg-accent"
            >
              <LogOut className="h-4 w-4" />
              {t('logout')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
