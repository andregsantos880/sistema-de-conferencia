import { useQuery } from '@tanstack/react-query';
import { useLiveQuery } from '../../../shared/hooks/useLiveQuery';
import type { DateRange } from '../../../shared/utils/dateRange';
import { useProjectsAnalyticsRepository } from './useProjectsAnalyticsRepository';
import type {
  ProjectsAnalyticsQuery,
  ProjectsKpisData,
  BurnChartData,
  WorkloadData,
  MilestonesData,
  ProjectRisksData,
  ProjectHealthData,
  VelocityData,
  BudgetData,
  ProjectsFilterOptions,
  ProjectStatus,
} from '../../domain/models/ProjectsAnalytics';

function buildQuery(
  range: DateRange,
  compare: boolean,
  filters?: { team?: string[]; owner?: string[]; status?: ProjectStatus[] }
): ProjectsAnalyticsQuery {
  return {
    from: range.from.toISOString(),
    to: range.to.toISOString(),
    compare,
    team: filters?.team,
    owner: filters?.owner,
    status: filters?.status,
  };
}

// ============================================================================
// KPIs Hook
// ============================================================================

export function useProjectsKpis(
  range: DateRange,
  compare: boolean,
  filters?: { team?: string[]; owner?: string[]; status?: ProjectStatus[] }
) {
  const repository = useProjectsAnalyticsRepository();

  return useLiveQuery<ProjectsKpisData>({
    queryKey: ['analytics', 'projects', 'kpis', range.from, range.to, compare, filters],
    queryFn: () => repository.getKpis(buildQuery(range, compare, filters)),
  });
}

// ============================================================================
// Burn Chart Hook
// ============================================================================

export function useProjectsBurn(
  range: DateRange,
  compare: boolean,
  projectId?: string
) {
  const repository = useProjectsAnalyticsRepository();

  return useLiveQuery<BurnChartData>({
    queryKey: ['analytics', 'projects', 'burn', range.from, range.to, compare, projectId],
    queryFn: () => repository.getBurnChart({
      ...buildQuery(range, compare),
      projectId,
    }),
  });
}

// ============================================================================
// Workload Hook
// ============================================================================

export function useWorkload(
  range: DateRange,
  filters?: { team?: string[]; owner?: string[] }
) {
  const repository = useProjectsAnalyticsRepository();

  return useQuery<WorkloadData>({
    queryKey: ['analytics', 'projects', 'workload', range.from, range.to, filters],
    queryFn: () => repository.getWorkload(buildQuery(range, false, filters)),
  });
}

// ============================================================================
// Milestones Hook
// ============================================================================

export function useMilestones(
  range: DateRange,
  filters?: { team?: string[]; owner?: string[] }
) {
  const repository = useProjectsAnalyticsRepository();

  return useQuery<MilestonesData>({
    queryKey: ['analytics', 'projects', 'milestones', range.from, range.to, filters],
    queryFn: () => repository.getMilestones(buildQuery(range, false, filters)),
  });
}

// ============================================================================
// Risks Hook
// ============================================================================

export function useProjectRisks(
  range: DateRange,
  filters?: { team?: string[]; owner?: string[] }
) {
  const repository = useProjectsAnalyticsRepository();

  return useQuery<ProjectRisksData>({
    queryKey: ['analytics', 'projects', 'risks', range.from, range.to, filters],
    queryFn: () => repository.getRisks(buildQuery(range, false, filters)),
  });
}

// ============================================================================
// Health Hook
// ============================================================================

export function useProjectHealth(
  range: DateRange,
  filters?: { team?: string[]; owner?: string[] }
) {
  const repository = useProjectsAnalyticsRepository();

  return useQuery<ProjectHealthData>({
    queryKey: ['analytics', 'projects', 'health', range.from, range.to, filters],
    queryFn: () => repository.getHealth(buildQuery(range, false, filters)),
  });
}

// ============================================================================
// Velocity Hook
// ============================================================================

export function useVelocity(range: DateRange) {
  const repository = useProjectsAnalyticsRepository();

  return useQuery<VelocityData>({
    queryKey: ['analytics', 'projects', 'velocity', range.from, range.to],
    queryFn: () => repository.getVelocity(buildQuery(range, false)),
  });
}

// ============================================================================
// Budget Hook
// ============================================================================

export function useBudget(range: DateRange) {
  const repository = useProjectsAnalyticsRepository();

  return useQuery<BudgetData>({
    queryKey: ['analytics', 'projects', 'budget', range.from, range.to],
    queryFn: () => repository.getBudget(buildQuery(range, false)),
  });
}

// ============================================================================
// Filter Options Hook
// ============================================================================

export function useProjectsFilterOptions() {
  const repository = useProjectsAnalyticsRepository();

  return useQuery<ProjectsFilterOptions>({
    queryKey: ['analytics', 'projects', 'filter-options'],
    queryFn: () => repository.getFilterOptions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
