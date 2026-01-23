'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Card, CardContent, Progress } from '@seq/ui';
import { BookMarked, Film, Calendar, Lock, Globe } from 'lucide-react';
import type { Memory, Sequence, Emotion } from '@seq/database';

// ============================================================================
// TYPES
// ============================================================================

type MemoryWithSequences = Memory & {
  sequences: (Sequence & { emotion: Emotion })[];
};

type MemoryCardProps = {
  memory: MemoryWithSequences;
};

// ============================================================================
// HELPERS
// ============================================================================

function calculateMemoryPolarity(sequences: (Sequence & { emotion: Emotion })[]): number {
  if (sequences.length === 0) return 0;
  const total = sequences.reduce((sum, seq) => {
    const emotionScore = seq.emotionPolarity * seq.emotionIntensity;
    const thoughtScore = seq.thoughtPolarity * seq.thoughtIntensity;
    const behaviorScore = seq.behaviorPolarity * seq.behaviorImpact;
    return sum + Math.round((emotionScore + thoughtScore + behaviorScore) / 3);
  }, 0);
  return Math.round(total / sequences.length);
}

// ============================================================================
// COMPONENT
// ============================================================================

export function MemoryCard({ memory }: MemoryCardProps) {
  const t = useTranslations('memories');
  const polarity = calculateMemoryPolarity(memory.sequences);
  const polarityPercent = ((polarity + 50) / 100) * 100;

  const dominantEmotion = memory.sequences.length > 0
    ? memory.sequences.reduce((acc, seq) => {
        const existing = acc.find((e) => e.id === seq.emotion.id);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ ...seq.emotion, count: 1 });
        }
        return acc;
      }, [] as (Emotion & { count: number })[])
        .sort((a, b) => b.count - a.count)[0]
    : null;

  return (
    <Link href={`/memories/${memory.id}`}>
      <Card className="group overflow-hidden border-2 border-transparent transition-all hover:border-primary/30 hover:shadow-lg">
        {/* Cover Image */}
        {memory.coverImage ? (
          <div className="relative h-48 overflow-hidden">
            <Image
              src={memory.coverImage}
              alt={memory.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-xl font-bold text-white">{memory.title}</h3>
            </div>
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <BookMarked className="h-12 w-12 text-primary/50" />
          </div>
        )}

        <CardContent className="p-4">
          {!memory.coverImage && <h3 className="mb-2 text-lg font-semibold">{memory.title}</h3>}

          {memory.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{memory.description}</p>
          )}

          {/* Stats */}
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Film className="h-4 w-4" />
              <span>{memory.sequences.length} sequences</span>
            </div>
            {memory.startDate && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(memory.startDate).toLocaleDateString()}</span>
              </div>
            )}
            {memory.isPublic ? (
              <Globe className="h-4 w-4 text-green-500" />
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          {/* Dominant Emotion */}
          {dominantEmotion && (
            <div className="mt-3">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `hsl(${dominantEmotion.colorHsl} / 0.15)`,
                  color: `hsl(${dominantEmotion.colorHsl})`,
                }}
              >
                {dominantEmotion.icon} {dominantEmotion.key}
              </span>
            </div>
          )}

          {/* Polarity Bar */}
          {memory.sequences.length > 0 && (
            <Progress
              value={polarityPercent}
              className="mt-3 h-2"
              indicatorClassName={polarity > 0 ? 'bg-green-500' : polarity < 0 ? 'bg-red-500' : 'bg-slate-400'}
            />
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
