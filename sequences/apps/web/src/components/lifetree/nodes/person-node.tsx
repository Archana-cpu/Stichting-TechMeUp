'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import Image from 'next/image';
import { cn } from '@seq/ui';
import { User } from 'lucide-react';
import type { Person } from '@seq/database';

// ============================================================================
// TYPES
// ============================================================================

export type PersonNodeData = {
  person: Person;
  sequenceCount?: number;
};

// ============================================================================
// RELATIONSHIP COLORS
// ============================================================================

const relationshipColors: Record<string, string> = {
  family: 'from-rose-500/20 to-rose-600/10 border-rose-500/30',
  friend: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  colleague: 'from-slate-500/20 to-slate-600/10 border-slate-500/30',
  partner: 'from-pink-500/20 to-pink-600/10 border-pink-500/30',
  acquaintance: 'from-gray-500/20 to-gray-600/10 border-gray-500/30',
  other: 'from-violet-500/20 to-violet-600/10 border-violet-500/30',
};

const relationshipIcons: Record<string, string> = {
  family: '👨‍👩‍👧‍👦',
  friend: '🤝',
  colleague: '💼',
  partner: '❤️',
  acquaintance: '👋',
  other: '👤',
};

// ============================================================================
// COMPONENT
// ============================================================================

export const PersonNode = memo(function PersonNode({
  data,
  selected,
}: NodeProps) {
  const nodeData = data as PersonNodeData;
  const { person, sequenceCount = 0 } = nodeData;
  const relationship = person.relationship || 'other';
  const colorClass = relationshipColors[relationship] || relationshipColors.other;
  const icon = relationshipIcons[relationship] || relationshipIcons.other;

  return (
    <>
      <Handle type="target" position={Position.Top} className="opacity-0!" />
      <Handle type="target" position={Position.Left} className="opacity-0!" />
      <div
        className={cn(
          'person-node cursor-grab active:cursor-grabbing transition-all duration-200',
          'bg-gradient-to-br border-2 rounded-2xl p-4 min-w-[140px]',
          colorClass,
          selected && 'ring-2 ring-primary shadow-2xl scale-105'
        )}
      >
        {/* Avatar */}
        <div className="relative w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-muted ring-4 ring-background">
          {person.image ? (
            <Image
              src={person.image}
              alt={person.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Name */}
        <p className="font-medium text-sm text-center line-clamp-1 text-foreground">
          {person.name}
        </p>

        {/* Relationship badge */}
        <div className="flex items-center justify-center gap-1 mt-2">
          <span className="text-sm">{icon}</span>
          <span className="text-xs text-muted-foreground capitalize">
            {relationship}
          </span>
        </div>

        {/* Sequence count */}
        {sequenceCount > 0 && (
          <div className="text-center mt-2">
            <span className="text-xs text-muted-foreground">
              {sequenceCount} anı
            </span>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0!" />
      <Handle type="source" position={Position.Right} className="opacity-0!" />
    </>
  );
});

PersonNode.displayName = 'PersonNode';
