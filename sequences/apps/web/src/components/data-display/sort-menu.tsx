'use client';

import { useTranslations } from 'next-intl';
import {
  cn,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@seq/ui';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

type SortOption = {
  id: string;
  label: string;
};

type SortMenuProps = {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
  direction?: 'asc' | 'desc';
  onDirectionChange?: (direction: 'asc' | 'desc') => void;
  label?: string;
  className?: string;
};

export function SortMenu({
  options,
  value,
  onChange,
  direction = 'desc',
  onDirectionChange,
  label,
  className,
}: SortMenuProps) {
  const t = useTranslations('storyboard');

  const currentOption = options.find((o) => o.id === value);
  const DirectionIcon = direction === 'asc' ? ArrowUp : ArrowDown;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowUpDown className="h-4 w-4" />
            {label || t('sortBy')}: {currentOption?.label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>{t('sortBy')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
            {options.map((option) => (
              <DropdownMenuRadioItem key={option.id} value={option.id}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {onDirectionChange && (
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => onDirectionChange(direction === 'asc' ? 'desc' : 'asc')}
        >
          <DirectionIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
