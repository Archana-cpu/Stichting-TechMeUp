// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - VERIFICATION BADGE
// Badge showing user verification level (0-4)
// ══════════════════════════════════════════════════════════════════════════════

import { Shield, ShieldCheck, ShieldAlert, BadgeCheck, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type VerificationLevel = 0 | 1 | 2 | 3 | 4

type BadgeSize = 'sm' | 'md' | 'lg'

interface VerificationBadgeProps {
  level: number
  size?: BadgeSize
  showLabel?: boolean
  className?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const levelConfig: Record<VerificationLevel, {
  icon: typeof Shield
  label: string
  description: string
  colors: string
  bgColors: string
}> = {
  0: {
    icon: Shield,
    label: 'Unverified',
    description: 'No verification',
    colors: 'text-slate-400 dark:text-slate-500',
    bgColors: 'bg-slate-100 dark:bg-slate-800',
  },
  1: {
    icon: ShieldCheck,
    label: 'Email Verified',
    description: 'Email address verified',
    colors: 'text-blue-500 dark:text-blue-400',
    bgColors: 'bg-blue-50 dark:bg-blue-900/20',
  },
  2: {
    icon: ShieldAlert,
    label: 'Phone Verified',
    description: 'Phone number verified',
    colors: 'text-emerald-500 dark:text-emerald-400',
    bgColors: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  3: {
    icon: BadgeCheck,
    label: 'ID Verified',
    description: 'Government ID verified',
    colors: 'text-purple-500 dark:text-purple-400',
    bgColors: 'bg-purple-50 dark:bg-purple-900/20',
  },
  4: {
    icon: Crown,
    label: 'Fully Verified',
    description: 'e-Devlet verified identity',
    colors: 'text-amber-500 dark:text-amber-400',
    bgColors: 'bg-amber-50 dark:bg-amber-900/20',
  },
}

const sizeClasses: Record<BadgeSize, { icon: string; text: string; padding: string }> = {
  sm: { icon: 'h-3.5 w-3.5', text: 'text-xs', padding: 'px-1.5 py-0.5' },
  md: { icon: 'h-4 w-4', text: 'text-sm', padding: 'px-2 py-1' },
  lg: { icon: 'h-5 w-5', text: 'text-base', padding: 'px-2.5 py-1.5' },
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

function VerificationBadge({
  level,
  size = 'md',
  showLabel = false,
  className,
}: VerificationBadgeProps) {
  const safeLevel = Math.min(Math.max(level, 0), 4) as VerificationLevel
  const config = levelConfig[safeLevel]
  const Icon = config.icon
  const sizeConfig = sizeClasses[size]

  if (!showLabel) {
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center rounded-full',
          config.bgColors,
          size === 'sm' && 'p-0.5',
          size === 'md' && 'p-1',
          size === 'lg' && 'p-1.5',
          className
        )}
        title={config.description}
      >
        <Icon className={cn(sizeConfig.icon, config.colors)} />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full',
        config.bgColors,
        sizeConfig.padding,
        className
      )}
      title={config.description}
    >
      <Icon className={cn(sizeConfig.icon, config.colors)} />
      <span className={cn(sizeConfig.text, config.colors, 'font-medium')}>
        {config.label}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Component - Verification Level Indicator
// ─────────────────────────────────────────────────────────────────────────────

interface VerificationLevelProps {
  level: number
  showAll?: boolean
  size?: BadgeSize
  className?: string
}

function VerificationLevel({
  level,
  showAll = false,
  size = 'sm',
  className,
}: VerificationLevelProps) {
  const safeLevel = Math.min(Math.max(level, 0), 4) as VerificationLevel

  if (!showAll) {
    return <VerificationBadge level={safeLevel} size={size} className={className} />
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {([1, 2, 3, 4] as VerificationLevel[]).map((lvl) => (
        <div
          key={lvl}
          className={cn(
            'h-2 w-2 rounded-full transition-colors',
            lvl <= safeLevel
              ? levelConfig[lvl].bgColors.replace('50', '500').replace('900/20', '500')
              : 'bg-slate-200 dark:bg-slate-700'
          )}
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export { VerificationBadge, VerificationLevel, levelConfig }
export type { VerificationBadgeProps, VerificationLevelProps, VerificationLevel as VerificationLevelType }
