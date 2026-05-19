import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/ui/shadcn/components/ui/card';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { AlertTriangle, Clock, Users, TrendingDown, ChevronRight } from 'lucide-react';
import { SkeletonChartCard } from '@/shared/ui/components/Skeleton';
import { cn } from '@/shadcn/lib/utils';
import { MetricProgressBar } from '@/shared/ui/components/MetricProgressBar';
import { useProjectRisks } from '../../application/hooks/useProjectsAnalytics';
import type { DateRange } from '../../../shared/utils/dateRange';
import type { ProjectsFilters } from '../../application/hooks/useProjectsFilters';
import type { RiskLevel } from '../../domain/models/ProjectsAnalytics';

interface ProjectRisksTableProps {
  range: DateRange;
  filters?: ProjectsFilters;
}

const riskIcons = {
  'Resource bottleneck': Users,
  'Vendor dependency': Clock,
  'Scope creep': TrendingDown,
  'Technical debt': AlertTriangle,
  'Performance concerns': AlertTriangle,
};

const riskColors: Record<RiskLevel, { bg: string; text: string; badge: string; bgProgress: string }> = {
  critical: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    bgProgress: 'bg-destructive',
    badge: 'border-destructive/30 text-destructive bg-destructive/5',
  },
  high: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    bgProgress: 'bg-destructive',
    badge: 'border-destructive/30 text-destructive bg-destructive/5',
  },
  medium: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    bgProgress: 'bg-warning',
    badge: 'border-warning/30 text-warning bg-warning/5',
  },
  low: {
    bg: 'bg-chart-1/10',
    text: 'text-chart-1',
    bgProgress: 'bg-chart-1',
    badge: 'border-chart-1/30 text-chart-1 bg-chart-1/5',
  },
};

export function ProjectRisksTable({ range, filters }: ProjectRisksTableProps) {
  const { t } = useTranslation('dashboards');
  const { data, isLoading } = useProjectRisks(range, filters);

  if (isLoading || !data) {
    return <SkeletonChartCard className="h-full" />;
  }

  return (
    <Card className="h-full border-border/50 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                {t('projects.widgets.risks')}
              </CardTitle>
              <CardDescription>Projects requiring immediate attention</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.risks.slice(0, 4).map((risk) => {
          const colors = riskColors[risk.level];
          const IconComponent = riskIcons[risk.title as keyof typeof riskIcons] || AlertTriangle;

          return (
            <div
              key={risk.id}
              className="group flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  colors.bg
                )}
              >
                <IconComponent className={cn('h-4 w-4', colors.text)} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {risk.projectName}
                  </h4>
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] px-1.5 py-0 shrink-0', colors.badge)}
                  >
                    {risk.level}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{risk.title}</span>
                  <span>•</span>
                  {risk.daysDelayed && (
                    <>
                      <span className="text-destructive">{risk.daysDelayed}d delayed</span>
                      <span>•</span>
                    </>
                  )}
                  <span>{risk.owner.name}</span>
                </div>
              </div>

              {risk.progress !== undefined && (
                <div className="w-20">
                  <MetricProgressBar
                    value={risk.progress}
                    size="sm"
                    showValue
                    valuePosition="top-right"
                    valueClassName="text-sm font-semibold text-foreground"
                    trackClassName="bg-muted"
                    indicatorClassName={cn('bg-muted-foreground/40', colors.bgProgress)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
