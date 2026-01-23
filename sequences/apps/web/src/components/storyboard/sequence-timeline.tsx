'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Card, Badge, cn } from '@seq/ui';
import { Star, Circle } from 'lucide-react';
import type { Emotion, Trigger, Sequence } from '@seq/database';
import { PolarityIndicator } from '../polarity';
import { EmotionBadge } from '../emotions';

type SequenceWithRelations = Sequence & {
  emotion: Emotion;
  trigger: Trigger;
};

type SequenceTimelineProps = {
  sequences: SequenceWithRelations[];
};

function calculatePolarity(sequence: SequenceWithRelations): number {
  const emotionScore = sequence.emotionPolarity * sequence.emotionIntensity;
  const thoughtScore = sequence.thoughtPolarity * sequence.thoughtIntensity;
  const behaviorScore = sequence.behaviorPolarity * sequence.behaviorImpact;
  return Math.round((emotionScore + thoughtScore + behaviorScore) / 3);
}

function groupByMonth(sequences: SequenceWithRelations[]) {
  const groups: Record<string, SequenceWithRelations[]> = {};

  sequences.forEach((seq) => {
    const date = new Date(seq.eventDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(seq);
  });

  return Object.entries(groups)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, seqs]) => ({
      key,
      date: new Date(key + '-01'),
      sequences: seqs,
    }));
}

export function SequenceTimeline({ sequences }: SequenceTimelineProps) {
  const locale = useLocale();
  const t = useTranslations('triggers');

  const groupedSequences = useMemo(() => groupByMonth(sequences), [sequences]);

  return (
    <div className="space-y-8">
      {groupedSequences.map((group) => (
        <div key={group.key}>
          <h2 className="text-lg font-semibold mb-4 sticky top-32 bg-background/95 backdrop-blur py-2 z-10">
            {group.date.toLocaleDateString(locale, {
              year: 'numeric',
              month: 'long',
            })}
          </h2>

          <div className="relative pl-8 border-l-2 border-muted space-y-6">
            {group.sequences.map((sequence, index) => {
              const polarity = calculatePolarity(sequence);
              const polarityColor =
                polarity > 10
                  ? 'bg-green-500'
                  : polarity < -10
                  ? 'bg-red-500'
                  : 'bg-blue-500';

              return (
                <div key={sequence.id} className="relative">
                  <div
                    className={cn(
                      'absolute -left-[41px] w-4 h-4 rounded-full border-4 border-background',
                      polarityColor
                    )}
                  />

                  <Link href={`/${locale}/sequence/${sequence.id}`}>
                    <Card className="group overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/20">
                      <div className="flex">
                        {sequence.image && (
                          <div className="hidden md:block w-32 relative bg-muted shrink-0">
                            <Image
                              src={sequence.image}
                              alt={sequence.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        <div className="flex-1 p-4">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-xs font-medium text-muted-foreground">
                              {new Date(sequence.eventDate).toLocaleDateString(locale, {
                                weekday: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <EmotionBadge emotion={sequence.emotion} size="sm" />
                            {sequence.isCoreMemory && (
                              <Badge variant="warning" size="sm">
                                <Star className="h-3 w-3 mr-1 fill-current" />
                                Core
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                            {sequence.title}
                          </h3>

                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {sequence.summary}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              {sequence.trigger.icon} {t(sequence.trigger.key as any)}
                            </span>
                            <PolarityIndicator value={polarity} size="sm" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
