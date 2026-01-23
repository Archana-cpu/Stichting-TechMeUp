'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, Progress } from '@seq/ui';
import { GripVertical, Heart, MessageCircle, Users, Calendar, Lock, Globe } from 'lucide-react';
import {
  type SequenceWithRelations,
  type ViewMode,
  calculatePolarity,
  getPolarityColor,
  getPolarityGradient,
} from './types';

// ============================================================================
// PROPS
// ============================================================================

type SequenceNodeProps = {
  sequence: SequenceWithRelations;
  viewMode: ViewMode;
  isSelected?: boolean;
  onSelect?: () => void;
};

// ============================================================================
// COMPONENT
// ============================================================================

export function SequenceNode({ sequence, viewMode, isSelected, onSelect }: SequenceNodeProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sequence.id,
  });
  const t = useTranslations('emotions');
  const tTrig = useTranslations('triggers');

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const polarity = calculatePolarity(sequence);
  const polarityPercent = ((polarity + 50) / 100) * 100;
  const polarityColor = getPolarityColor(polarity);
  const polarityGradient = getPolarityGradient(polarity);

  // ============================================================================
  // TIMELINE VIEW
  // ============================================================================

  if (viewMode === 'timeline') {
    return (
      <div ref={setNodeRef} style={style} className="w-80 shrink-0">
        <Card
          className={`group h-full overflow-hidden border-2 transition-all duration-200 ${
            isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'
          }`}
          onClick={onSelect}
        >
          {/* Drag Handle */}
          <div
            className="flex cursor-grab items-center gap-2 border-b bg-muted/30 px-3 py-2 active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              {new Date(sequence.eventDate).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <div className="ml-auto">
              {sequence.isPublic ? (
                <Globe className="h-3 w-3 text-green-500" />
              ) : (
                <Lock className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Image */}
          {sequence.image && (
            <div className="relative h-44 overflow-hidden">
              <Image
                src={sequence.image}
                alt={sequence.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className={`absolute inset-0 bg-linear-to-t ${polarityGradient}`} />
            </div>
          )}

          {/* Content */}
          <CardContent className="p-4">
            {/* Emotion Badge */}
            <div className="mb-3 flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: `hsl(${sequence.emotion.colorHsl} / 0.15)`,
                  color: `hsl(${sequence.emotion.colorHsl})`,
                }}
              >
                <span className="text-sm">{sequence.emotion.icon}</span>
                {t(sequence.emotion.key as keyof typeof t)}
              </span>
            </div>

            {/* Title */}
            <Link href={`/sequence/${sequence.id}`}>
              <h3 className="line-clamp-1 text-lg font-bold transition-colors hover:text-primary">
                {sequence.title}
              </h3>
            </Link>

            {/* Summary */}
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{sequence.summary}</p>

            {/* Trigger */}
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <span>{sequence.trigger.icon}</span>
              <span>{tTrig(sequence.trigger.key as keyof typeof tTrig)}</span>
            </div>

            {/* Stats */}
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Heart className="h-4 w-4" />
                <span className="text-xs font-medium">{sequence._count.reactions}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs font-medium">{sequence._count.comments}</span>
              </div>
              {sequence.people.length > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-xs font-medium">{sequence.people.length}</span>
                </div>
              )}
            </div>

            {/* Polarity Bar */}
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted-foreground">Polarity</span>
                <span className={polarity >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {polarity > 0 ? '+' : ''}{polarity}
                </span>
              </div>
              <Progress value={polarityPercent} className="h-2" indicatorClassName={polarityColor} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // GRID VIEW
  // ============================================================================

  if (viewMode === 'grid') {
    return (
      <div ref={setNodeRef} style={style}>
        <Card
          className={`group overflow-hidden border-2 transition-all duration-200 ${
            isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50 hover:shadow-lg'
          }`}
          onClick={onSelect}
        >
          {/* Drag Handle */}
          <div
            className="flex cursor-grab items-center gap-2 border-b bg-muted/30 px-3 py-2 active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {new Date(sequence.eventDate).toLocaleDateString()}
            </span>
            <div className="ml-auto">
              {sequence.isPublic ? (
                <Globe className="h-3 w-3 text-green-500" />
              ) : (
                <Lock className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Image */}
          {sequence.image && (
            <div className="relative h-48 overflow-hidden">
              <Image
                src={sequence.image}
                alt={sequence.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className={`absolute inset-0 bg-linear-to-t ${polarityGradient}`} />
            </div>
          )}

          <CardContent className="p-4">
            {/* Emotion & Trigger */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `hsl(${sequence.emotion.colorHsl} / 0.15)`,
                  color: `hsl(${sequence.emotion.colorHsl})`,
                }}
              >
                {sequence.emotion.icon} {t(sequence.emotion.key as keyof typeof t)}
              </span>
              <span className="text-xs text-muted-foreground">
                {sequence.trigger.icon}
              </span>
            </div>

            {/* Title */}
            <Link href={`/sequence/${sequence.id}`}>
              <h3 className="font-semibold transition-colors hover:text-primary hover:underline">
                {sequence.title}
              </h3>
            </Link>

            {/* Summary */}
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{sequence.summary}</p>

            {/* Stats */}
            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Heart className="h-4 w-4" />
                <span className="text-xs">{sequence._count.reactions}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">{sequence._count.comments}</span>
              </div>
              {sequence.people.length > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">{sequence.people.length}</span>
                </div>
              )}
            </div>

            {/* Polarity */}
            <Progress value={polarityPercent} className="mt-3 h-2" indicatorClassName={polarityColor} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // LIST VIEW
  // ============================================================================

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`group overflow-hidden border-2 transition-all duration-200 ${
          isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'
        }`}
        onClick={onSelect}
      >
        <CardContent className="flex items-center gap-4 p-4">
          {/* Drag Handle */}
          <div
            className="cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Image */}
          {sequence.image && (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
              <Image src={sequence.image} alt={sequence.title} fill className="object-cover" />
            </div>
          )}

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `hsl(${sequence.emotion.colorHsl} / 0.15)`,
                  color: `hsl(${sequence.emotion.colorHsl})`,
                }}
              >
                {sequence.emotion.icon} {t(sequence.emotion.key as keyof typeof t)}
              </span>
              <span className="text-xs text-muted-foreground">{sequence.trigger.icon}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(sequence.eventDate).toLocaleDateString()}
              </span>
              {sequence.isPublic ? (
                <Globe className="h-3 w-3 text-green-500" />
              ) : (
                <Lock className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <Link href={`/sequence/${sequence.id}`}>
              <h3 className="mt-1 truncate font-semibold hover:text-primary hover:underline">
                {sequence.title}
              </h3>
            </Link>
            <p className="line-clamp-1 text-sm text-muted-foreground">{sequence.summary}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Heart className="h-4 w-4" />
              <span className="text-xs">{sequence._count.reactions}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{sequence._count.comments}</span>
            </div>
          </div>

          {/* Polarity */}
          <div className="w-24">
            <Progress value={polarityPercent} className="h-2" indicatorClassName={polarityColor} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
