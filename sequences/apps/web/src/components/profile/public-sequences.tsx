'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, Progress } from '@seq/ui';
import { Film, Heart, MessageCircle } from 'lucide-react';
import type { Sequence, Emotion, Trigger } from '@seq/database';

// ============================================================================
// TYPES
// ============================================================================

type SequenceWithRelations = Sequence & {
  emotion: Emotion;
  trigger: Trigger;
  _count: { reactions: number; comments: number };
};

type PublicSequencesProps = {
  sequences: SequenceWithRelations[];
};

// ============================================================================
// HELPERS
// ============================================================================

function calculatePolarity(sequence: SequenceWithRelations): number {
  const emotionScore = sequence.emotionPolarity * sequence.emotionIntensity;
  const thoughtScore = sequence.thoughtPolarity * sequence.thoughtIntensity;
  const behaviorScore = sequence.behaviorPolarity * sequence.behaviorImpact;
  return Math.round((emotionScore + thoughtScore + behaviorScore) / 3);
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PublicSequences({ sequences }: PublicSequencesProps) {
  const t = useTranslations('profile');
  const tEmo = useTranslations('emotions');

  if (sequences.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <Film className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">{t('noPublicSequences')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t('publicSequences')}</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sequences.map((sequence) => {
          const polarity = calculatePolarity(sequence);
          const polarityPercent = ((polarity + 50) / 100) * 100;

          return (
            <Link key={sequence.id} href={`/sequence/${sequence.id}`}>
              <Card className="group overflow-hidden transition-all hover:shadow-lg">
                {sequence.image && (
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={sequence.image}
                      alt={sequence.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}

                <CardContent className="p-4">
                  {/* Emotion Badge */}
                  <div className="mb-2">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: `hsl(${sequence.emotion.colorHsl} / 0.15)`,
                        color: `hsl(${sequence.emotion.colorHsl})`,
                      }}
                    >
                      {sequence.emotion.icon} {tEmo(sequence.emotion.key as keyof typeof tEmo)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold">{sequence.title}</h3>

                  {/* Summary */}
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {sequence.summary}
                  </p>

                  {/* Stats */}
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{sequence._count.reactions}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{sequence._count.comments}</span>
                    </div>
                    <span>{new Date(sequence.eventDate).toLocaleDateString()}</span>
                  </div>

                  {/* Polarity */}
                  <Progress
                    value={polarityPercent}
                    className="mt-3 h-1.5"
                    indicatorClassName={
                      polarity > 0 ? 'bg-green-500' : polarity < 0 ? 'bg-red-500' : 'bg-slate-400'
                    }
                  />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
