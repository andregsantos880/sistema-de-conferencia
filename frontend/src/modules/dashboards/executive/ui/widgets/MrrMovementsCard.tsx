import { Card, CardContent, CardHeader } from '@/shared/ui/shadcn/components/ui/card';
import { WidgetHeader } from '../../../shared/components/WidgetHeader';
import { ChartContainer, ChartTooltip } from '@/shared/ui/shadcn/components/ui/chart';
import { CustomTooltipContent } from '../../../shared/components/CustomTooltip';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { useMrrMovementsData } from '../../application/hooks/useExecutiveAnalytics';
import type { DateRange } from '../../../shared/utils/dateRange';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { formatCurrency } from '../../../shared/utils/formatters';
import { CHART_COLORS } from '../../../shared/utils/chartColors';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Layers, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/shadcn/lib/utils';
import { computeMrrMovementsSummary } from '../../application/selectors/executiveInsights';

export interface MrrMovementsCardProps {
  range: DateRange;
  compare: boolean;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReduced(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}

type ViewMode = 'net' | 'breakdown';

export function MrrMovementsCard({ range, compare }: MrrMovementsCardProps) {
  const { t } = useTranslation('dashboards');
  const { data, isLoading } = useMrrMovementsData(range, compare);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [viewMode, setViewMode] = useState<ViewMode>('breakdown');

  // Compute Net MRR summary
  const mrrSummary = useMemo(() => {
    if (!data) return null;
    return computeMrrMovementsSummary(data);
  }, [data]);

  if (isLoading || !data) {
    return (
      <Card className="h-full">
        <CardHeader>
          <WidgetHeader title={t('widgets.mrrMovements')} />
        </CardHeader>
        <CardContent>
          <div className="h-[320px] flex items-center justify-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const merged = data.current.map((point, index) => {
    const previousPoint = data.previous?.[index];
    return {
      x: point.x,
      new: point.new,
      expansion: point.expansion,
      contraction: point.contraction,
      churn: point.churn,
      net: point.net,
      prevNet: previousPoint?.net,
    };
  });

  const chartConfig = {
    new: { label: 'New', color: CHART_COLORS.success },
    expansion: { label: 'Expansion', color: CHART_COLORS.secondary },
    contraction: { label: 'Contraction', color: CHART_COLORS.warning },
    churn: { label: 'Churn', color: CHART_COLORS.destructive },
    net: { label: 'Net MRR', color: CHART_COLORS.primary },
    prevNet: { label: 'Previous Net', color: CHART_COLORS.muted },
  } as const;

  const NetIcon = mrrSummary && mrrSummary.netMrr >= 0 ? ArrowUp : ArrowDown;
  const netColor = mrrSummary && mrrSummary.netMrr >= 0 ? 'text-emerald-500' : 'text-rose-500';

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <WidgetHeader title={t('widgets.mrrMovements')} />
          
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
            <Button
              variant={viewMode === 'net' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setViewMode('net')}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Net
            </Button>
            <Button
              variant={viewMode === 'breakdown' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setViewMode('breakdown')}
            >
              <Layers className="w-3 h-3 mr-1" />
              Full
            </Button>
          </div>
        </div>

        {/* Net MRR Callout */}
        {mrrSummary && (
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Net MRR (period):</span>
              <div className={cn('flex items-center gap-1 font-semibold text-lg', netColor)}>
                <NetIcon className="w-4 h-4" />
                <span>{formatCurrency(Math.abs(mrrSummary.netMrr), 'USD', true)}</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              driven by <span className="font-medium text-foreground">{mrrSummary.primaryDriver}</span>
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <ComposedChart data={merged} stackOffset="sign">
            <CartesianGrid vertical={false} strokeOpacity={0.1} />
            <XAxis
              dataKey="x"
              tickFormatter={(value) => {
                try {
                  return format(new Date(value), 'MMM d');
                } catch {
                  return value as string;
                }
              }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tickFormatter={(v) => formatCurrency(v as number, 'USD', true)} 
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              content={
                <CustomTooltipContent
                  formatter={(value, name) => {
                    if (typeof value !== 'number') return [value, name];
                    return [formatCurrency(value as number, 'USD', true), name];
                  }}
                  labelFormatter={(value) => {
                    return format(new Date(value), 'MMM d, yyyy');
                  }}
                />
              }
            />
            <Legend />

            {/* Stacked bars - only show in breakdown view */}
            {viewMode === 'breakdown' && (
              <>
                <Bar 
                  dataKey="new" 
                  stackId="mrr" 
                  fill={CHART_COLORS.success} 
                  isAnimationActive={!prefersReducedMotion} 
                  animationDuration={1500}
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="expansion" 
                  stackId="mrr" 
                  fill={CHART_COLORS.secondary} 
                  isAnimationActive={!prefersReducedMotion} 
                  animationDuration={1500}
                />
                <Bar 
                  dataKey="contraction" 
                  stackId="mrr" 
                  fill={CHART_COLORS.warning} 
                  isAnimationActive={!prefersReducedMotion} 
                  animationDuration={1500}
                />
                <Bar 
                  dataKey="churn" 
                  stackId="mrr" 
                  fill={CHART_COLORS.destructive} 
                  isAnimationActive={!prefersReducedMotion} 
                  animationDuration={1500}
                  radius={[0, 0, 4, 4]}
                />
              </>
            )}

            <Line
              type="monotone"
              dataKey="net"
              stroke={CHART_COLORS.primary}
              dot={{ r: 0, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              strokeWidth={3}
              isAnimationActive={!prefersReducedMotion}
              animationDuration={2000}
            />

            {compare && (
              <Line
                type="monotone"
                dataKey="prevNet"
                stroke={CHART_COLORS.muted}
                strokeDasharray="4 4"
                dot={false}
                strokeWidth={1.5}
                isAnimationActive={!prefersReducedMotion}
              />
            )}
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
