'use client';

/**
 * Container Component - Responsive container with max-width and padding
 * Web version using Tailwind CSS
 */

import React from 'react';
import { cn } from '../lib/utils';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
};

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
};

export function Container({ children, className, maxWidth = 'xl', padding = true }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full', maxWidthClasses[maxWidth], padding && 'px-4', className)}>
      {children}
    </div>
  );
}
