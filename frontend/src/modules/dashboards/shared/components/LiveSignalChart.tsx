import { useMemo } from 'react';
import { AreaChart, Area, YAxis } from 'recharts';
import { ChartContainer, type ChartConfig } from '@/shared/ui/shadcn/components/ui/chart';
import { cn } from '@/shadcn/lib/utils';

export interface LiveChartPoint {
  t: number;
  value: number;
}

export interface LiveSignalChartProps {
  data: LiveChartPoint[];
  className?: string;
  chartKey?: 'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5' | 'chart-6' | 'chart-7' | 'chart-8';
}

/**
 * Phase 2: Live Signal Chart (Enhanced)
 * 
 * A professional real-time chart using Shadcn ChartContainer and Recharts.
 * Features:
 * - Smooth area chart with rich gradient fill
 * - Auto-scaled Y-axis
 * - Clean, minimal design
 * - Responsive container
 * - Optimized for both light and dark modes
 */
export function LiveSignalChart({ 
  data, 
  className,
  chartKey = 'chart-1',
}: LiveSignalChartProps) {
  // Transform data for Recharts (needs numeric index for X-axis)
  const chartData = useMemo(() => {
    return data.map((point, index) => ({
      index,
      value: point.value,
      timestamp: point.t,
    }));
  }, [data]);

  // Calculate min/max for display
  const { minValue, maxValue } = useMemo(() => {
    if (data.length === 0) {
      return { minValue: 0, maxValue: 100 };
    }
    const values = data.map(d => d.value);
    return {
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
    };
  }, [data]);

  const chartConfig = {
    value: {
      label: 'Visitors',
      color: `var(--${chartKey})`,
    },
  } satisfies ChartConfig;

  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center text-muted-foreground text-sm h-full', className)}>
        Waiting for data...
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <ChartContainer config={chartConfig} className="h-full w-full">
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <defs>
            {/* Rich gradient for light mode - vibrant colors */}
            <linearGradient id="liveVisitorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={`var(--${chartKey})`} stopOpacity={0.6} />
              <stop offset="50%" stopColor={`var(--${chartKey})`} stopOpacity={0.3} />
              <stop offset="100%" stopColor={`var(--${chartKey})`} stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <YAxis
            domain={['dataMin', 'dataMax']}
            hide
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke={`var(--${chartKey})`}
            strokeWidth={2.5}
            fill="url(#liveVisitorGradient)"
            isAnimationActive={false} // Disable animation for real-time feel
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ChartContainer>

      {/* Min/Max labels with better contrast */}
      <div className="absolute top-0 left-0 text-[10px] font-medium text-muted-foreground/70 px-1.5 py-0.5 rounded-sm bg-background/50 backdrop-blur-sm">
        {Math.round(maxValue)}
      </div>
      <div className="absolute bottom-0 left-0 text-[10px] font-medium text-muted-foreground/70 px-1.5 py-0.5 rounded-sm bg-background/50 backdrop-blur-sm">
        {Math.round(minValue)}
      </div>
    </div>
  );
}
