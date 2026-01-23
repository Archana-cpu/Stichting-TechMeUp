'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  cn,
  Button,
  Input,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@seq/ui';
import { Search, Filter, X, ChevronDown, SlidersHorizontal } from 'lucide-react';

type FilterOption = {
  id: string;
  label: string;
  icon?: string;
};

type FilterBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    key: string;
    label: string;
    options: FilterOption[];
    selected: string[];
    onChange: (selected: string[]) => void;
    multiple?: boolean;
  }[];
  onClearAll?: () => void;
  className?: string;
};

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  onClearAll,
  className,
}: FilterBarProps) {
  const t = useTranslations('common');

  const hasActiveFilters = filters.some((f) => f.selected.length > 0);
  const totalActiveFilters = filters.reduce((acc, f) => acc + f.selected.length, 0);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder || t('search')}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {filters.map((filter) => (
            <DropdownMenu key={filter.key}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {filter.label}
                  {filter.selected.length > 0 && (
                    <Badge variant="secondary" size="sm">
                      {filter.selected.length}
                    </Badge>
                  )}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filter.options.map((option) => {
                  const isSelected = filter.selected.includes(option.id);
                  return filter.multiple !== false ? (
                    <DropdownMenuCheckboxItem
                      key={option.id}
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          filter.onChange([...filter.selected, option.id]);
                        } else {
                          filter.onChange(filter.selected.filter((id) => id !== option.id));
                        }
                      }}
                    >
                      {option.icon && <span className="mr-2">{option.icon}</span>}
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  ) : (
                    <DropdownMenuItem
                      key={option.id}
                      onClick={() => {
                        filter.onChange(isSelected ? [] : [option.id]);
                      }}
                      className={cn(isSelected && 'bg-accent')}
                    >
                      {option.icon && <span className="mr-2">{option.icon}</span>}
                      {option.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}

          {hasActiveFilters && onClearAll && (
            <Button variant="ghost" size="sm" onClick={onClearAll}>
              <X className="h-4 w-4 mr-1" />
              {t('clear')} ({totalActiveFilters})
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) =>
            filter.selected.map((selectedId) => {
              const option = filter.options.find((o) => o.id === selectedId);
              if (!option) return null;
              return (
                <Badge key={`${filter.key}-${selectedId}`} variant="secondary" className="gap-1">
                  {option.icon && <span>{option.icon}</span>}
                  {option.label}
                  <button
                    type="button"
                    onClick={() =>
                      filter.onChange(filter.selected.filter((id) => id !== selectedId))
                    }
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
