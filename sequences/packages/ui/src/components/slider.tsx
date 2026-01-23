import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '../lib/utils';

export function Slider({ className, ...props }: React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      className={cn('relative flex w-full touch-none select-none items-center group', className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-secondary/60 shadow-inner border border-border/30">
        <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-primary via-primary to-primary/90 rounded-full transition-all duration-300 ease-out shadow-lg shadow-primary/20" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-6 w-6 rounded-full border-3 border-primary bg-background ring-4 ring-primary/20 ring-offset-2 ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 cursor-grab active:cursor-grabbing group-hover:ring-primary/30" />
    </SliderPrimitive.Root>
  );
}
