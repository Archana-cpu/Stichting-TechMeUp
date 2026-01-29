'use client'

// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - USER AVATAR
// Avatar component with verification badge support
// ══════════════════════════════════════════════════════════════════════════════

import { cn, getInitials } from '@/lib/utils'
import { VerificationBadge } from './verification-badge'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface UserAvatarProps {
  user: {
    displayName?: string | null
    username: string
    avatarUrl?: string | null
    verificationLevel?: number
  }
  size?: AvatarSize
  showVerification?: boolean
  className?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Size Configurations
// ─────────────────────────────────────────────────────────────────────────────

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-xl',
  '2xl': 'h-24 w-24 text-2xl',
}

const badgeSizes: Record<AvatarSize, 'sm' | 'md' | 'lg'> = {
  xs: 'sm',
  sm: 'sm',
  md: 'sm',
  lg: 'md',
  xl: 'md',
  '2xl': 'lg',
}

const badgePositions: Record<AvatarSize, string> = {
  xs: '-bottom-0.5 -right-0.5',
  sm: '-bottom-0.5 -right-0.5',
  md: '-bottom-1 -right-1',
  lg: '-bottom-1 -right-1',
  xl: '-bottom-1.5 -right-1.5',
  '2xl': '-bottom-2 -right-2',
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

function UserAvatar({
  user,
  size = 'md',
  showVerification = false,
  className,
}: UserAvatarProps) {
  const displayName = user.displayName || user.username
  const initials = getInitials(displayName)
  const verificationLevel = user.verificationLevel ?? 0

  return (
    <div className={cn('relative inline-flex', className)}>
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={displayName}
          className={cn(
            'rounded-full object-cover',
            sizeClasses[size]
          )}
        />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-brand-100 font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
            sizeClasses[size]
          )}
        >
          {initials}
        </div>
      )}

      {showVerification && verificationLevel > 0 && (
        <div className={cn('absolute', badgePositions[size])}>
          <VerificationBadge level={verificationLevel} size={badgeSizes[size]} />
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export { UserAvatar }
export type { UserAvatarProps, AvatarSize }
