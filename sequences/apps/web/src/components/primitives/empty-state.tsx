'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@seq/ui';
import { LucideIcon } from 'lucide-react';
import { cn } from '@seq/ui';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'py-6',
      icon: 'h-10 w-10',
      iconWrapper: 'h-14 w-14',
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'h-12 w-12',
      iconWrapper: 'h-20 w-20',
      title: 'text-lg',
      description: 'text-sm',
    },
    lg: {
      container: 'py-16',
      icon: 'h-14 w-14',
      iconWrapper: 'h-24 w-24',
      title: 'text-xl',
      description: 'text-base',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn('flex flex-col items-center justify-center text-center', sizes.container, className)}>
      <div
        className={cn(
          'mx-auto mb-4 flex items-center justify-center rounded-full bg-primary/10',
          sizes.iconWrapper
        )}
      >
        <Icon className={cn('text-primary', sizes.icon)} />
      </div>
      <h3 className={cn('font-semibold mb-2', sizes.title)}>{title}</h3>
      {description && (
        <p className={cn('text-muted-foreground max-w-sm mx-auto mb-6', sizes.description)}>
          {description}
        </p>
      )}
      {action && (
        <Button
          asChild={!!action.href}
          onClick={action.onClick}
          size={size === 'sm' ? 'sm' : 'default'}
        >
          {action.href ? <a href={action.href}>{action.label}</a> : action.label}
        </Button>
      )}
    </div>
  );
}
