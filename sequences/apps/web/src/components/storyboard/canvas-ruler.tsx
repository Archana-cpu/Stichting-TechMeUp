'use client';

import { useEffect, useState } from 'react';

type CanvasRulerProps = {
  width?: number;
  height?: number;
  getViewport?: () => { x: number; y: number; zoom: number };
};

export function CanvasRuler({ width = 200, height = 200, getViewport }: CanvasRulerProps) {
  const [zoom, setZoom] = useState(1);
  const [viewport, setViewport] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!getViewport) return;

    const updateRuler = () => {
      const vp = getViewport();
      setZoom(vp.zoom);
      setViewport({ x: vp.x, y: vp.y });
    };

    const interval = setInterval(updateRuler, 100);
    updateRuler();

    return () => clearInterval(interval);
  }, [getViewport]);

  // Calculate tick positions - Figma style grid
  const tickInterval = Math.max(10, Math.floor(20 / zoom));
  const startX = Math.floor(-viewport.x / zoom / tickInterval) * tickInterval;
  const endX = startX + Math.ceil(width / zoom / tickInterval) * tickInterval;
  const startY = Math.floor(-viewport.y / zoom / tickInterval) * tickInterval;
  const endY = startY + Math.ceil(height / zoom / tickInterval) * tickInterval;

  const horizontalTicks = [];
  for (let x = startX; x <= endX; x += tickInterval) {
    const screenX = (x * zoom + viewport.x) % (width + tickInterval * 2);
    if (screenX >= 0 && screenX <= width) {
      horizontalTicks.push(
        <div
          key={x}
          className="absolute top-0 bottom-0 w-px bg-border"
          style={{ left: `${screenX}px` }}
        >
          <span className="absolute -top-5 left-0.5 text-[10px] text-muted-foreground whitespace-nowrap">
            {Math.round(x)}
          </span>
        </div>
      );
    }
  }

  const verticalTicks = [];
  for (let y = startY; y <= endY; y += tickInterval) {
    const screenY = (y * zoom + viewport.y) % (height + tickInterval * 2);
    if (screenY >= 0 && screenY <= height) {
      verticalTicks.push(
        <div
          key={y}
          className="absolute left-0 right-0 h-px bg-border"
          style={{ top: `${screenY}px` }}
        >
          <span className="absolute -left-12 top-0.5 text-[10px] text-muted-foreground whitespace-nowrap">
            {Math.round(y)}
          </span>
        </div>
      );
    }
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 pointer-events-none">
      {/* Horizontal Ruler - Bottom, box style */}
      <div
        className="absolute bottom-0 right-0 bg-background border border-border"
        style={{ width: `${width}px`, height: '32px' }}
      >
        <div className="absolute inset-0">
          {horizontalTicks}
        </div>
        {/* Zero point marker - right edge */}
        <div className="absolute bottom-0 right-0 w-0.5 h-full bg-primary" />
      </div>

      {/* Vertical Ruler - Right, box style */}
      <div
        className="absolute bottom-0 right-0 bg-background border border-border"
        style={{ width: '32px', height: `${height}px` }}
      >
        <div className="absolute inset-0">
          {verticalTicks}
        </div>
        {/* Zero point marker - bottom edge */}
        <div className="absolute bottom-0 right-0 h-0.5 w-full bg-primary" />
      </div>

      {/* Corner box - Zero point at bottom-right */}
      <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary/20 border-t border-l border-primary" />
    </div>
  );
}
