import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/shadcn/components/ui/card';
import { PieChart, Pie, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/shared/ui/shadcn/components/ui/chart';
import { SkeletonChartCard } from '@/shared/ui/components/Skeleton';
import { useProjectHealth } from '../../application/hooks/useProjectsAnalytics';
import type { DateRange } from '../../../shared/utils/dateRange';
import type { ProjectsFilters } from '../../application/hooks/useProjectsFilters';

interface ProjectHealthOverviewProps {
  range: DateRange;
  filters?: ProjectsFilters;
}

const chartConfig = {
  onTrack: {
    label: 'On Track',
    color: 'var(--success)',
  },
  atRisk: {
    label: 'At Risk',
    color: 'var(--warning)',
  },
  delayed: {
    label: 'Delayed',
    color: 'var(--destructive)',
  },
  completed: {
    label: 'Completed',
    color: '(var(--chart-1)',
  },
} satisfies ChartConfig;

export function ProjectHealthOverview({ range, filters }: ProjectHealthOverviewProps) {
  const { t } = useTranslation('dashboards');
  const { data, isLoading } = useProjectHealth(range, filters);

  if (isLoading || !data) {
    return <SkeletonChartCard className="h-full" />;
  }

  const pieData = data.distribution
    .filter((item) => item.count > 0)
    .map((item) => ({
      status: item.status,
      value: item.count,
      fill: `var(--color-${item.status})`,
    }));

  return (
    <Card className="h-full border-border/50 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          {t('projects.widgets.health')}
        </CardTitle>
        <CardDescription>Overall portfolio status distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                nameKey="status"
                strokeWidth={0}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="status" />}
              />
            </PieChart>
          </ChartContainer>
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-foreground">{data.total}</span>
            <span className="text-sm text-muted-foreground">Total</span>
          </div>
        </div>

        <ChartContainer config={chartConfig} className="h-8">
          <ChartLegend content={<ChartLegendContent nameKey="status" />} />
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
