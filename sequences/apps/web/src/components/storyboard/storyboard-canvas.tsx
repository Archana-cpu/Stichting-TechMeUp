'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, Progress, Button } from '@seq/ui';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  GripVertical,
  Plus,
  Heart,
  MessageCircle,
  Users,
} from 'lucide-react';
import type { SequenceWithRelations, CanvasLayout, NodePosition } from './types';
import { calculatePolarity, getPolarityColor, getPolarityGradient } from './types';

// ============================================================================
// PROPS
// ============================================================================

type StoryboardCanvasProps = {
  sequences: SequenceWithRelations[];
  layout: CanvasLayout;
  onReorder?: (sequences: { id: string; order: number }[]) => void;
};

// ============================================================================
// COMPONENT
// ============================================================================

export function StoryboardCanvas({ sequences, layout, onReorder }: StoryboardCanvasProps) {
  const t = useTranslations('emotions');
  const tCommon = useTranslations('common');
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [nodePositions, setNodePositions] = useState<NodePosition[]>([]);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // ============================================================================
  // INITIALIZE NODE POSITIONS
  // ============================================================================

  useEffect(() => {
    if (sequences.length === 0) return;

    const positions: NodePosition[] = sequences.map((seq, index) => {
      if (layout === 'horizontal') {
        return { id: seq.id, x: index * 340, y: 0 };
      } else if (layout === 'vertical') {
        return { id: seq.id, x: 0, y: index * 300 };
      } else {
        const cols = Math.ceil(Math.sqrt(sequences.length));
        const row = Math.floor(index / cols);
        const col = index % cols;
        return { id: seq.id, x: col * 340, y: row * 300 };
      }
    });

    setNodePositions(positions);
  }, [sequences, layout]);

  // ============================================================================
  // ZOOM HANDLERS
  // ============================================================================

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.3));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // ============================================================================
  // PAN HANDLERS
  // ============================================================================

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains('canvas-bg')) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    },
    [pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      }
      if (draggingNode) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const x = (e.clientX - rect.left - pan.x) / zoom - dragOffset.x;
          const y = (e.clientY - rect.top - pan.y) / zoom - dragOffset.y;
          setNodePositions((prev) =>
            prev.map((pos) => (pos.id === draggingNode ? { ...pos, x, y } : pos))
          );
        }
      }
    },
    [isPanning, panStart, draggingNode, dragOffset, pan, zoom]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingNode(null);
  }, []);

  // ============================================================================
  // NODE DRAG HANDLERS
  // ============================================================================

  const handleNodeDragStart = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    const nodePos = nodePositions.find((p) => p.id === nodeId);
    if (rect && nodePos) {
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;
      setDragOffset({ x: mouseX - nodePos.x, y: mouseY - nodePos.y });
      setDraggingNode(nodeId);
    }
  };

  // ============================================================================
  // WHEEL ZOOM
  // ============================================================================

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((z) => Math.max(0.3, Math.min(2, z + delta)));
    }
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Rulers */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-card/80 border-b border-border z-10" />
      <div className="absolute top-0 left-0 bottom-0 w-6 bg-card/80 border-r border-border z-10" />
      
      {/* Canvas Controls */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-lg border bg-background/90 p-2 shadow-lg backdrop-blur">
        <Button variant="ghost" size="icon" onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="min-w-16 text-center text-sm font-medium">{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="icon" onClick={handleZoomIn} title="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="mx-1 h-6 w-px bg-border" />
        <Button variant="ghost" size="icon" onClick={handleResetZoom} title="Reset View">
          <Maximize className="h-4 w-4" />
        </Button>
      </div>

      {/* Canvas Hint */}
      <div className="absolute bottom-4 left-4 z-10 rounded-lg border bg-background/90 px-3 py-2 text-xs text-muted-foreground backdrop-blur">
        <span className="font-medium">Ctrl + Scroll</span> to zoom • <span className="font-medium">Drag</span> to pan
      </div>

      {/* Canvas Area */}
      <div
        ref={containerRef}
        className="canvas-bg h-full w-full cursor-grab active:cursor-grabbing"
        style={{
          backgroundImage: `
            radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)
          `,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Nodes Container */}
        <div
          className="relative h-full w-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {sequences.map((sequence) => {
            const pos = nodePositions.find((p) => p.id === sequence.id);
            if (!pos) return null;

            const polarity = calculatePolarity(sequence);
            const polarityPercent = ((polarity + 50) / 100) * 100;
            const polarityColor = getPolarityColor(polarity);
            const polarityGradient = getPolarityGradient(polarity);

            return (
              <div
                key={sequence.id}
                className={`absolute w-80 ${draggingNode === sequence.id ? 'z-50' : 'z-10'}`}
                style={{
                  left: pos.x,
                  top: pos.y,
                  cursor: draggingNode === sequence.id ? 'grabbing' : 'default',
                }}
              >
                <Card className="overflow-hidden border-2 border-transparent shadow-xl transition-all hover:border-primary/30 hover:shadow-2xl">
                  {/* Drag Handle */}
                  <div
                    className="flex cursor-grab items-center gap-2 border-b bg-muted/50 px-3 py-2 active:cursor-grabbing"
                    onMouseDown={(e) => handleNodeDragStart(sequence.id, e)}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(sequence.eventDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Image */}
                  {sequence.image && (
                    <div className="relative h-40">
                      <Image src={sequence.image} alt={sequence.title} fill className="object-cover" />
                      <div className={`absolute inset-0 bg-linear-to-t ${polarityGradient}`} />
                    </div>
                  )}

                  {/* Content */}
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `hsl(${sequence.emotion.colorHsl} / 0.15)`,
                          color: `hsl(${sequence.emotion.colorHsl})`,
                        }}
                      >
                        {sequence.emotion.icon} {t(sequence.emotion.key as keyof typeof t)}
                      </span>
                    </div>

                    <Link href={`/sequence/${sequence.id}`}>
                      <h3 className="line-clamp-1 font-semibold hover:text-primary hover:underline">
                        {sequence.title}
                      </h3>
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
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
