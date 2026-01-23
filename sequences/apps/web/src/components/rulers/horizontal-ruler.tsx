'use client';

import { useEffect, useState } from 'react';

type HorizontalRulerProps = {
  width?: number;
  height?: number;
  getViewport?: () => { x: number; y: number; zoom: number };
  sidebarWidth?: number;
};

export function HorizontalRuler({ width = 200, height = 200, getViewport, sidebarWidth = 256 }: HorizontalRulerProps) {
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

  return (
    <div 
      className="fixed top-12 left-0 right-0 z-30 pointer-events-none h-8"
      style={{ paddingLeft: `${sidebarWidth}px` }}
    >
      <div
        className="absolute inset-0 bg-background border-b border-border"
        style={{ width: `${width}px` }}
      >
        <div className="absolute inset-0">
          {horizontalTicks}
        </div>
        {/* Zero point marker - left edge */}
        <div className="absolute bottom-0 left-0 w-0.5 h-full bg-primary" />
      </div>
    </div>
  );
}
