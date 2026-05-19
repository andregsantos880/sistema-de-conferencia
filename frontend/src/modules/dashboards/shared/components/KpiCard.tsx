import { Card, CardContent, CardHeader } from '@/shared/ui/shadcn/components/ui/card';
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';
import { cn } from '@/shadcn/lib/utils';
import { Sparkline } from './Sparkline';
import { getTrendColor } from '../utils/chartColors';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/shadcn/components/ui/tooltip';
import { WidgetHeader } from './WidgetHeader';
import CountUp from 'react-countup';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';

export type KpiStatusLabel = 'above_plan' | 'on_track' | 'healthy' | 'at_risk' | 'critical';

const statusConfig: Record<KpiStatusLabel, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  above_plan: { label: 'Above plan', variant: 'default', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  on_track: { label: 'On track', variant: 'secondary', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  healthy: { label: 'Healthy', variant: 'secondary', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  at_risk: { label: 'At risk', variant: 'outline', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  critical: { label: 'Critical', variant: 'destructive', className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
};

export interface KpiCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  delta?: number;
  deltaFormat?: 'percent' | 'currency' | 'number';
  trend?: 'up' | 'down' | 'flat';
  /**
   * Inverse trend semantics (e.g., churn where down is good)
   */
  inverseTrend?: boolean;
  sparkData?: number[];
  colorToken?: string;
  density?: 'compact' | 'spacious';
  tooltip?: string;
  className?: string;
  formatter?: (value: number) => string;
  /**
   * Status label for contextual awareness (e.g., 'Above plan', 'At risk')
   */
  status?: KpiStatusLabel;
  /**
   * Target value for comparison
   */
  target?: string | number;
  /**
   * Optional subtitle/explanation text
   */
  subtitle?: string;
}

export function KpiCard({
  label,
  value,
  suffix,
  delta,
  deltaFormat = 'percent',
  trend = 'flat',
  inverseTrend = false,
  sparkData,
  colorToken,
  density = 'spacious',
  tooltip,
  className,
  formatter,
  status,
  target,
  subtitle,
}: KpiCardProps) {
  const isCompact = density === 'compact';
  const trendColor = getTrendColor(trend, inverseTrend);

  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : ArrowRight;

  const deltaText = delta !== undefined ? (
    deltaFormat === 'percent' ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%` :
    deltaFormat === 'currency' ? `${delta > 0 ? '+' : ''}$${Math.abs(delta).toFixed(0)}` :
    `${delta > 0 ? '+' : ''}${delta}`
  ) : null;

  const statusInfo = status ? statusConfig[status] : null;

  const content = (
    <Card className={cn(
      'overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-primary/5',
      className
    )}>
      <CardHeader className={cn('pb-2', isCompact && 'py-3')}>
        <div className="flex items-center justify-between gap-2">
          <WidgetHeader title={label} className={cn('text-sm font-medium text-muted-foreground', isCompact && 'text-xs')} />
          {statusInfo && (
            <Badge 
              variant="outline" 
              className={cn('text-[10px] px-1.5 py-0 h-5 font-medium', statusInfo.className)}
            >
              {statusInfo.label}
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground/80 mt-0.5">{subtitle}</p>
        )}
      </CardHeader>
      
      <CardContent className={cn('space-y-1', isCompact && 'py-2')}>
        <div className="flex items-baseline justify-between transition-all">
          <div className="flex items-baseline gap-1">
            <span className={cn('text-2xl font-bold tracking-tight', isCompact && 'text-xl')} style={{ color: colorToken }}>
              {typeof value === 'number' ? (
                <CountUp
                  end={value}
                  duration={2.5}
                  separator=","
                  decimals={value % 1 !== 0 ? 2 : 0}
                  formattingFn={formatter}
                />
              ) : (
                value
              )}

              {suffix && (
                <span className="ml-1 text-sm font-normal text-muted-foreground">{suffix}</span>
              )}
            </span>
          </div>

          {delta !== undefined && (
            <div className={cn('flex items-center gap-1 text-xs font-medium')} style={{ color: trendColor }}>
              <TrendIcon className="h-3 w-3" />
              <span>{deltaText}</span>
            </div>
          )}
        </div>

        {/* Target display */}
        {target !== undefined && (
          <p className="text-xs text-muted-foreground">
            Target: <span className="font-medium">{target}</span>
          </p>
        )}

        {sparkData && sparkData.length > 0 && (
          <div className="pt-2">
            <Sparkline 
              className="h-[50px] w-full mix-blend-multiply dark:mix-blend-screen opacity-80"
              data={sparkData}
              color={colorToken}
              title={label}
            /> 
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

