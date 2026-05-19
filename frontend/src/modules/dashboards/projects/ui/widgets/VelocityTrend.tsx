import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/ui/shadcn/components/ui/card';
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/shared/ui/shadcn/components/ui/chart';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { SkeletonChartCard } from '@/shared/ui/components/Skeleton';
import { cn } from '@/shadcn/lib/utils';
import { useVelocity } from '../../application/hooks/useProjectsAnalytics';
import type { DateRange } from '../../../shared/utils/dateRange';

interface VelocityTrendProps {
  range: DateRange;
}

const chartConfig = {
  commitment: {
    label: 'Committed',
    color: 'var(--muted)',
  },
  velocity: {
    label: 'Delivered',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

export function VelocityTrend({ range }: VelocityTrendProps) {
  const { t } = useTranslation('dashboards');
  const { data, isLoading } = useVelocity(range);

  if (isLoading || !data) {
    return <SkeletonChartCard className="h-full" />;
  }

  const isPositiveTrend = data.trend >= 0;

  return (
    <Card className="h-full border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              {t('projects.widgets.velocity')}
            </CardTitle>
            <CardDescription>Sprint-over-sprint delivery performance</CardDescription>
          </div>
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full',
              isPositiveTrend ? 'bg-success/10' : 'bg-danger/10'
            )}
          >
            {isPositiveTrend ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-danger" />
            )}
            <span
              className={cn(
                'text-sm font-medium',
                isPositiveTrend ? 'text-success' : 'text-danger'
              )}
            >
              {isPositiveTrend ? '+' : ''}{data.trend}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">
            {data.avgVelocity}
          </span>
          <span className="text-sm text-muted-foreground">
            avg. story points/sprint
          </span>
        </div>

        <ChartContainer config={chartConfig} className="h-[180px] w-full">
          <BarChart
            accessibilityLayer
            data={data.series}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <XAxis
              dataKey="sprint"
              axisLine={false}
              tickLine={false}
              tickMargin={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={10}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="commitment"
              fill="var(--color-commitment)"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="velocity"
              fill="var(--color-velocity)"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
