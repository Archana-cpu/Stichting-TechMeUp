'use client';

import { cn, Button, Tabs, TabsList, TabsTrigger, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@seq/ui';
import type { LucideIcon } from 'lucide-react';
import { Grid, List, LayoutGrid, Rows3 } from 'lucide-react';

type ViewOption = {
  id: string;
  label: string;
  icon: LucideIcon;
};

type ViewToggleProps = {
  options?: ViewOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

const defaultOptions: ViewOption[] = [
  { id: 'grid', label: 'Grid', icon: LayoutGrid },
  { id: 'list', label: 'List', icon: Rows3 },
];

export function ViewToggle({
  options = defaultOptions,
  value,
  onChange,
  className,
}: ViewToggleProps) {
  return (
    <TooltipProvider>
      <div className={cn('flex items-center rounded-md border bg-muted p-1', className)}>
        {options.map((option) => {
          const Icon = option.icon;
          const isActive = value === option.id;
          return (
            <Tooltip key={option.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onChange(option.id)}
                  className={cn(
                    'inline-flex h-9 w-9 items-center justify-center rounded-md transition-all duration-200 cursor-pointer',
                    isActive
                      ? 'bg-background text-foreground shadow-md scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{option.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
