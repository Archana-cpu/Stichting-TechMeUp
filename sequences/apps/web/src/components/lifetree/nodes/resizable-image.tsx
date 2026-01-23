'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';

type ResizableImageProps = {
  src: string | null;
  alt: string;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
};

export function ResizableImage({
  src,
  alt,
  initialWidth = 200,
  initialHeight = 180,
  minWidth = 100,
  minHeight = 100,
  maxWidth = 500,
  maxHeight = 500,
}: ResizableImageProps) {
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState<'tl' | 'tr' | 'bl' | 'br' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent, corner: 'tl' | 'tr' | 'bl' | 'br') => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeCorner(corner);
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      width,
      height,
    };
  }, [width, height]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeCorner) return;

    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;

    let newWidth = startPosRef.current.width;
    let newHeight = startPosRef.current.height;

    // Adjust based on corner
    if (resizeCorner === 'tr' || resizeCorner === 'br') {
      newWidth = Math.max(minWidth, Math.min(maxWidth, startPosRef.current.width + deltaX));
    } else {
      newWidth = Math.max(minWidth, Math.min(maxWidth, startPosRef.current.width - deltaX));
    }

    if (resizeCorner === 'bl' || resizeCorner === 'br') {
      newHeight = Math.max(minHeight, Math.min(maxHeight, startPosRef.current.height + deltaY));
    } else {
      newHeight = Math.max(minHeight, Math.min(maxHeight, startPosRef.current.height - deltaY));
    }

    setWidth(newWidth);
    setHeight(newHeight);
  }, [isResizing, resizeCorner, minWidth, minHeight, maxWidth, maxHeight]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setResizeCorner(null);
  }, []);

  // Global mouse handlers
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden border border-gray-300"
      style={{ width, height, minWidth: minWidth, minHeight: minHeight }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={`${width}px`}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-200 to-gray-300" />
      )}

      {/* Resize handles - 4 corners */}
      {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => {
        const positions = {
          tl: { top: -4, left: -4 },
          tr: { top: -4, right: -4 },
          bl: { bottom: -4, left: -4 },
          br: { bottom: -4, right: -4 },
        };
        
        const cursors = {
          tl: 'nwse-resize',
          tr: 'nesw-resize',
          bl: 'nesw-resize',
          br: 'nwse-resize',
        };

        return (
          <div
            key={corner}
            className="absolute w-4 h-4 bg-primary rounded-full border-2 border-white z-10 hover:scale-110 transition-transform"
            style={{ ...positions[corner], cursor: cursors[corner] }}
            onMouseDown={(e) => handleMouseDown(e, corner)}
          />
        );
      })}
    </div>
  );
}
