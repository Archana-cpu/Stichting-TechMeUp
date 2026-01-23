'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Card, Badge } from '@seq/ui';
import { Star, ChevronRight } from 'lucide-react';
import type { Emotion, Trigger, Sequence } from '@seq/database';
import { PolarityIndicator, PolarityBar } from '../polarity';
import { EmotionBadge } from '../emotions';

type SequenceWithRelations = Sequence & {
  emotion: Emotion;
  trigger: Trigger;
};

type SequenceListProps = {
  sequences: SequenceWithRelations[];
};

function calculatePolarity(sequence: SequenceWithRelations): number {
  const emotionScore = sequence.emotionPolarity * sequence.emotionIntensity;
  const thoughtScore = sequence.thoughtPolarity * sequence.thoughtIntensity;
  const behaviorScore = sequence.behaviorPolarity * sequence.behaviorImpact;
  return Math.round((emotionScore + thoughtScore + behaviorScore) / 3);
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function SequenceList({ sequences }: SequenceListProps) {
  const locale = useLocale();
  const t = useTranslations('triggers');
  const tSeq = useTranslations('sequence');

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {sequences.map((sequence, index) => {
        const polarity = calculatePolarity(sequence);

        return (
          <motion.div key={sequence.id} variants={itemVariants}>
            <Link href={`/${locale}/sequence/${sequence.id}`} className="block">
              <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/30 relative">
                {/* Subtle light effect */}
                <div className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/0 group-hover:to-primary/5 transition-all duration-500 pointer-events-none rounded-lg" />
                
                <div className="flex items-stretch gap-0 relative z-10">
                  {sequence.image && (
                    <div className="hidden sm:block w-32 md:w-40 relative bg-muted shrink-0 overflow-hidden">
                      <Image
                        src={sequence.image}
                        alt={sequence.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  )}

                  <div className="flex-1 p-6 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <EmotionBadge emotion={sequence.emotion} size="sm" />
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          {sequence.trigger.icon} {t(sequence.trigger.key as any)}
                        </span>
                        {sequence.isCoreMemory && (
                          <Badge variant="warning" size="sm" className="gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            Core
                          </Badge>
                        )}
                        {sequence.isPublic && (
                          <Badge variant="outline" size="sm">
                            Public
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {sequence.title}
                      </h3>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {sequence.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(sequence.eventDate).toLocaleDateString(locale, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <div className="hidden md:flex items-center gap-2 min-w-0">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{tSeq('polarity')}:</span>
                          <PolarityIndicator value={polarity} size="sm" />
                        </div>
                        <div className="md:hidden flex-1">
                          <PolarityBar value={polarity} size="sm" />
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors ml-2 shrink-0" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
