import { AreaChart, Area } from 'recharts';
import { CHART_COLORS } from '../utils/chartColors';
import { ChartContainer, type ChartConfig } from '@/shared/ui/shadcn/components/ui/chart';
import { cn } from '@/shadcn/lib/utils';
import { cleanString } from '../utils/formatters';

export interface SparklineProps {
  data: number[];
  title?: string;
  color?: string;
  className?: string;
}

export function Sparkline({ data, title, color = CHART_COLORS.primary, className }: SparklineProps) {
  const chartData = data.map((value, index) => ({ index, value }));

  const chartConfig = {
    value: {
      label: title,
      color: color,
    },
  } satisfies ChartConfig;

  const normalizedTitleId = cleanString(color);

  return (
    <ChartContainer
      config={chartConfig}
      className={cn("aspect-auto w-full", className)}
    >
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={`sparkGradient-${normalizedTitleId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        
        <Area
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#sparkGradient-${normalizedTitleId})`}
          fillOpacity={0.4}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
