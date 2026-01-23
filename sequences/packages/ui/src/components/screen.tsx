'use client';

/**
 * Screen Component - Responsive container for Web
 * Provides fixed layout, no scrolling, proper safe areas
 */

import React from 'react';
import { cn } from '../lib/utils';

type ScreenProps = {
  children: React.ReactNode;
  className?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  safe?: boolean;
};

export function Screen({ children, className, edges, safe }: ScreenProps) {
  return (
    <div
      className={cn(
        'flex min-h-screen w-full flex-col bg-background',
        safe && 'safe-area-inset',
        className
      )}
      style={{
        paddingTop: edges?.includes('top') ? 'env(safe-area-inset-top)' : undefined,
        paddingBottom: edges?.includes('bottom') ? 'env(safe-area-inset-bottom)' : undefined,
        paddingLeft: edges?.includes('left') ? 'env(safe-area-inset-left)' : undefined,
        paddingRight: edges?.includes('right') ? 'env(safe-area-inset-right)' : undefined,
      }}
    >
      {children}
    </div>
  );
}
