import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/ui/shadcn/components/ui/card';
import { SkeletonChartCard } from '@/shared/ui/components/Skeleton';
import { cn } from '@/shadcn/lib/utils';
import { MetricProgressBar } from '@/shared/ui/components/MetricProgressBar';
import { useWorkload } from '../../application/hooks/useProjectsAnalytics';
import type { DateRange } from '../../../shared/utils/dateRange';
import type { ProjectsFilters } from '../../application/hooks/useProjectsFilters';

interface TeamUtilizationProps {
  range: DateRange;
  filters?: ProjectsFilters;
}

function getUtilizationColor(utilization: number): string {
  if (utilization > 90) return 'text-warning';
  if (utilization >= 70) return 'text-success';
  return 'text-chart-1';
}

// function getProgressColor(utilization: number): string {
//   if (utilization > 90) return 'bg-warning';
//   if (utilization >= 70) return 'bg-success';
//   return 'bg-chart-1';
// }

export function TeamUtilization({ range, filters }: TeamUtilizationProps) {
  const { t } = useTranslation('dashboards');
  const { data, isLoading } = useWorkload(range, filters);

  if (isLoading || !data) {
    return <SkeletonChartCard className="h-full" />;
  }

  return (
    <Card className="h-full border-border/50 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              {t('projects.widgets.workloadTeam')}
            </CardTitle>
            <CardDescription>Current utilization by team</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-warning" />
              {'>'} 90%
            </span>
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-success" />
              70-90%
            </span>
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-chart-1" />
              {'<'} 70%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.teams.map((team) => (
          <div key={team.id} className="space-y-2">
            <MetricProgressBar
              value={team.utilization}
              size="md"
              valuePosition="inline-right"
              label={(
                <>
                  <span className="text-sm font-medium text-foreground">
                    {team.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({team.memberCount} members)
                  </span>
                </>
              )}
              labelClassName="flex items-center gap-2"
              valueClassName={cn('text-sm font-semibold', getUtilizationColor(team.utilization))}
              trackClassName="bg-muted"
              // indicatorClassName={getProgressColor(team.utilization)}
              indicatorClassName="bg-chart-1"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
