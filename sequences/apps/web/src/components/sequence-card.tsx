'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, Progress } from '@seq/ui';
import { GripVertical, Heart, MessageCircle, Users } from 'lucide-react';
import type { Emotion, Trigger, Sequence, Person, SequencePerson } from '@seq/database';

type SequenceWithRelations = Sequence & {
  emotion: Emotion;
  trigger: Trigger;
  people: (SequencePerson & { person: Person })[];
  _count: { reactions: number; comments: number };
};

type SequenceCardProps = {
  sequence: SequenceWithRelations;
  viewMode: 'grid' | 'list' | 'timeline';
};

export function SequenceCard({ sequence, viewMode }: SequenceCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sequence.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const polarity =
    (sequence.emotionPolarity * sequence.emotionIntensity +
      sequence.thoughtPolarity * sequence.thoughtIntensity +
      sequence.behaviorPolarity * sequence.behaviorImpact) /
    3;

  const polarityPercent = ((polarity + 50) / 100) * 100;

  const polarityColor =
    polarity > 15
      ? 'bg-green-500'
      : polarity > 0
        ? 'bg-green-400'
        : polarity === 0
          ? 'bg-blue-500'
          : polarity > -15
            ? 'bg-red-400'
            : 'bg-red-500';

  if (viewMode === 'timeline') {
    return (
      <div ref={setNodeRef} style={style} className="w-64 shrink-0">
        <Card className="h-full overflow-hidden">
          <div className="flex cursor-grab items-center border-b bg-muted/50 px-2 py-1" {...attributes} {...listeners}>
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <span className="ml-2 text-xs text-muted-foreground">
              {new Date(sequence.eventDate).toLocaleDateString()}
            </span>
          </div>
          {sequence.image && (
            <div className="relative h-32">
              <Image src={sequence.image} alt={sequence.title} fill className="object-cover" />
            </div>
          )}
          <CardContent className="p-3">
            <div className="mb-2 flex items-center gap-1">
              <span className="text-lg">{sequence.emotion.icon}</span>
              <span className="text-xs" style={{ color: `hsl(${sequence.emotion.colorHsl})` }}>
                {sequence.emotion.key}
              </span>
            </div>
            <Link href={`/sequence/${sequence.id}`}>
              <h3 className="line-clamp-1 font-semibold hover:underline">{sequence.title}</h3>
            </Link>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{sequence.summary}</p>
            <Progress value={polarityPercent} className="mt-2 h-1" indicatorClassName={polarityColor} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="overflow-hidden">
        <div className="flex cursor-grab items-center border-b bg-muted/50 px-3 py-2" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            {new Date(sequence.eventDate).toLocaleDateString()}
          </span>
        </div>
        {sequence.image && viewMode === 'grid' && (
          <div className="relative h-40">
            <Image src={sequence.image} alt={sequence.title} fill className="object-cover" />
          </div>
        )}
        <CardContent className={viewMode === 'list' ? 'flex items-center gap-4 p-4' : 'p-4'}>
          {sequence.image && viewMode === 'list' && (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded">
              <Image src={sequence.image} alt={sequence.title} fill className="object-cover" />
            </div>
          )}
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span
                className="rounded-full px-2 py-0.5 text-xs"
                style={{
                  backgroundColor: `hsl(${sequence.emotion.colorHsl} / 0.2)`,
                  color: `hsl(${sequence.emotion.colorHsl})`,
                }}
              >
                {sequence.emotion.icon} {sequence.emotion.key}
              </span>
              <span className="text-xs text-muted-foreground">{sequence.trigger.icon} {sequence.trigger.key}</span>
            </div>
            <Link href={`/sequence/${sequence.id}`}>
              <h3 className="font-semibold hover:underline">{sequence.title}</h3>
            </Link>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{sequence.summary}</p>
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
            <Progress value={polarityPercent} className="mt-3 h-2" indicatorClassName={polarityColor} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
