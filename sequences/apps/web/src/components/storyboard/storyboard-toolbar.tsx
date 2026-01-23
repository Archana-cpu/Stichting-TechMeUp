'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@seq/ui';
import {
  Plus,
  LayoutGrid,
  List,
  Film,
  Workflow,
  Search,
  SlidersHorizontal,
  Calendar,
  ArrowUpDown,
} from 'lucide-react';
import type { Emotion, Trigger } from '@seq/database';
import type { ViewMode, CanvasLayout, FilterState } from './types';

// ============================================================================
// PROPS
// ============================================================================

type StoryboardToolbarProps = {
  viewMode: ViewMode;
  canvasLayout: CanvasLayout;
  filters: FilterState;
  emotions: Emotion[];
  triggers: Trigger[];
  sequenceCount: number;
  filteredCount: number;
  onViewModeChange: (mode: ViewMode) => void;
  onCanvasLayoutChange: (layout: CanvasLayout) => void;
  onFiltersChange: (filters: Partial<FilterState>) => void;
};

// ============================================================================
// COMPONENT
// ============================================================================

export function StoryboardToolbar({
  viewMode,
  canvasLayout,
  filters,
  emotions,
  triggers,
  sequenceCount,
  filteredCount,
  onViewModeChange,
  onCanvasLayoutChange,
  onFiltersChange,
}: StoryboardToolbarProps) {
  const t = useTranslations('storyboard');
  const tCommon = useTranslations('common');
  const tEmo = useTranslations('emotions');
  const tTrig = useTranslations('triggers');

  return (
    <div className="sticky top-16 z-20 -mx-4 border-b bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Main Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Title & Stats */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-sm text-muted-foreground">
              {filteredCount === sequenceCount
                ? `${sequenceCount} sequences`
                : `${filteredCount} of ${sequenceCount} sequences`}
            </p>
          </div>
        </div>

        {/* Right: View Controls & Create */}
        <div className="flex items-center gap-2">
          {/* View Mode Buttons */}
          <div className="flex items-center rounded-lg border bg-muted/30 p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              title={t('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              title={t('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('timeline')}
              title={t('timeline')}
            >
              <Film className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'canvas' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('canvas')}
              title="Canvas"
            >
              <Workflow className="h-4 w-4" />
            </Button>
          </div>

          {/* Canvas Layout (only when canvas mode) */}
          {viewMode === 'canvas' && (
            <Select value={canvasLayout} onValueChange={(v) => onCanvasLayoutChange(v as CanvasLayout)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal">Horizontal</SelectItem>
                <SelectItem value="vertical">Vertical</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Create Button */}
          <Button asChild>
            <Link href="/create">
              <Plus className="mr-2 h-4 w-4" />
              {tCommon('create')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={tCommon('search')}
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Emotion Filter */}
        <Select
          value={filters.emotionFilter}
          onValueChange={(v) => onFiltersChange({ emotionFilter: v })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('filterByEmotion')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filterByEmotion')}</SelectItem>
            {emotions.map((emotion) => (
              <SelectItem key={emotion.id} value={String(emotion.id)}>
                {emotion.icon} {tEmo(emotion.key as keyof typeof tEmo)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Trigger Filter */}
        <Select
          value={filters.triggerFilter}
          onValueChange={(v) => onFiltersChange({ triggerFilter: v })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('filterByTrigger')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filterByTrigger')}</SelectItem>
            {triggers.map((trigger) => (
              <SelectItem key={trigger.id} value={String(trigger.id)}>
                {trigger.icon} {tTrig(trigger.key as keyof typeof tTrig)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={filters.sortBy}
          onValueChange={(v) => onFiltersChange({ sortBy: v as FilterState['sortBy'] })}
        >
          <SelectTrigger className="w-[150px]">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            <SelectValue placeholder={t('sortBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t('newest')}</SelectItem>
            <SelectItem value="oldest">{t('oldest')}</SelectItem>
            <SelectItem value="mostPositive">{t('mostPositive')}</SelectItem>
            <SelectItem value="mostNegative">{t('mostNegative')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
