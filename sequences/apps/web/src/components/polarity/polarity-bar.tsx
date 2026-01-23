'use client';

import { cn } from '@seq/ui';

type PolarityBarProps = {
  value: number;
  max?: number;
  min?: number;
  showLabels?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
};

export function PolarityBar({
  value,
  max = 50,
  min = -50,
  showLabels = false,
  className,
  size = 'md',
  animated = true,
}: PolarityBarProps) {
  const range = max - min;
  const normalizedValue = ((value - min) / range) * 100;
  const centerPercent = ((0 - min) / range) * 100;

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const isPositive = value > 0;
  const isNegative = value < 0;

  const barColor = isPositive
    ? 'bg-green-500'
    : isNegative
    ? 'bg-red-500'
    : 'bg-blue-500';

  const fillWidth = Math.abs(normalizedValue - centerPercent);

  return (
    <div className={cn('space-y-1', className)}>
      <div className={cn('relative w-full overflow-hidden rounded-full bg-muted', sizeClasses[size])}>
        <div className="absolute left-1/2 h-full w-px bg-border z-10" />
        <div
          className={cn(
            'absolute h-full rounded-full',
            barColor,
            animated && 'transition-all duration-500'
          )}
          style={{
            left: isNegative ? `${normalizedValue}%` : `${centerPercent}%`,
            width: `${fillWidth}%`,
          }}
        />
      </div>
      {showLabels && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{min}</span>
          <span>0</span>
          <span>+{max}</span>
        </div>
      )}
    </div>
  );
}

type PolarityGaugeProps = {
  value: number;
  label?: string;
  className?: string;
};

export function PolarityGauge({ value, label, className }: PolarityGaugeProps) {
  const percentage = ((value + 50) / 100) * 180;

  const getColor = (val: number) => {
    if (val > 10) return 'text-green-500';
    if (val < -10) return 'text-red-500';
    return 'text-blue-500';
  };

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative w-32 h-16 overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-32 rounded-t-full border-8 border-muted" />
        <div
          className="absolute bottom-0 left-1/2 w-1 h-14 origin-bottom bg-foreground rounded-t-full transition-transform duration-500"
          style={{ transform: `translateX(-50%) rotate(${percentage - 90}deg)` }}
        />
        <div className="absolute bottom-0 left-1/2 w-4 h-4 -translate-x-1/2 rounded-full bg-background border-2 border-foreground" />
      </div>
      <div className={cn('mt-2 text-2xl font-bold', getColor(value))}>
        {value > 0 ? '+' : ''}{value}
      </div>
      {label && <div className="text-sm text-muted-foreground">{label}</div>}
    </div>
  );
}
