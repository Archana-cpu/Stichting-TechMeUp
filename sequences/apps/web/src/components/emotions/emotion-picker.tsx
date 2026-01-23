'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn, Button, Label, Slider } from '@seq/ui';
import type { Emotion } from '@seq/database';

type EmotionPickerProps = {
  emotions: Emotion[];
  selectedId?: number;
  onSelect: (emotionId: number) => void;
  showIntensitySlider?: boolean;
  intensity?: number;
  onIntensityChange?: (intensity: number) => void;
  polarity?: number;
  onPolarityChange?: (polarity: number) => void;
  className?: string;
};

export function EmotionPicker({
  emotions,
  selectedId,
  onSelect,
  showIntensitySlider = false,
  intensity = 5,
  onIntensityChange,
  polarity = 0,
  onPolarityChange,
  className,
}: EmotionPickerProps) {
  const t = useTranslations('emotions');
  const tSeq = useTranslations('sequence');

  const selectedEmotion = emotions.find((e) => e.id === selectedId);

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid grid-cols-4 gap-3">
        {emotions.map((emotion) => {
          const isSelected = emotion.id === selectedId;
          return (
            <button
              key={emotion.id}
              type="button"
              onClick={() => onSelect(emotion.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-2 rounded-xl p-4 border-2 transition-all duration-200',
                isSelected
                  ? `border-emotion-${emotion.key} bg-emotion-${emotion.key} shadow-md scale-105`
                  : 'border-transparent bg-muted/50 hover:bg-muted hover:scale-102'
              )}
            >
              <span className="text-3xl">{emotion.icon}</span>
              <span
                className={cn(
                  'text-xs font-medium',
                  isSelected ? `text-emotion-${emotion.key}` : 'text-muted-foreground'
                )}
              >
                {t(emotion.key as any)}
              </span>
            </button>
          );
        })}
      </div>

      {selectedEmotion && showIntensitySlider && (
        <div
          className="rounded-xl p-4 space-y-4 border-2 animate-fade-in"
          style={{ borderColor: `hsl(${selectedEmotion.colorHsl})` }}
        >
          <div className="flex items-center gap-3">
            <span className="text-4xl">{selectedEmotion.icon}</span>
            <div>
              <p className="font-semibold">{t(selectedEmotion.key as any)}</p>
              <p className="text-sm text-muted-foreground">Selected emotion</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{tSeq('intensity')}</Label>
                <span className="text-sm font-medium">{intensity}/10</span>
              </div>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[intensity]}
                onValueChange={([v]) => onIntensityChange?.(v || 5)}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {onPolarityChange && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{tSeq('polarity')}</Label>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      polarity > 0
                        ? 'polarity-positive'
                        : polarity < 0
                        ? 'polarity-negative'
                        : 'polarity-neutral'
                    )}
                  >
                    {polarity > 0 ? '+' : ''}
                    {polarity}
                  </span>
                </div>
                <Slider
                  min={-5}
                  max={5}
                  step={1}
                  value={[polarity]}
                  onValueChange={([v]) => onPolarityChange?.(v || 0)}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="polarity-negative">Negative</span>
                  <span>Neutral</span>
                  <span className="polarity-positive">Positive</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
