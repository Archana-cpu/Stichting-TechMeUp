import { cn } from '@seq/ui';
import { Loader2 } from 'lucide-react';

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  return <Loader2 className={cn('animate-spin text-primary', sizeClasses[size], className)} />;
}

type LoadingOverlayProps = {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
};

export function LoadingOverlay({ isLoading, children, className }: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
}

type LoadingPageProps = {
  message?: string;
};

export function LoadingPage({ message }: LoadingPageProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <LoadingSpinner size="xl" />
      {message && <p className="mt-4 text-muted-foreground text-sm">{message}</p>}
    </div>
  );
}
