import { useTranslation } from 'react-i18next';
import { Zap, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { StatusStripStatCard } from '../../../shared/components/StatusStripStatCard';
import { SkeletonKpiCard } from '@/shared/ui/components/Skeleton';
import { useProjectsKpis } from '../../application/hooks/useProjectsAnalytics';
import type { DateRange } from '../../../shared/utils/dateRange';
import type { ProjectsFilters } from '../../application/hooks/useProjectsFilters';

interface ProjectsKpiRailProps {
  range: DateRange;
  compare: boolean;
  filters?: ProjectsFilters;
}

export function ProjectsKpiRail({ range, compare, filters }: ProjectsKpiRailProps) {
  const { t } = useTranslation('dashboards');
  const { data, isLoading } = useProjectsKpis(range, compare, filters);

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonKpiCard key={i} showSparkline />
        ))}
      </div>
    );
  }

  const formatDeltaPercent = (delta?: number) => {
    if (delta === undefined || Number.isNaN(delta)) return undefined;
    const rounded = Number(delta.toFixed(1));
    const sign = rounded > 0 ? '+' : '';
    return `${sign}${rounded}%`;
  };

  const computeDelta = (current: number, previousValue?: number) => {
    if (previousValue === undefined || previousValue === 0) return undefined;
    return ((current - previousValue) / previousValue) * 100;
  };

  const resolveTrendDirection = (delta?: number): 'up' | 'down' => {
    if (delta === undefined || delta === 0) return 'up';
    return delta < 0 ? 'down' : 'up';
  };

  const resolveTrendIntent = (delta: number | undefined, inverse: boolean): 'good' | 'bad' => {
    if (delta === undefined || delta === 0) return 'good';
    const isGood = inverse ? delta < 0 : delta > 0;
    return isGood ? 'good' : 'bad';
  };

  const activeDelta = computeDelta(
    data.activeProjects.current,
    data.activeProjects.previous?.value,
  );
  const onTrackDelta = computeDelta(
    data.onTrackProjects.current,
    data.onTrackProjects.previous?.value,
  );
  const atRiskDelta = computeDelta(
    data.atRiskProjects.current,
    data.atRiskProjects.previous?.value,
  );
  const overdueDelta = computeDelta(
    data.overdueTasks.current,
    data.overdueTasks.previous?.value,
  );

  const activeSeries = data.activeProjects.trend.map((p) => p.y);
  const onTrackSeries = data.onTrackProjects.trend.map((p) => p.y);
  const atRiskSeries = data.atRiskProjects.trend.map((p) => p.y);
  const overdueSeries = data.overdueTasks.trend.map((p) => p.y);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatusStripStatCard
        value={data.activeProjects.current}
        label={t('projects.kpi.active')}
        description={data.activeProjects.description ?? t('kpi.deltaVsPrevious')}
        change={compare ? formatDeltaPercent(activeDelta) : undefined}
        trendDirection={resolveTrendDirection(activeDelta)}
        trendIntent={resolveTrendIntent(activeDelta, false)}
        icon={<Zap className="h-5 w-5" />}
        variant="success"
        sparkData={activeSeries}
      />

      <StatusStripStatCard
        value={data.onTrackProjects.current}
        label={t('projects.kpi.onTrack')}
        description={data.onTrackProjects.description ?? t('kpi.deltaVsPrevious')}
        change={compare ? formatDeltaPercent(onTrackDelta) : undefined}
        trendDirection={resolveTrendDirection(onTrackDelta)}
        trendIntent={resolveTrendIntent(onTrackDelta, false)}
        icon={<CheckCircle2 className="h-5 w-5" />}
        variant="primary"
        sparkData={onTrackSeries}
      />

      <StatusStripStatCard
        value={data.atRiskProjects.current}
        label={t('projects.kpi.atRisk')}
        description={data.atRiskProjects.description ?? t('kpi.deltaVsPrevious')}
        change={compare ? formatDeltaPercent(atRiskDelta) : undefined}
        trendDirection={resolveTrendDirection(atRiskDelta)}
        trendIntent={resolveTrendIntent(atRiskDelta, true)}
        icon={<AlertTriangle className="h-5 w-5" />}
        variant="warning"
        sparkData={atRiskSeries}
      />

      <StatusStripStatCard
        value={data.overdueTasks.current}
        label={t('projects.kpi.overdueTasks')}
        description={data.overdueTasks.description ?? t('kpi.deltaVsPrevious')}
        change={compare ? formatDeltaPercent(overdueDelta) : undefined}
        trendDirection={resolveTrendDirection(overdueDelta)}
        trendIntent={resolveTrendIntent(overdueDelta, true)}
        icon={<Clock className="h-5 w-5" />}
        variant="destructive"
        sparkData={overdueSeries}
      />
    </div>
  );
}
