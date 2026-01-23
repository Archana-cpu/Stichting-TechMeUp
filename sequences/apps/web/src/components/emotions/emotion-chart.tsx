'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { cn, Progress } from '@seq/ui';
import type { Emotion } from '@seq/database';

type EmotionStat = {
  emotionId: number;
  count: number;
  emotion?: Emotion;
};

type EmotionChartProps = {
  stats: EmotionStat[];
  className?: string;
  variant?: 'bar' | 'grid';
};

export function EmotionChart({ stats, className, variant = 'bar' }: EmotionChartProps) {
  const t = useTranslations('emotions');

  const maxCount = useMemo(() => Math.max(...stats.map((s) => s.count), 1), [stats]);

  if (variant === 'grid') {
    return (
      <div className={cn('grid grid-cols-4 gap-3', className)}>
        {stats.map((stat) => {
          if (!stat.emotion) return null;
          const percentage = (stat.count / maxCount) * 100;
          return (
            <div
              key={stat.emotionId}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg p-3',
                `bg-emotion-${stat.emotion.key}`
              )}
            >
              <span className="text-2xl">{stat.emotion.icon}</span>
              <span className={cn('text-lg font-bold', `text-emotion-${stat.emotion.key}`)}>
                {stat.count}
              </span>
              <span className="text-xs text-muted-foreground">
                {t(stat.emotion.key as any)}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {stats.map((stat) => {
        if (!stat.emotion) return null;
        const percentage = (stat.count / maxCount) * 100;
        return (
          <div key={stat.emotionId} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span>{stat.emotion.icon}</span>
                <span className="capitalize">{t(stat.emotion.key as any)}</span>
              </span>
              <span className="font-medium">{stat.count}</span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn('h-full transition-all duration-500', `bg-emotion-${stat.emotion.key}`)}
                style={{
                  width: `${percentage}%`,
                  backgroundColor: `hsl(${stat.emotion.colorHsl})`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

type EmotionWheelProps = {
  emotions: Emotion[];
  selectedKey?: string;
  onSelect?: (emotion: Emotion) => void;
  className?: string;
};

export function EmotionWheel({ emotions, selectedKey, onSelect, className }: EmotionWheelProps) {
  const t = useTranslations('emotions');

  return (
    <div className={cn('relative w-64 h-64', className)}>
      <div className="absolute inset-0 flex items-center justify-center">
        {emotions.map((emotion, index) => {
          const angle = (index / emotions.length) * 2 * Math.PI - Math.PI / 2;
          const radius = 90;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          const isSelected = emotion.key === selectedKey;

          return (
            <button
              key={emotion.id}
              type="button"
              onClick={() => onSelect?.(emotion)}
              className={cn(
                'absolute flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-200',
                isSelected
                  ? 'scale-125 shadow-lg'
                  : 'hover:scale-110'
              )}
              style={{
                transform: `translate(${x}px, ${y}px)`,
                backgroundColor: isSelected
                  ? `hsl(${emotion.colorHsl})`
                  : `hsl(${emotion.colorHsl} / 0.2)`,
              }}
            >
              <span className="text-xl">{emotion.icon}</span>
            </button>
          );
        })}
        <div className="w-20 h-20 rounded-full bg-background border flex items-center justify-center">
          {selectedKey && (
            <span className="text-3xl">
              {emotions.find((e) => e.key === selectedKey)?.icon}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
