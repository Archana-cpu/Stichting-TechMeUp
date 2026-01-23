import { cn } from '@seq/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@seq/ui';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

type StatCardProps = {
  title: string;
  value: string | number | React.ReactNode;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  description?: string;
  className?: string;
  variant?: 'default' | 'calming' | 'primary';
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className,
  variant = 'default',
}: StatCardProps) {
  const variantClasses = {
    default: '',
    calming: 'calming-gradient',
    primary: 'bg-primary/5 border-primary/20',
  };

  const TrendIcon = trend ? (trend.value > 0 ? TrendingUp : trend.value < 0 ? TrendingDown : Minus) : null;

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600 dark:text-green-400';
    if (value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  return (
    <Card className={cn(variantClasses[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl md:text-3xl font-bold">{value}</div>
        {(trend || description) && (
          <div className="mt-1 flex items-center gap-1 text-xs">
            {trend && TrendIcon && (
              <>
                <TrendIcon className={cn('h-3 w-3', getTrendColor(trend.value))} />
                <span className={getTrendColor(trend.value)}>
                  {trend.value > 0 ? '+' : ''}
                  {trend.value}%
                </span>
                {trend.label && <span className="text-muted-foreground ml-1">{trend.label}</span>}
              </>
            )}
            {!trend && description && <span className="text-muted-foreground">{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type StatGridProps = {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
};

export function StatGrid({ children, columns = 4, className }: StatGridProps) {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return <div className={cn('grid gap-4', columnClasses[columns], className)}>{children}</div>;
}
