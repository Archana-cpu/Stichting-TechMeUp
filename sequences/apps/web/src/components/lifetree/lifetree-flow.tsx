'use client';

import { useCallback, useMemo, useState, useRef } from 'react';
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
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTranslations } from 'next-intl';
import { Button } from '@seq/ui';
import { Plus, Users } from 'lucide-react';
import Link from 'next/link';

import { PersonFlowNode, type PersonFlowNodeData, type PersonWithRelations } from './nodes/person-flow-node';
import { RelationEdge, type RelationEdgeData } from './edges/relation-edge';
import { CanvasToolbar } from '../storyboard/canvas-toolbar';
import { CanvasRuler } from '../storyboard/canvas-ruler';

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
// NODE & EDGE TYPES
// ============================================================================

const nodeTypes = {
  person: PersonFlowNode,
};

const edgeTypes = {
  relation: RelationEdge,
};

// ============================================================================
// PROPS
// ============================================================================

type LifeTreeFlowProps = {
  people: PersonWithRelations[];
};

// ============================================================================
// COMPONENT
// ============================================================================

export function LifeTreeFlow({ people }: LifeTreeFlowProps) {
  const t = useTranslations('people');

  // Debounced save function - saves position to database via API
  const debouncedSaveRef = useRef(
    debounce(async (id: string, x: number, y: number) => {
      try {
        await fetch(`/api/people/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ positionX: x, positionY: y }),
        });
      } catch (error) {
        console.error('Failed to save position:', error);
      }
    }, 500)
  );

  // Generate initial node positions in a scattered/polaroid layout
  const initialNodes: Node<PersonFlowNodeData>[] = useMemo(() => {
    const NODE_WIDTH = 200;
    const NODE_HEIGHT = 260;
    const GAP_X = 100;
    const GAP_Y = 120;

    // Group by relationship type for better layout
    const byRelationship = people.reduce((acc, person) => {
      const rel = person.relationship || 'other';
      if (!acc[rel]) acc[rel] = [];
      acc[rel].push(person);
      return acc;
    }, {} as Record<string, PersonWithRelations[]>);

    const relationshipOrder = ['family', 'partner', 'friend', 'colleague', 'acquaintance', 'other'];
    let currentY = 0;
    const nodes: Node<PersonFlowNodeData>[] = [];

    relationshipOrder.forEach((relType) => {
      const group = byRelationship[relType] || [];
      if (group.length === 0) return;

      group.forEach((person, index) => {
        // Use stored position if available, otherwise create scattered layout
        const x = person.positionX ?? (index * (NODE_WIDTH + GAP_X) + Math.random() * 50 - 25);
        const y = person.positionY ?? (currentY + Math.random() * 40 - 20);

        nodes.push({
          id: person.id,
          type: 'person',
          position: { x, y },
          data: { person },
        });
      });

      if (group.some((p) => p.positionY === null)) {
        currentY += NODE_HEIGHT + GAP_Y;
      }
    });

    return nodes;
  }, [people]);

  // Build edges from relations
  const initialEdges: Edge<RelationEdgeData>[] = useMemo(() => {
    const edges: Edge<RelationEdgeData>[] = [];
    const addedPairs = new Set<string>();

    people.forEach((person) => {
      person.relationsFrom?.forEach((relation) => {
        const pairKey = [person.id, relation.toPersonId].sort().join('-');
        if (!addedPairs.has(pairKey)) {
          addedPairs.add(pairKey);
          edges.push({
            id: `${person.id}-${relation.toPersonId}`,
            source: person.id,
            target: relation.toPersonId,
            type: 'relation',
            data: { relationType: relation.relationType },
            animated: false,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 15,
              height: 15,
            },
          });
        }
      });
    });

    return edges;
  }, [people]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle node drag end - save position
  const handleNodesChange: OnNodesChange<Node<PersonFlowNodeData>> = useCallback(
    (changes: NodeChange<Node<PersonFlowNodeData>>[]) => {
      onNodesChange(changes);

      // Save position when dragging ends
      changes.forEach((change) => {
        if (change.type === 'position' && change.position && !change.dragging) {
          debouncedSaveRef.current(change.id, change.position.x, change.position.y);
        }
      });
    },
    [onNodesChange]
  );

  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Empty state
  if (people.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-medium">{t('title')}</h3>
          <p className="text-muted-foreground max-w-sm">
            {t('treeDescription')}
          </p>
          <Button asChild>
            <Link href="/lifetree/people">
              <Plus className="mr-2 h-4 w-4" />
              {t('addPerson')}
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
          <Link href="/lifetree/people">
            <Plus className="h-4 w-4 mr-1.5" />
            <span className="text-sm">{t('addPerson')}</span>
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
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.05}
          maxZoom={3}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          proOptions={{ hideAttribution: true }}
          panOnScroll={true}
          panOnScrollMode="free"
          selectionOnDrag={false}
          panOnDrag={[1, 2]}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          translateExtent={[[-Infinity, -Infinity], [Infinity, Infinity]]}
          nodeExtent={undefined}
          snapToGrid={false}
          onlyRenderVisibleElements={false}
          deleteKeyCode={null}
          multiSelectionKeyCode={null}
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

export default LifeTreeFlow;
