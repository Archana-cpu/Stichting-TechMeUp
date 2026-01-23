'use client';

/**
 * Viewport Component - Fixed viewport container, no scrolling
 * Content fits within viewport, uses flexbox for layout
 */

import React from 'react';
import { cn } from '../lib/utils';

type ViewportProps = {
  children: React.ReactNode;
  className?: string;
  centered?: boolean;
};

export function Viewport({ children, className, centered = false }: ViewportProps) {
  return (
    <div
      className={cn(
        'flex h-screen w-full flex-col overflow-hidden',
        centered && 'items-center justify-center',
        className
      )}
    >
      {children}
    </div>
  );
}
