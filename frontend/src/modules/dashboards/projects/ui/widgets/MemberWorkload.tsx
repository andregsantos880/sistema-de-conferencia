import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/ui/shadcn/components/ui/card';
import { Avatar, AvatarFallback } from '@/shadcn/components/ui/avatar';
import { Progress } from '@/shared/ui/shadcn/components/ui/progress';
import { SkeletonChartCard } from '@/shared/ui/components/Skeleton';
import { cn } from '@/shadcn/lib/utils';
import { useWorkload } from '../../application/hooks/useProjectsAnalytics';
import type { DateRange } from '../../../shared/utils/dateRange';
import type { ProjectsFilters } from '../../application/hooks/useProjectsFilters';

interface MemberWorkloadProps {
  range: DateRange;
  filters?: ProjectsFilters;
}

function getUtilizationColor(utilization: number): string {
  if (utilization > 90) return 'text-danger';
  if (utilization >= 70) return 'text-success';
  return 'text-chart-1';
}

function getProgressColor(utilization: number): string {
  if (utilization > 90) return '[&>[data-slot=indicator]]:bg-danger';
  if (utilization >= 70) return '[&>[data-slot=indicator]]:bg-success';
  return '[&>[data-slot=indicator]]:bg-chart-1';
}

export function MemberWorkload({ range, filters }: MemberWorkloadProps) {
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
              {t('projects.widgets.workloadMember')}
            </CardTitle>
            <CardDescription>Current utilization by team member</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.members.slice(0, 5).map((member) => (
          <div key={member.id} className="flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-2 ring-border">
              <AvatarFallback className="text-xs bg-muted">
                {member.avatar || member.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="truncate">
                  <span className="text-sm font-medium text-foreground">
                    {member.name}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {member.role}
                  </span>
                </div>
                <span
                  className={cn(
                    'text-sm font-semibold',
                    getUtilizationColor(member.utilization)
                  )}
                >
                  {member.utilization}%
                </span>
              </div>
              <Progress
                value={member.utilization}
                className={cn('h-2', getProgressColor(member.utilization))}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
