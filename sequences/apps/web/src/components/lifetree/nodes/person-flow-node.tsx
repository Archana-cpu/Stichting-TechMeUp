'use client';

import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { cn } from '@seq/ui';
import { User, Film, Users, Heart, Briefcase, Handshake } from 'lucide-react';
import type { Person, PersonRelation, SequencePerson } from '@seq/database';
import { ResizableImage } from './resizable-image';

// ============================================================================
// TYPES
// ============================================================================

export type PersonWithRelations = Person & {
  _count: { sequences: number };
  relationsFrom: PersonRelation[];
  relationsTo: PersonRelation[];
};

export type PersonFlowNodeData = {
  person: PersonWithRelations;
};

// Relationship colors
const RELATIONSHIP_COLORS: Record<string, string> = {
  family: '0 80% 50%',
  friend: '220 80% 50%',
  colleague: '160 60% 45%',
  partner: '340 80% 55%',
  acquaintance: '45 70% 50%',
  other: '0 0% 50%',
};

const RELATIONSHIP_ICONS: Record<string, any> = {
  family: Users,
  friend: Handshake,
  colleague: Briefcase,
  partner: Heart,
  acquaintance: User,
  other: User,
};

// ============================================================================
// COMPONENT - POLAROID STYLE
// ============================================================================

// Generate stable rotation based on person ID
const getRotation = (id: string) => {
  // Use ID hash to generate consistent rotation
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash = hash & hash;
  }
  return (hash % 6) - 3; // -3 to +3 degrees
};

export const PersonFlowNode = memo(
  function PersonFlowNode(props: NodeProps) {
    const { data, selected } = props;
    const nodeData = data as PersonFlowNodeData;
    const { person } = nodeData;
    const relationshipColor = RELATIONSHIP_COLORS[person.relationship] || RELATIONSHIP_COLORS.other;
    const RelationshipIcon = RELATIONSHIP_ICONS[person.relationship] || RELATIONSHIP_ICONS.other;
    const rotation = getRotation(person.id);

    return (
      <>
        <Handle type="target" position={Position.Top} className={`opacity-0! w-3! h-3!`} />
        <Handle type="target" position={Position.Left} className={`opacity-0! w-3! h-3!`} />
        
        <motion.div
          className={cn(
            'person-node cursor-grab active:cursor-grabbing transition-all duration-200',
            'bg-white dark:bg-gray-50',
            'border-4 border-gray-200 dark:border-gray-300',
            'shadow-lg hover:shadow-2xl',
            'p-2 pb-4',
            'w-[200px]',
            selected
              ? 'ring-4 ring-primary/40 shadow-2xl scale-105'
              : 'hover:scale-102'
          )}
          style={{
            transform: `rotate(${rotation}deg)`,
          }}
          whileHover={{ 
            scale: selected ? 1.05 : 1.03,
            rotate: selected ? 0 : rotation + (rotation > 0 ? -1 : 1),
            zIndex: 50
          }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Polaroid Photo Area - Resizable */}
          <div className="relative w-full mb-2">
            <ResizableImage
              src={person.image}
              alt={person.name}
              initialWidth={200}
              initialHeight={180}
              minWidth={100}
              minHeight={100}
              maxWidth={400}
              maxHeight={400}
            />
            
            {/* Relationship Badge - Overlay */}
            <div className="absolute top-2 right-2 z-20">
              <span
                className="rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap flex items-center gap-1 shadow-md backdrop-blur-sm"
                style={{
                  backgroundColor: `hsl(${relationshipColor} / 0.9)`,
                  color: 'white',
                }}
              >
                <RelationshipIcon className="h-3 w-3" />
              </span>
            </div>
          </div>

          {/* Polaroid Label Area */}
          <div className="px-2 py-1 text-center min-h-[60px] flex flex-col justify-center">
            <h3 className="font-bold text-sm text-gray-800 dark:text-gray-900 mb-1 leading-tight">
              {person.name}
            </h3>
            
            {/* Stats */}
            {person._count.sequences > 0 && (
              <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-700 mt-1">
                <Film className="h-3 w-3" />
                <span className="font-medium">{person._count.sequences}</span>
              </div>
            )}

            {/* App User Badge */}
            {person.appUserId && (
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Connected
                </span>
              </div>
            )}
          </div>
        </motion.div>
        
        <Handle type="source" position={Position.Bottom} className={`opacity-0! w-3! h-3!`} />
        <Handle type="source" position={Position.Right} className={`opacity-0! w-3! h-3!`} />
      </>
    );
  },
  // Custom comparison function for better performance
  (prevProps, nextProps) => {
    // Check if selected changed
    if (prevProps.selected !== nextProps.selected) return false;

    // Check if person data changed
    const prevData = prevProps.data as PersonFlowNodeData;
    const nextData = nextProps.data as PersonFlowNodeData;
    const prevPerson = prevData?.person;
    const nextPerson = nextData?.person;

    if (prevPerson.id !== nextPerson.id) return false;
    if (prevPerson.updatedAt !== nextPerson.updatedAt) return false;
    if (prevPerson.name !== nextPerson.name) return false;
    if (prevPerson.image !== nextPerson.image) return false;
    if (prevPerson.relationship !== nextPerson.relationship) return false;
    if (prevPerson._count.sequences !== nextPerson._count.sequences) return false;
    if (prevPerson.appUserId !== nextPerson.appUserId) return false;

    // No changes - skip re-render
    return true;
  }
);

export default PersonFlowNode;
