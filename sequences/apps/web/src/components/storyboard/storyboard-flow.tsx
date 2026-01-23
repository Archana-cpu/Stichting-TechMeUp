'use client';

import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type OnNodesChange,
  type NodeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTranslations } from 'next-intl';
import { Button } from '@seq/ui';
import { Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { InstaxNode, type InstaxNodeData } from './nodes/instax-node';
import { CanvasToolbar } from './canvas-toolbar';
import { CanvasRuler } from './canvas-ruler';
import { updateSequencePosition } from '@/app/actions';
import type { Emotion, Trigger, Sequence } from '@seq/database';

// ============================================================================
// TYPES
// ============================================================================

type SequenceWithRelations = Sequence & {
  emotion: Emotion;
  trigger: Trigger;
  positionX?: number | null;
  positionY?: number | null;
};

type StoryboardFlowProps = {
  sequences: SequenceWithRelations[];
};

// Debounce helper
function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// ============================================================================
// NODE TYPES REGISTRATION
// ============================================================================

const nodeTypes = {
  instax: InstaxNode,
};

// ============================================================================
// COMPONENT
// ============================================================================

export function StoryboardFlow({ sequences }: StoryboardFlowProps) {
  const t = useTranslations('storyboard');
  const tSeq = useTranslations('sequence');

  // Debounced save function - saves position to database
  const debouncedSaveRef = useRef(
    debounce(async (id: string, x: number, y: number) => {
      try {
        await updateSequencePosition({ id, positionX: x, positionY: y });
      } catch (error) {
        console.error('Failed to save position:', error);
      }
    }, 500)
  );

  // Generate initial node positions - use saved positions if available, otherwise grid layout
  const initialNodes: Node<InstaxNodeData>[] = useMemo(() => {
    const CARD_WIDTH = 200;
    const CARD_HEIGHT = 280;
    const GAP_X = 48;
    const GAP_Y = 32;
    const COLS = Math.max(3, Math.ceil(Math.sqrt(sequences.length)));

    return sequences.map((sequence, index) => {
      // Use saved position if available
      if (sequence.positionX != null && sequence.positionY != null) {
        return {
          id: sequence.id,
          type: 'instax',
          position: {
            x: sequence.positionX,
            y: sequence.positionY,
          },
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          data: { sequence },
        };
      }

      // Otherwise calculate grid position
      const col = index % COLS;
      const row = Math.floor(index / COLS);

      // Add slight randomness to positions for organic feel
      const randomOffsetX = (Math.random() - 0.5) * 16;
      const randomOffsetY = (Math.random() - 0.5) * 16;

      return {
        id: sequence.id,
        type: 'instax',
        position: {
          x: col * (CARD_WIDTH + GAP_X) + randomOffsetX,
          y: row * (CARD_HEIGHT + GAP_Y) + randomOffsetY,
        },
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        data: { sequence },
      };
    });
  }, [sequences]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Handle node changes - save position and dimensions
  const handleNodesChange: OnNodesChange<Node<InstaxNodeData>> = useCallback(
    (changes: NodeChange<Node<InstaxNodeData>>[]) => {
      onNodesChange(changes);

      // Check for position and dimension changes and save
      changes.forEach((change) => {
        if (change.type === 'position' && change.position && !change.dragging) {
          const node = nodes.find(n => n.id === change.id);
          debouncedSaveRef.current(change.id, change.position.x, change.position.y);
        }
        if (change.type === 'dimensions' && change.dimensions) {
          // Save dimensions if needed
        }
      });
    },
    [onNodesChange, nodes]
  );

  // React Flow instance
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  if (sequences.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-medium">{t('empty')}</h3>
          <p className="text-muted-foreground max-w-sm">
            {t('emptyDescription')}
          </p>
          <Button asChild>
            <Link href="/create">
              <Plus className="mr-2 h-4 w-4" />
              {tSeq('newSequence')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden relative">
      {/* Floating Controls */}
      <div className="absolute top-4 right-4 z-10">
        <Button asChild size="sm" className="h-8 px-3">
          <Link href="/create">
            <Plus className="h-4 w-4 mr-1.5" />
            <span className="text-sm">{tSeq('newSequence')}</span>
          </Link>
        </Button>
      </div>

      {/* Canvas */}
      <div className="w-full h-full pb-16 min-h-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={setReactFlowInstance}
          nodeTypes={nodeTypes}
          edgeTypes={{}}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          proOptions={{ hideAttribution: true }}
          onlyRenderVisibleElements
          panOnScroll
          selectionOnDrag
          panOnDrag={[1, 2]}
          selectionMode={1}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
          selectNodesOnDrag={false}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="hsl(var(--muted-foreground) / 0.2)"
          />
        </ReactFlow>
      </div>

      {/* Toolbar */}
      <CanvasToolbar />

      {/* Ruler - Bottom Right */}
      <CanvasRuler 
        width={200} 
        height={200}
        getViewport={() => reactFlowInstance?.getViewport() || { x: 0, y: 0, zoom: 1 }}
      />
    </div>
  );
}

export default StoryboardFlow;
