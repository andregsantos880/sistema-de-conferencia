import { Card, CardContent, CardHeader } from '@/shared/ui/shadcn/components/ui/card';
import { WidgetHeader } from '../../../shared/components/WidgetHeader';
import { ChartContainer, ChartTooltip } from '@/shared/ui/shadcn/components/ui/chart';
import { CustomTooltipContent } from '../../../shared/components/CustomTooltip';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import type { DateRange } from '../../../shared/utils/dateRange';
import { useRetentionData } from '../../application/hooks/useExecutiveAnalytics';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { CHART_COLORS } from '../../../shared/utils/chartColors';
import { ArrowUp, ArrowDown, Minus, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import CountUp from 'react-countup';
import { cn } from '@/shadcn/lib/utils';
import { computeRetentionInsight } from '../../application/selectors/executiveInsights';

export interface CustomerRetentionCardProps {
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

export function CustomerRetentionCard({ range, compare }: CustomerRetentionCardProps) {
  const { t } = useTranslation('dashboards');
  const { data, isLoading } = useRetentionData(range, compare);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Compute retention insights for volatility detection
  const retentionInsight = useMemo(() => {
    if (!data) return null;
    return computeRetentionInsight(data);
  }, [data]);

  if (isLoading || !data) {
    return (
      <Card className="h-full">
        <CardHeader>
          <WidgetHeader title={t('widgets.retention', 'Customer Retention')} />
        </CardHeader>
        <CardContent>
          <div className="h-[320px] flex items-center justify-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.series.map((point, index) => {
    const previousPoint = data.previous?.series[index];
    return {
      x: point.x,
      retention: point.retention,
      churned: point.churned,
      prevRetention: previousPoint?.retention,
    };
  });

  const TrendIcon = data.delta > 0 ? ArrowUp : data.delta < 0 ? ArrowDown : Minus;
  const trendColor = data.delta > 0 ? CHART_COLORS.success : data.delta < 0 ? CHART_COLORS.destructive : CHART_COLORS.muted;

  const chartConfig = {
    retention: { label: 'Retention %', color: CHART_COLORS.primary },
    prevRetention: { label: 'Previous Retention %', color: CHART_COLORS.muted },
    churned: { label: 'Churned', color: CHART_COLORS.destructive },
  } as const;

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <WidgetHeader title={t('widgets.retention', 'Customer Retention')} />
          {retentionInsight && retentionInsight.riskLevel !== 'low' && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              retentionInsight.riskLevel === 'high' 
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            )}>
              <AlertTriangle className="w-3 h-3" />
              <span>{retentionInsight.hasSharpDrop ? 'Sharp Drop' : 'Volatile'}</span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Percentage of customers retained month-over-month
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              <CountUp end={data.headline} decimals={1} suffix="%" duration={2} />
            </span>
            {compare && (
              <div className="flex items-center gap-1 text-sm font-medium" style={{ color: trendColor }}>
                <TrendIcon className="h-4 w-4" />
                <span>{data.delta > 0 ? `+${data.delta.toFixed(1)}%` : `${data.delta.toFixed(1)}%`}</span>
              </div>
            )}
          </div>
        </div>

        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <LineChart data={chartData}>
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
              tickFormatter={(value) => `${value as number}%`}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              content={
                <CustomTooltipContent
                   formatter={(value, name) => {
                    const valStr = value as number | string;
                    const nameStr = name as string;
                    if (nameStr === 'Churned') {
                      return [`${valStr}`, 'Churned'];
                    }
                    return [`${Number(valStr).toFixed(1)}%`, nameStr];
                  }}
                  labelFormatter={(value) => {
                    return format(new Date(value), 'MMM d, yyyy');
                  }}
                />
              }
            />
            <Legend />

            <Line
              type="monotone"
              dataKey="retention"
              stroke={CHART_COLORS.primary}
              strokeWidth={3}
              dot={{ r: 0, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              isAnimationActive={!prefersReducedMotion}
              animationDuration={1500}
            />

            {compare && (
              <Line
                type="monotone"
                dataKey="prevRetention"
                stroke={CHART_COLORS.muted}
                strokeDasharray="4 4"
                dot={false}
                strokeWidth={1.5}
                isAnimationActive={!prefersReducedMotion}
                animationDuration={1500}
              />
            )}

            <Line
              type="monotone"
              dataKey="churned"
              yAxisId={0}
              stroke={CHART_COLORS.destructive}
              strokeWidth={2}
              dot={{ r: 0, strokeWidth: 0 }}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={!prefersReducedMotion}
              animationDuration={1500}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
