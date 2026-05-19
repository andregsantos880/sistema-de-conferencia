import type {
  ProjectsKpisData,
  BurnChartData,
  WorkloadData,
  MilestonesData,
  ProjectRisksData,
  ProjectHealthData,
  VelocityData,
  BudgetData,
  ProjectsAnalyticsQuery,
  ProjectsFilterOptions,
} from '../models/ProjectsAnalytics';

/**
 * Repository interface for Projects Analytics data
 */
export interface IProjectsAnalyticsRepository {
  /**
   * Get KPI metrics for the projects dashboard
   */
  getKpis(query: ProjectsAnalyticsQuery): Promise<ProjectsKpisData>;

  /**
   * Get burn chart data (burn-up or burn-down)
   */
  getBurnChart(query: ProjectsAnalyticsQuery): Promise<BurnChartData>;

  /**
   * Get workload data by team and member
   */
  getWorkload(query: ProjectsAnalyticsQuery): Promise<WorkloadData>;

  /**
   * Get upcoming and recent milestones
   */
  getMilestones(query: ProjectsAnalyticsQuery): Promise<MilestonesData>;

  /**
   * Get project risks
   */
  getRisks(query: ProjectsAnalyticsQuery): Promise<ProjectRisksData>;

  /**
   * Get project health distribution
   */
  getHealth(query: ProjectsAnalyticsQuery): Promise<ProjectHealthData>;

  /**
   * Get velocity trend data
   */
  getVelocity(query: ProjectsAnalyticsQuery): Promise<VelocityData>;

  /**
   * Get budget overview data
   */
  getBudget(query: ProjectsAnalyticsQuery): Promise<BudgetData>;

  /**
   * Get available filter options
   */
  getFilterOptions(): Promise<ProjectsFilterOptions>;
}
