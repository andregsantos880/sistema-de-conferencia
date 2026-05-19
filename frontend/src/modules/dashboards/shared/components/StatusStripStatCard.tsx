import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from '@/shared/ui/shadcn/components/ui/card';
import { cn } from '@/shadcn/lib/utils';
// import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/shadcn/components/ui/chart';
import CountUp from 'react-countup';
import { Sparkline } from './Sparkline';
import { CHART_COLORS } from '../utils/chartColors';

export type StatusCardVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'muted'
  | 'accent'
  | 'destructive';

export type StatusTrendDirection = 'up' | 'down';
export type StatusTrendIntent = 'good' | 'bad';

const VARIANT_STYLES: Record<StatusCardVariant, {
  gradient: string;
  iconBg: string;
  icon: string;
}> = {
  primary: {
    gradient: 'from-primary to-primary/70',
    iconBg: 'bg-primary/15',
    icon: 'text-primary',
  },
  secondary: {
    gradient: 'from-secondary to-secondary/70',
    iconBg: 'bg-secondary/20',
    icon: 'text-secondary-foreground',
  },
  success: {
    gradient: 'from-success to-success/70',
    iconBg: 'bg-success/20',
    icon: 'text-success',
  },
  warning: {
    gradient: 'from-warning to-warning/70',
    iconBg: 'bg-warning/20',
    icon: 'text-warning',
  },
  muted: {
    gradient: 'from-muted-foreground/40 to-muted-foreground/10',
    iconBg: 'bg-muted/80',
    icon: 'text-muted-foreground',
  },
  accent: {
    gradient: 'from-accent to-accent/70',
    iconBg: 'bg-accent/20',
    icon: 'text-accent-foreground',
  },
  destructive: {
    gradient: 'from-destructive to-destructive/70',
    iconBg: 'bg-destructive/20',
    icon: 'text-destructive',
  },
};

const VARIANT_CHART_COLOR: Record<StatusCardVariant, string> = {
  primary: CHART_COLORS.primary,
  secondary: CHART_COLORS.secondary,
  success: CHART_COLORS.success,
  warning: CHART_COLORS.warning,
  muted: CHART_COLORS.muted,
  accent: CHART_COLORS.accent,
  destructive: CHART_COLORS.destructive,
};

export interface StatusStripStatCardProps {
  /** Main numeric value, e.g. 24 */
  value: string | number;
  /** Label under the value, e.g. "Active Projects" */
  label: string;
  /** Small description text, e.g. "From 21 last month" */
  description?: string;
  /** Delta text, e.g. "+3" or "-1" */
  change?: string;
  /** Direction of the arrow */
  trendDirection?: StatusTrendDirection;
  /** Whether the trend is good or bad for coloring the pill */
  trendIntent?: StatusTrendIntent;
  /** Icon rendered inside the square avatar */
  icon?: ReactNode;
  /** Visual variant mapping to color tokens */
  variant?: StatusCardVariant;
  className?: string;
  sparkData?: number[];
  sparkColor?: string;
  sparkTitle?: string;
}

export function StatusStripStatCard({
  value,
  label,
  description,
  change,
  trendDirection = 'up',
  trendIntent = 'good',
  icon,
  variant = 'primary',
  className,
  sparkData,
  sparkColor,
  sparkTitle,
}: StatusStripStatCardProps) {
  const styles = VARIANT_STYLES[variant];

  const effectiveSparkColor = sparkColor ?? VARIANT_CHART_COLOR[variant];

  const isGood = trendIntent === 'good';
  const TrendIcon = trendDirection === 'up' ? ArrowUpRight : ArrowDownRight;
  const pillClass = isGood
    ? 'bg-success/10 text-success'
    : 'bg-destructive/10 text-destructive';

  const changePill = change ? (
    <div
      className={cn(
        'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
        pillClass,
      )}
    >
      <TrendIcon className="h-3 w-3" />
      {change}
    </div>
  ) : null;

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-border/50 bg-card hover:shadow-lg transition-all duration-300 group',
        className,
      )}
    >
      {/* Top gradient strip */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
          styles.gradient,
        )}
      />

      <div className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between md:flex-col lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110',
                  styles.iconBg,
                )}
              >
                {icon && <span className={cn('inline-flex', styles.icon)}>{icon}</span>}
              </div>
              {!sparkData && changePill}
            </div>

            <div className="space-y-1">
              <h3 className="text-3xl font-bold text-foreground tracking-tight">
                {typeof value === 'number' ? (
                  <CountUp end={value} duration={2} separator="," />
                ) : (
                  value
                )}
              </h3>
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              {description && (
                <p className="text-xs text-muted-foreground/70 xl:hidden 2xl:block">{description}</p>
              )}
            </div>
          </div>

          {sparkData && sparkData.length > 0 && (
            <div className="mt-2 sm:mt-0 sm:w-32 md:w-full lg:w-32 flex items-end relative">
              {changePill && (
                <div className="absolute top-0 right-0 translate-y-[-4px]">
                  {changePill}
                </div>
              )}
              <Sparkline
                data={sparkData}
                color={effectiveSparkColor}
                title={sparkTitle ?? label}
                className="h-16 w-full pt-4"
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
