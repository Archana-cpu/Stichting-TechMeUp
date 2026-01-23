'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface BrandLogoProps {
  variant?: 'icon' | 'full';
  className?: string;
  linkTo?: string;
}

export function BrandLogo({ variant = 'full', className = '', linkTo = '/' }: BrandLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="h-10 w-10 bg-muted animate-pulse rounded-lg" />
        {variant === 'full' && (
          <div className="h-6 w-24 bg-muted animate-pulse rounded hidden sm:block" />
        )}
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';
  const logoSrc = variant === 'icon'
    ? isDark ? '/branding/logo-icon-dark.svg' : '/branding/logo-icon-light.svg'
    : isDark ? '/branding/logo-full-dark.svg' : '/branding/logo-full-light.svg';

  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src={logoSrc}
        alt="Sequences"
        width={variant === 'icon' ? 40 : 180}
        height={40}
        priority
        className="h-10 w-auto"
      />
    </div>
  );

  if (linkTo) {
    return (
      <Link href={linkTo} className="transition-opacity hover:opacity-80">
        {content}
      </Link>
    );
  }

  return content;
}
