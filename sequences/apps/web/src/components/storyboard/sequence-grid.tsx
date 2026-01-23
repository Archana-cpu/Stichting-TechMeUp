'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Card, CardContent, Badge } from '@seq/ui';
import { Star } from 'lucide-react';
import type { Emotion, Trigger, Sequence } from '@seq/database';
import { PolarityIndicator } from '../polarity';
import { EmotionBadge } from '../emotions';

type SequenceWithRelations = Sequence & {
  emotion: Emotion;
  trigger: Trigger;
};

type SequenceGridProps = {
  sequences: SequenceWithRelations[];
};

function calculatePolarity(sequence: SequenceWithRelations): number {
  const emotionScore = sequence.emotionPolarity * sequence.emotionIntensity;
  const thoughtScore = sequence.thoughtPolarity * sequence.thoughtIntensity;
  const behaviorScore = sequence.behaviorPolarity * sequence.behaviorImpact;
  return Math.round((emotionScore + thoughtScore + behaviorScore) / 3);
}

// Asymmetric grid pattern: varying column spans for visual interest
const getGridSpan = (index: number, total: number) => {
  const patterns = [
    { cols: 'col-span-1', rows: 'row-span-1' },
    { cols: 'col-span-1', rows: 'row-span-1' },
    { cols: 'col-span-1', rows: 'row-span-1' },
    { cols: 'col-span-1', rows: 'row-span-1' },
    { cols: 'col-span-1', rows: 'row-span-1' },
  ];
  return patterns[index % patterns.length];
};

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
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function SequenceGrid({ sequences }: SequenceGridProps) {
  const locale = useLocale();
  const t = useTranslations('triggers');

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {sequences.map((sequence, index) => {
        const polarity = calculatePolarity(sequence);

        return (
          <motion.div key={sequence.id} variants={itemVariants}>
            <Link href={`/${locale}/sequence/${sequence.id}`}>
              <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/30 h-full relative">
                {/* Subtle light effect on hover */}
                <div className="absolute inset-0 bg-linear-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/0 group-hover:to-primary/5 transition-all duration-500 pointer-events-none rounded-lg" />
                
                {sequence.image && (
                  <div className="aspect-video overflow-hidden bg-muted relative">
                    <Image
                      src={sequence.image}
                      alt={sequence.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {sequence.isCoreMemory && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="absolute top-3 right-3"
                      >
                        <Badge variant="warning" size="sm" className="shadow-lg">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Core
                        </Badge>
                      </motion.div>
                    )}
                  </div>
                )}

                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <EmotionBadge emotion={sequence.emotion} size="sm" />
                    {sequence.isPublic && (
                      <Badge variant="outline" size="sm">
                        Public
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-semibold line-clamp-1 mb-2 group-hover:text-primary transition-colors">
                    {sequence.title}
                  </h3>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {sequence.summary}
                  </p>

                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <span>{sequence.trigger.icon}</span>
                      <span>{t(sequence.trigger.key as any)}</span>
                    </span>
                    <PolarityIndicator value={polarity} size="sm" />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {new Date(sequence.eventDate).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
