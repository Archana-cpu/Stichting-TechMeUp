'use client';

import { cn } from '@seq/ui';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type PolarityIndicatorProps = {
  value: number;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function PolarityIndicator({
  value,
  showIcon = true,
  showLabel = false,
  size = 'md',
  className,
}: PolarityIndicatorProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  const sizeClasses = {
    sm: { text: 'text-xs', icon: 'h-3 w-3' },
    md: { text: 'text-sm', icon: 'h-4 w-4' },
    lg: { text: 'text-base', icon: 'h-5 w-5' },
  };

  const colorClass = isPositive
    ? 'polarity-positive'
    : isNegative
    ? 'polarity-negative'
    : 'polarity-neutral';

  return (
    <span className={cn('inline-flex items-center gap-1', colorClass, className)}>
      {showIcon && <Icon className={sizeClasses[size].icon} />}
      <span className={cn('font-medium', sizeClasses[size].text)}>
        {isPositive ? '+' : ''}
        {value}
      </span>
      {showLabel && (
        <span className={cn('text-muted-foreground', sizeClasses[size].text)}>
          {isPositive ? 'Positive' : isNegative ? 'Negative' : 'Neutral'}
        </span>
      )}
    </span>
  );
}

type PolarityScoreProps = {
  emotionScore: number;
  thoughtScore: number;
  behaviorScore: number;
  className?: string;
};

export function PolarityScore({
  emotionScore,
  thoughtScore,
  behaviorScore,
  className,
}: PolarityScoreProps) {
  const totalScore = Math.round((emotionScore + thoughtScore + behaviorScore) / 3);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Overall Score</span>
        <PolarityIndicator value={totalScore} size="lg" />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-muted/50 p-2">
          <div className="text-xs text-muted-foreground mb-1">Emotion</div>
          <PolarityIndicator value={emotionScore} size="sm" showIcon={false} />
        </div>
        <div className="rounded-lg bg-muted/50 p-2">
          <div className="text-xs text-muted-foreground mb-1">Thought</div>
          <PolarityIndicator value={thoughtScore} size="sm" showIcon={false} />
        </div>
        <div className="rounded-lg bg-muted/50 p-2">
          <div className="text-xs text-muted-foreground mb-1">Behavior</div>
          <PolarityIndicator value={behaviorScore} size="sm" showIcon={false} />
        </div>
      </div>
    </div>
  );
}
