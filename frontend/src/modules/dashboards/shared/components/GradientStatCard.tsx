import { ArrowDownRight, ArrowRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { cn } from '@/shadcn/lib/utils';

export type StatCardVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'muted'
  | 'accent'
  | 'destructive';

export type StatTrend = 'up' | 'down' | 'flat';

const VARIANT_STYLES: Record<StatCardVariant, {
  card: string;
  accentShape: string;
  title: string;
  value: string;
  muted: string;
  iconBg: string;
  icon: string;
}> = {
  primary: {
    card: 'bg-gradient-to-br from-primary to-primary/80 text-white',
    accentShape: 'bg-white/10',
    title: 'text-white/90',
    value: 'text-white',
    muted: 'text-white/80',
    iconBg: 'bg-white/15',
    icon: 'text-white/90',
  },
  secondary: {
    card: 'bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground',
    accentShape: 'bg-white/20',
    title: 'text-secondary-foreground/90',
    value: 'text-secondary-foreground',
    muted: 'text-secondary-foreground/80',
    iconBg: 'bg-secondary-foreground/10',
    icon: 'text-secondary-foreground',
  },
  success: {
    card: 'bg-gradient-to-br from-success to-success/80 text-white',
    accentShape: 'bg-white/10',
    title: 'text-white/90',
    value: 'text-white',
    muted: 'text-white/80',
    iconBg: 'bg-white/15',
    icon: 'text-white/90',
  },
  warning: {
    card: 'bg-gradient-to-br from-warning to-warning/80 text-black',
    accentShape: 'bg-white/20',
    title: 'text-black/80',
    value: 'text-black',
    muted: 'text-black/70',
    iconBg: 'bg-black/10',
    icon: 'text-black/80',
  },
  muted: {
    card: 'bg-gradient-to-br from-muted to-muted-foreground/80 text-foreground',
    accentShape: 'bg-background/40',
    title: 'text-foreground',
    value: 'text-foreground',
    muted: 'text-muted-foreground',
    iconBg: 'bg-background/30',
    icon: 'text-foreground',
  },
  accent: {
    card: 'bg-gradient-to-br from-accent to-accent/80 text-accent-foreground',
    accentShape: 'bg-white/20',
    title: 'text-accent-foreground/90',
    value: 'text-accent-foreground',
    muted: 'text-accent-foreground/80',
    iconBg: 'bg-accent-foreground/10',
    icon: 'text-accent-foreground',
  },
  destructive: {
    card: 'bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground',
    accentShape: 'bg-white/15',
    title: 'text-destructive-foreground/90',
    value: 'text-destructive-foreground',
    muted: 'text-destructive-foreground/80',
    iconBg: 'bg-destructive-foreground/15',
    icon: 'text-destructive-foreground',
  },
};

export interface GradientStatCardProps {
  /** Main label, e.g. "Active Projects" */
  title: string;
  /** Primary numeric value, e.g. 24 */
  value: string | number;
  /** Optional small label next to the value, e.g. "projects" */
  valueLabel?: string;
  /** Delta text, e.g. "12% from last month" */
  delta?: string;
  /** Trend direction to control the arrow icon */
  trend?: StatTrend;
  /** Optional leading icon (defaults to a check icon) */
  icon?: ReactNode;
  /** Visual variant controlling background/foreground colors */
  variant?: StatCardVariant;
  className?: string;
}

export function GradientStatCard({
  title,
  value,
  valueLabel,
  delta,
  trend = 'up',
  icon,
  variant = 'primary',
  className,
}: GradientStatCardProps) {
  const styles = VARIANT_STYLES[variant];

  const TrendIcon =
    trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : ArrowRight;

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-0 shadow-lg',
        styles.card,
        className,
      )}
    >
      {/* Accent shape in the corner */}
      <div className={cn('absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16', styles.accentShape)} />

      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className={cn('text-sm font-medium', styles.title)}>
            {title}
          </CardTitle>
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full',
              styles.iconBg,
            )}
          >
            {icon ?? <CheckCircle2 className={cn('h-5 w-5', styles.icon)} />}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="flex items-baseline gap-2">
          <span className={cn('text-3xl font-bold tracking-tight', styles.value)}>
            {value}
          </span>
          {valueLabel && (
            <span className={cn('text-sm font-medium', styles.muted)}>
              {valueLabel}
            </span>
          )}
        </div>

        {delta && (
          <div className="mt-2 flex items-center gap-1 text-xs font-medium">
            <TrendIcon className={cn('h-3 w-3', styles.muted)} />
            <span className={styles.muted}>{delta}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
