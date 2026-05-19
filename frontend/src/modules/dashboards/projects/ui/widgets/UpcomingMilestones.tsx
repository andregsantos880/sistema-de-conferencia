import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/ui/shadcn/components/ui/card';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { Avatar, AvatarFallback } from '@/shadcn/components/ui/avatar';
import { Calendar, CheckCircle2, Clock, AlertCircle, Target } from 'lucide-react';
import { SkeletonChartCard } from '@/shared/ui/components/Skeleton';
import { Timeline } from '@/shared/ui/components/Timeline';
import { cn } from '@/shadcn/lib/utils';
import { useMilestones } from '../../application/hooks/useProjectsAnalytics';
import type { TimelineItemData } from '@/shared/ui/components/Timeline';
import type { DateRange } from '../../../shared/utils/dateRange';
import type { ProjectsFilters } from '../../application/hooks/useProjectsFilters';
import type { MilestoneStatus } from '../../domain/models/ProjectsAnalytics';

interface UpcomingMilestonesProps {
  range: DateRange;
  filters?: ProjectsFilters;
}

const statusConfig: Record<MilestoneStatus, {
  color: string;
  bg: string;
  badge: string;
  line: string;
  Icon: typeof CheckCircle2;
}> = {
  completed: {
    color: 'text-success',
    bg: 'bg-success/10',
    badge: 'bg-success/10 text-success border-success/20',
    line: 'bg-success',
    Icon: CheckCircle2,
  },
  onTrack: {
    color: 'text-chart-1',
    bg: 'bg-chart-1/10',
    badge: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
    line: 'bg-border',
    Icon: Target,
  },
  atRisk: {
    color: 'text-warning',
    bg: 'bg-warning/10',
    badge: 'bg-warning/10 text-warning border-warning/20',
    line: 'bg-border',
    Icon: AlertCircle,
  },
  delayed: {
    color: 'text-danger',
    bg: 'bg-danger/10',
    badge: 'bg-danger/10 text-danger border-danger/20',
    line: 'bg-border',
    Icon: Clock,
  },
};

function getBadgeLabel(milestone: { status: MilestoneStatus; daysAway?: number }) {
  switch (milestone.status) {
    case 'completed':
      return 'Done';
    case 'atRisk':
      return 'At Risk';
    case 'delayed':
      return 'Delayed';
    default:
      return milestone.daysAway ? `${milestone.daysAway}d` : 'On Track';
  }
}

export function UpcomingMilestones({ range, filters }: UpcomingMilestonesProps) {
  const { t } = useTranslation('dashboards');
  const { data, isLoading } = useMilestones(range, filters);

  const timelineItems: TimelineItemData[] = useMemo(() => {
    if (!data) return [];

    // Sort milestones: completed last, then by due date
    const sortedMilestones = [...data.milestones].sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    return sortedMilestones.map((milestone) => {
      const config = statusConfig[milestone.status];
      const Icon = config.Icon;

      return {
        id: milestone.id,
        icon: <Icon className={cn('h-4 w-4', config.color)} />,
        iconContainerClassName: config.bg,
        lineClassName: config.line,
        title: milestone.name,
        badge: (
          <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', config.badge)}>
            {getBadgeLabel(milestone)}
          </Badge>
        ),
        subtitle: (
          <span className="text-xs text-muted-foreground">
            {milestone.projectName} • {format(new Date(milestone.dueDate), 'MMM d')}
          </span>
        ),
        trailing: (
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-[10px] bg-muted">
              {milestone.owner.avatar || milestone.owner.name.split(' ').map((n) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        ),
      };
    });
  }, [data]);

  if (isLoading || !data) {
    return <SkeletonChartCard className="h-full" />;
  }

  return (
    <Card className="h-full border-border/50 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
              <Calendar className="h-5 w-5 text-chart-1" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                {t('projects.widgets.milestones')}
              </CardTitle>
              <CardDescription>Key deliverables and deadlines</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Timeline items={timelineItems} gap="lg" />
      </CardContent>
    </Card>
  );
}
