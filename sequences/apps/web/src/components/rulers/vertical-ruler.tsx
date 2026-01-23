'use client';

import { useEffect, useState } from 'react';

type VerticalRulerProps = {
  width?: number;
  height?: number;
  getViewport?: () => { x: number; y: number; zoom: number };
};

export function VerticalRuler({ width = 200, height = 200, getViewport }: VerticalRulerProps) {
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
  const startY = Math.floor(-viewport.y / zoom / tickInterval) * tickInterval;
  const endY = startY + Math.ceil(height / zoom / tickInterval) * tickInterval;

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
    <div className="fixed right-0 top-0 bottom-0 z-30 pointer-events-none" style={{ width: '32px' }}>
      <div
        className="absolute inset-0 bg-background border-l border-border"
        style={{ height: `${height}px`, top: '48px' }}
      >
        <div className="absolute inset-0">
          {verticalTicks}
        </div>
        {/* Zero point marker - bottom edge */}
        <div className="absolute bottom-0 right-0 h-0.5 w-full bg-primary" />
      </div>
    </div>
  );
}
