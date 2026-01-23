'use client';

import { useTranslations } from 'next-intl';
import { cn, Badge } from '@seq/ui';
import type { Emotion } from '@seq/database';

type EmotionBadgeProps = {
  emotion: Emotion;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const emotionVariantMap: Record<string, 'joy' | 'trust' | 'fear' | 'surprise' | 'sadness' | 'disgust' | 'anger' | 'anticipation'> = {
  joy: 'joy',
  trust: 'trust',
  fear: 'fear',
  surprise: 'surprise',
  sadness: 'sadness',
  disgust: 'disgust',
  anger: 'anger',
  anticipation: 'anticipation',
};

export function EmotionBadge({
  emotion,
  showLabel = true,
  size = 'md',
  className,
}: EmotionBadgeProps) {
  const t = useTranslations('emotions');

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const variant = emotionVariantMap[emotion.key] || 'default';

  return (
    <Badge variant={variant} size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'} className={className}>
      <span className={iconSizes[size]}>{emotion.icon}</span>
      {showLabel && <span className={cn('ml-1', sizeClasses[size])}>{t(emotion.key as any)}</span>}
    </Badge>
  );
}

type EmotionIndicatorProps = {
  emotion: Emotion;
  intensity?: number;
  showIntensity?: boolean;
  className?: string;
};

export function EmotionIndicator({
  emotion,
  intensity,
  showIntensity = false,
  className,
}: EmotionIndicatorProps) {
  const t = useTranslations('emotions');

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-lg px-3 py-2',
        `bg-emotion-${emotion.key}`,
        className
      )}
    >
      <span className="text-2xl">{emotion.icon}</span>
      <div className="flex flex-col">
        <span className={cn('font-medium text-sm', `text-emotion-${emotion.key}`)}>
          {t(emotion.key as any)}
        </span>
        {showIntensity && intensity !== undefined && (
          <span className="text-xs text-muted-foreground">
            Intensity: {intensity}/10
          </span>
        )}
      </div>
    </div>
  );
}
