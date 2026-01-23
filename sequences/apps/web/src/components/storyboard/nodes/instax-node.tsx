'use client';

import { memo, useMemo } from 'react';
import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/react';
import Image from 'next/image';
import Link from 'next/link';
import { Camera } from 'lucide-react';
import { cn } from '@seq/ui';
import type { Emotion, Trigger, Sequence } from '@seq/database';

export type InstaxNodeData = {
  sequence: Sequence & {
    emotion: Emotion;
    trigger: Trigger;
  };
};

export const InstaxNode = memo(
  function InstaxNode({ data, selected, id }: NodeProps<InstaxNodeData>) {
    const { sequence } = data;

    const rotation = useMemo(() => (Math.random() - 0.5) * 6, []);

    const emotionColor = useMemo(
      () => sequence.emotion?.colorHsl || '0 0% 50%',
      [sequence.emotion?.colorHsl]
    );

    const formattedDate = useMemo(
      () =>
        new Date(sequence.eventDate).toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      [sequence.eventDate]
    );

    return (
      <>
        <Handle type="target" position={Position.Left} className="opacity-0 w-2 h-2" />
        
        <div
          className={cn(
            'instax-card relative cursor-grab active:cursor-grabbing',
            selected && 'ring-2 ring-primary ring-offset-2'
          )}
          style={{ 
            transform: `rotate(${rotation}deg)`,
            width: '100%',
            height: '100%',
            minWidth: '200px',
            minHeight: '280px'
          }}
        >
          {selected && (
            <NodeResizer
              minWidth={160}
              minHeight={240}
              maxWidth={480}
              maxHeight={720}
              keepAspectRatio={false}
              handleClassName="bg-primary border-2 border-background rounded w-4 h-4"
              lineClassName="border-primary"
            />
          )}

          <div className="w-full h-full flex flex-col">
            {/* Photo Area - responsive to container */}
            <div className="flex-1 min-h-[160px] bg-muted rounded overflow-hidden relative">
              {sequence.image ? (
                <Image
                  src={sequence.image}
                  alt={sequence.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 480px) 480px, 480px"
                  loading="lazy"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10"
                  style={{ backgroundColor: `hsl(${emotionColor} / 0.1)` }}
                >
                  <Camera className="h-16 w-16 text-muted-foreground/40" />
                </div>
              )}

              {/* Emotion Badge */}
              <div
                className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm flex items-center gap-1 z-10"
                style={{
                  backgroundColor: `hsl(${emotionColor} / 0.85)`,
                  color: 'white',
                }}
              >
                <span className="text-sm">{sequence.emotion.icon}</span>
              </div>
            </div>

            {/* Caption Area */}
            <div className="mt-3 text-center space-y-1 px-1 pb-12">
              <Link
                href={`/sequence/${sequence.id}`}
                className="font-medium text-sm line-clamp-1 hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {sequence.title}
              </Link>
              <p className="text-xs text-muted-foreground">{formattedDate}</p>
            </div>
          </div>
        </div>

        <Handle type="source" position={Position.Right} className="opacity-0 w-2 h-2" />
      </>
    );
  },
  // Custom comparison function for better performance
  (prevProps, nextProps) => {
    // Check if selected changed
    if (prevProps.selected !== nextProps.selected) return false;

    // Check if sequence data changed (compare by id and updatedAt)
    const prevSeq = prevProps.data.sequence;
    const nextSeq = nextProps.data.sequence;

    if (prevSeq.id !== nextSeq.id) return false;
    if (prevSeq.updatedAt !== nextSeq.updatedAt) return false;
    if (prevSeq.title !== nextSeq.title) return false;
    if (prevSeq.image !== nextSeq.image) return false;
    if (prevSeq.emotion?.colorHsl !== nextSeq.emotion?.colorHsl) return false;

    // No changes - skip re-render
    return true;
  }
);

export default InstaxNode;
