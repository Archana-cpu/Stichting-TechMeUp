'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@seq/ui';
import { Plus, Sparkles, LayoutGrid, Rows3, Clock, Kanban } from 'lucide-react';
import type { Emotion, Trigger, Sequence } from '@seq/database';

import { EmptyState } from '../primitives';
import { FilterBar, SortMenu, ViewToggle } from '../data-display';
import { SequenceGrid } from './sequence-grid';
import { SequenceList } from './sequence-list';
import { SequenceTimeline } from './sequence-timeline';

// Dynamic import for canvas (no SSR needed)
const StoryboardFlow = dynamic(() => import('./storyboard-flow'), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-12rem)] w-full rounded-xl border bg-muted/20 flex items-center justify-center">
      <div className="text-muted-foreground">Loading canvas...</div>
    </div>
  ),
});

type SequenceWithRelations = Sequence & {
  emotion: Emotion;
  trigger: Trigger;
};

type StoryboardProps = {
  sequences: SequenceWithRelations[];
  emotions: Emotion[];
  triggers: Trigger[];
};

type SortOption = 'newest' | 'oldest' | 'mostPositive' | 'mostNegative';
type ViewMode = 'grid' | 'list' | 'timeline' | 'canvas';

function calculatePolarity(sequence: SequenceWithRelations): number {
  const emotionScore = sequence.emotionPolarity * sequence.emotionIntensity;
  const thoughtScore = sequence.thoughtPolarity * sequence.thoughtIntensity;
  const behaviorScore = sequence.behaviorPolarity * sequence.behaviorImpact;
  return Math.round((emotionScore + thoughtScore + behaviorScore) / 3);
}

export function Storyboard({ sequences, emotions, triggers }: StoryboardProps) {
  const t = useTranslations('storyboard');
  const tSeq = useTranslations('sequence');
  const tCommon = useTranslations('common');
  const tEmotions = useTranslations('emotions');
  const tTriggers = useTranslations('triggers');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const emotionOptions = useMemo(
    () =>
      emotions.map((e) => ({
        id: String(e.id),
        label: tEmotions(e.key as any),
        icon: e.icon,
      })),
    [emotions, tEmotions]
  );

  const triggerOptions = useMemo(
    () =>
      triggers.map((t) => ({
        id: String(t.id),
        label: tTriggers(t.key as any),
        icon: t.icon,
      })),
    [triggers, tTriggers]
  );

  const sortOptions = useMemo(
    () => [
      { id: 'newest', label: t('newest') },
      { id: 'oldest', label: t('oldest') },
      { id: 'mostPositive', label: t('mostPositive') },
      { id: 'mostNegative', label: t('mostNegative') },
    ],
    [t]
  );

  const viewOptions = useMemo(
    () => [
      { id: 'grid', label: t('grid'), icon: LayoutGrid },
      { id: 'list', label: t('list'), icon: Rows3 },
      { id: 'timeline', label: t('timeline'), icon: Clock },
      { id: 'canvas', label: t('canvas'), icon: Kanban },
    ],
    [t]
  );

  const filteredAndSortedSequences = useMemo(() => {
    let result = [...sequences];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (seq) =>
          seq.title.toLowerCase().includes(query) ||
          seq.summary.toLowerCase().includes(query)
      );
    }

    if (selectedEmotions.length > 0) {
      result = result.filter((seq) =>
        selectedEmotions.includes(String(seq.emotionId))
      );
    }

    if (selectedTriggers.length > 0) {
      result = result.filter((seq) =>
        selectedTriggers.includes(String(seq.triggerId))
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();
        case 'oldest':
          return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
        case 'mostPositive':
          return calculatePolarity(b) - calculatePolarity(a);
        case 'mostNegative':
          return calculatePolarity(a) - calculatePolarity(b);
        default:
          return 0;
      }
    });

    return result;
  }, [sequences, searchQuery, selectedEmotions, selectedTriggers, sortBy]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedEmotions([]);
    setSelectedTriggers([]);
  }, []);

  if (sequences.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <EmptyState
          icon={Sparkles}
          title={t('empty')}
          description={t('emptyDescription')}
          action={{
            label: tSeq('newSequence'),
            href: '/create',
          }}
          size="lg"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      <div className="sticky top-12 z-40 border-b border-border bg-background/95 backdrop-blur-xl supports-backdrop-filter:bg-background/80 shrink-0">
        <div className="w-full max-w-[1920px] mx-auto px-6 py-4 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {filteredAndSortedSequences.length} of {sequences.length} sequences
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/create">
                <Plus className="mr-2 h-4 w-4" />
                {tSeq('newSequence')}
              </Link>
            </Button>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 min-w-0">
              <FilterBar
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder={tCommon('search')}
                filters={[
                  {
                    key: 'emotion',
                    label: t('filterByEmotion'),
                    options: emotionOptions,
                    selected: selectedEmotions,
                    onChange: setSelectedEmotions,
                    multiple: true,
                  },
                  {
                    key: 'trigger',
                    label: t('filterByTrigger'),
                    options: triggerOptions,
                    selected: selectedTriggers,
                    onChange: setSelectedTriggers,
                    multiple: true,
                  },
                ]}
                onClearAll={handleClearFilters}
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <SortMenu
                options={sortOptions}
                value={sortBy}
                onChange={(v) => setSortBy(v as SortOption)}
              />
              <ViewToggle
                options={viewOptions}
                value={viewMode}
                onChange={(v) => setViewMode(v as ViewMode)}
              />
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'canvas' ? (
        <div className="flex-1 w-full relative overflow-hidden min-h-0">
          <StoryboardFlow sequences={filteredAndSortedSequences} />
        </div>
      ) : (
        <div className="flex-1 w-full max-w-[1920px] mx-auto px-6 py-8 overflow-y-auto">
          {filteredAndSortedSequences.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No sequences match your filters"
              description="Try adjusting your search or filter criteria"
              action={{
                label: tCommon('clear'),
                onClick: handleClearFilters,
              }}
              size="md"
            />
          ) : (
            <>
              {viewMode === 'grid' && (
                <SequenceGrid sequences={filteredAndSortedSequences} />
              )}
              {viewMode === 'list' && (
                <SequenceList sequences={filteredAndSortedSequences} />
              )}
              {viewMode === 'timeline' && (
                <SequenceTimeline sequences={filteredAndSortedSequences} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
