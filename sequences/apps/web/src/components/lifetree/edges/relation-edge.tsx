'use client';

import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';

// ============================================================================
// TYPES
// ============================================================================

export type RelationEdgeData = {
  relationType: string;
};

// Relation type colors
const RELATION_COLORS: Record<string, string> = {
  parent: 'hsl(0 80% 50%)',
  child: 'hsl(0 80% 50%)',
  sibling: 'hsl(30 80% 50%)',
  spouse: 'hsl(340 80% 55%)',
  friend: 'hsl(220 80% 50%)',
  colleague: 'hsl(160 60% 45%)',
  mentor: 'hsl(280 70% 55%)',
  other: 'hsl(0 0% 50%)',
};

// ============================================================================
// COMPONENT
// ============================================================================

export const RelationEdge = memo(function RelationEdge(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected,
    style,
  } = props;
  const relationType = (data as RelationEdgeData)?.relationType || 'other';
  const color = RELATION_COLORS[relationType] || RELATION_COLORS.other;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          ...(style as React.CSSProperties),
          stroke: selected ? 'hsl(var(--primary))' : color,
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: relationType === 'friend' ? '5 5' : undefined,
        }}
      />
      
      {/* Edge Label */}
      <EdgeLabelRenderer>
        <div
          className="edge-label pointer-events-auto rounded-full bg-background/90 backdrop-blur px-2 py-0.5 text-[10px] font-medium border border-border shadow-sm"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            color: color,
          }}
        >
          {relationType}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

export default RelationEdge;
