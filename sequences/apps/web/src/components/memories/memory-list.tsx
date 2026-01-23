'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Input } from '@seq/ui';
import { Plus, Search, BookMarked } from 'lucide-react';
import { MemoryCard } from './memory-card';
import type { Memory, Sequence, Emotion } from '@seq/database';

// ============================================================================
// TYPES
// ============================================================================

type MemoryWithSequences = Memory & {
  sequences: (Sequence & { emotion: Emotion })[];
};

type MemoryListProps = {
  memories: MemoryWithSequences[];
  onCreateMemory?: () => void;
};

// ============================================================================
// COMPONENT
// ============================================================================

export function MemoryList({ memories, onCreateMemory }: MemoryListProps) {
  const t = useTranslations('memories');
  const tCommon = useTranslations('common');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMemories = memories.filter(
    (memory) =>
      searchQuery === '' ||
      memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ============================================================================
  // EMPTY STATE
  // ============================================================================

  if (memories.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-gradient-to-b from-muted/30 to-transparent p-12 text-center">
        <div className="mb-6 rounded-full bg-primary/10 p-6">
          <BookMarked className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">{t('empty')}</h2>
        <p className="mt-3 max-w-md text-muted-foreground">{t('emptyDescription')}</p>
        {onCreateMemory && (
          <Button size="lg" className="mt-8" onClick={onCreateMemory}>
            <Plus className="mr-2 h-5 w-5" />
            {t('newMemory')}
          </Button>
        )}
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('description')}</p>
        </div>
        {onCreateMemory && (
          <Button onClick={onCreateMemory}>
            <Plus className="mr-2 h-4 w-4" />
            {t('newMemory')}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={tCommon('search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMemories.map((memory) => (
          <MemoryCard key={memory.id} memory={memory} />
        ))}
      </div>

      {/* No Results */}
      {filteredMemories.length === 0 && memories.length > 0 && (
        <div className="py-12 text-center text-muted-foreground">
          No memories match your search.
        </div>
      )}
    </div>
  );
}
