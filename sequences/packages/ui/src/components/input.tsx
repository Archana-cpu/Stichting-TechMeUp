import * as React from 'react';
import { cn } from '../lib/utils';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type, ...props }: InputProps) {
  return (
    <div className="relative group">
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-xl border-2 border-border/50 bg-background/60 backdrop-blur-md px-5 py-3.5 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:border-primary focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:ring-offset-2 focus-visible:shadow-xl focus-visible:shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 ease-out vintage-input',
          'hover:border-primary/40 hover:bg-background/80 hover:shadow-md hover:shadow-primary/5',
          className
        )}
        {...props}
      />
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/8 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500 ease-out" />
      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-primary/0 via-transparent to-primary/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500 ease-out" />
    </div>
  );
}
