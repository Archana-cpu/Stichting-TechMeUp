import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-green-500/15 text-green-600 dark:text-green-400',
        warning: 'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400',
        info: 'border-transparent bg-blue-500/15 text-blue-600 dark:text-blue-400',
        joy: 'border-transparent bg-[hsl(var(--joy))]/15 text-[hsl(var(--joy))]',
        trust: 'border-transparent bg-[hsl(var(--trust))]/15 text-[hsl(var(--trust))]',
        fear: 'border-transparent bg-[hsl(var(--fear))]/15 text-[hsl(var(--fear))]',
        surprise: 'border-transparent bg-[hsl(var(--surprise))]/15 text-[hsl(var(--surprise))]',
        sadness: 'border-transparent bg-[hsl(var(--sadness))]/15 text-[hsl(var(--sadness))]',
        disgust: 'border-transparent bg-[hsl(var(--disgust))]/15 text-[hsl(var(--disgust))]',
        anger: 'border-transparent bg-[hsl(var(--anger))]/15 text-[hsl(var(--anger))]',
        anticipation: 'border-transparent bg-[hsl(var(--anticipation))]/15 text-[hsl(var(--anticipation))]',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[10px]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
