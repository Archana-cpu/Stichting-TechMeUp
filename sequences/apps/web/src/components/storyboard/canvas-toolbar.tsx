'use client';

import { useState } from 'react';
import { Button } from '@seq/ui';
import { Lightbulb, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { cn } from '@seq/ui';

type ConnectionTool = 'light-rope' | 'one-way-arrow' | 'two-way-arrow' | null;

type CanvasToolbarProps = {
  onToolSelect?: (tool: ConnectionTool) => void;
  selectedTool?: ConnectionTool;
};

export function CanvasToolbar({ onToolSelect, selectedTool }: CanvasToolbarProps) {
  const [activeTool, setActiveTool] = useState<ConnectionTool>(selectedTool || null);

  const handleToolClick = (tool: ConnectionTool) => {
    const newTool = activeTool === tool ? null : tool;
    setActiveTool(newTool);
    onToolSelect?.(newTool);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-border bg-background/95 backdrop-blur-xl supports-backdrop-filter:bg-background/80 md:left-16">
      <div className="flex h-full items-center justify-center gap-2 px-4 max-w-[1920px] mx-auto">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 gap-2 px-3',
              activeTool === 'light-rope' && 'bg-primary text-primary-foreground'
            )}
            onClick={() => handleToolClick('light-rope')}
            title="Işıklı İp"
          >
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">Işıklı İp</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 gap-2 px-3',
              activeTool === 'one-way-arrow' && 'bg-primary text-primary-foreground'
            )}
            onClick={() => handleToolClick('one-way-arrow')}
            title="Tek Yönlü Ok"
          >
            <ArrowRight className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">Tek Yönlü</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 gap-2 px-3',
              activeTool === 'two-way-arrow' && 'bg-primary text-primary-foreground'
            )}
            onClick={() => handleToolClick('two-way-arrow')}
            title="Çift Yönlü Ok"
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">Çift Yönlü</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
