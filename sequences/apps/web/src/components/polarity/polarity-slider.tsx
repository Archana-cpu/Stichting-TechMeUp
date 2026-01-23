'use client';

import { cn, Label, Slider } from '@seq/ui';

type PolaritySliderProps = {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  min?: number;
  max?: number;
  showValue?: boolean;
  className?: string;
};

export function PolaritySlider({
  value,
  onChange,
  label,
  min = -5,
  max = 5,
  showValue = true,
  className,
}: PolaritySliderProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;

  const colorClass = isPositive
    ? 'polarity-positive'
    : isNegative
    ? 'polarity-negative'
    : 'polarity-neutral';

  return (
    <div className={cn('space-y-4 p-5 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/20 transition-all duration-300', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1">
          {label && <Label className="text-sm font-semibold">{label}</Label>}
          {showValue && (
            <span className={cn('text-base font-bold px-3 py-1 rounded-lg bg-background/80 border border-border/50', colorClass)}>
              {isPositive ? '+' : ''}
              {value.toFixed(1)}
            </span>
          )}
        </div>
      )}
      <div className="px-1">
        <Slider
          min={min}
          max={max}
          step={0.1}
          value={[value]}
          onValueChange={([v]) => onChange(v ?? 0)}
          className="py-3"
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground pt-1">
        <span className="polarity-negative font-medium">Negative</span>
        <span className="font-medium">Neutral</span>
        <span className="polarity-positive font-medium">Positive</span>
      </div>
    </div>
  );
}

type IntensitySliderProps = {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  min?: number;
  max?: number;
  showValue?: boolean;
  className?: string;
};

export function IntensitySlider({
  value,
  onChange,
  label = 'Intensity',
  min = 1,
  max = 10,
  showValue = true,
  className,
}: IntensitySliderProps) {
  const getIntensityLabel = (val: number) => {
    if (val <= 3) return 'Low';
    if (val <= 6) return 'Medium';
    return 'High';
  };

  const getIntensityColor = (val: number) => {
    if (val <= 3) return 'text-green-500';
    if (val <= 6) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className={cn('space-y-4 p-5 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/20 transition-all duration-300', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1">
          {label && <Label className="text-sm font-semibold">{label}</Label>}
          {showValue && (
            <span className={cn('text-base font-bold px-3 py-1 rounded-lg bg-background/80 border border-border/50', getIntensityColor(value))}>
              {value}/{max} <span className="text-xs font-normal">({getIntensityLabel(value)})</span>
            </span>
          )}
        </div>
      )}
      <div className="px-1">
        <Slider
          min={min}
          max={max}
          step={0.1}
          value={[value]}
          onValueChange={([v]) => onChange(v ?? 5)}
          className="py-3"
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground pt-1">
        <span className="font-medium">Low</span>
        <span className="font-medium">Medium</span>
        <span className="font-medium">High</span>
      </div>
    </div>
  );
}
