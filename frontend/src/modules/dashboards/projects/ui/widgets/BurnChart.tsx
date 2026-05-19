import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/ui/shadcn/components/ui/card';
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/shared/ui/shadcn/components/ui/chart';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { SkeletonChartCard } from '@/shared/ui/components/Skeleton';
import { useProjectsBurn } from '../../application/hooks/useProjectsAnalytics';
import type { DateRange } from '../../../shared/utils/dateRange';
import type { BurnChartMode } from '../../domain/models/ProjectsAnalytics';

interface BurnChartProps {
  range: DateRange;
  compare: boolean;
  projectId?: string;
}

export function BurnChart({ range, compare, projectId }: BurnChartProps) {
  const { t } = useTranslation('dashboards');
  const [mode, setMode] = useState<BurnChartMode>('burnUp');
  const { data, isLoading } = useProjectsBurn(range, compare, projectId);

  // Chart config for Shadcn ChartContainer
  const chartConfig = {
    completed: {
      label: 'Completed',
      color: 'var(--chart-1)',
    },
    remaining: {
      label: 'Remaining',
      color: 'var(--chart-1)',
    },
    planned: {
      label: 'Planned',
      color: 'var(--chart-2)',
    },
    ideal: {
      label: 'Ideal',
      color: 'var(--chart-2)',
    },
    scope: {
      label: 'Scope',
      color: 'var(--muted-foreground)',
    },
  } satisfies ChartConfig;

  if (isLoading || !data) {
    return <SkeletonChartCard className="h-full" />;
  }

  // Transform data based on mode
  const chartData = data.series.map((point) => {
    const date = new Date(point.x);
    if (mode === 'burnUp') {
      return {
        date: format(date, 'MMM d'),
        completed: point.completed,
        planned: point.ideal,
        scope: point.total,
      };
    } else {
      // Burn-down: show remaining work
      return {
        date: format(date, 'MMM d'),
        remaining: point.total - point.completed,
        ideal: point.total - point.ideal,
        scope: point.total,
      };
    }
  });

  return (
    <Card className="h-full border-border/50 bg-card transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              {t('projects.widgets.burn')}
            </CardTitle>
            <CardDescription>
              {mode === 'burnUp'
                ? 'Work completed vs. total scope over time'
                : 'Remaining work vs. ideal progress'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={mode === 'burnUp' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('burnUp')}
              className="transition-all active:scale-95"
            >
              Burn Up
            </Button>
            <Button
              variant={mode === 'burnDown' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('burnDown')}
              className="transition-all active:scale-95"
            >
              Burn Down
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-completed)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-completed)"
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient id="plannedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-planned)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-planned)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeOpacity={0.1} />
            <XAxis
              dataKey="date"
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
            <Area
              type="monotone"
              dataKey="scope"
              stroke="var(--color-scope)"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="transparent"
              isAnimationActive={true}
              animationDuration={1500}
            />
            <Area
              type="monotone"
              dataKey={mode === 'burnUp' ? 'planned' : 'ideal'}
              stroke="var(--color-planned)"
              strokeWidth={3}
              fill="url(#plannedGradient)"
              isAnimationActive={true}
              animationDuration={1500}
            />
            <Area
              type="monotone"
              dataKey={mode === 'burnUp' ? 'completed' : 'remaining'}
              stroke="var(--color-completed)"
              strokeWidth={3}
              fill="url(#completedGradient)"
              isAnimationActive={true}
              animationDuration={1500}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
