import { injectable, inject } from 'inversify';
import { CORE_SYMBOLS } from '@/core/di/symbols';
import type { IHttpClient } from '@/shared/infrastructure/http/HttpClient';
import { BaseRepository } from '@/shared/infrastructure/repositories';
import type { IProjectsAnalyticsRepository } from '../../domain/ports/IProjectsAnalyticsRepository';
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
} from '../../domain/models/ProjectsAnalytics';

/**
 * HTTP implementation of Projects Analytics Repository
 * Extends BaseRepository for consistent response handling
 */
@injectable()
export class ProjectsAnalyticsRepository extends BaseRepository implements IProjectsAnalyticsRepository {
  private readonly baseUrl = '/analytics/projects';

  constructor(@inject(CORE_SYMBOLS.IHttpClient) http: IHttpClient) {
    super(http);
  }

  /**
   * Build query string from ProjectsAnalyticsQuery
   */
  private buildAnalyticsQuery(query: ProjectsAnalyticsQuery): string {
    return this.buildQueryString({
      from: query.from,
      to: query.to,
      compare: query.compare ? 'true' : undefined,
      team: query.team?.join(',') || undefined,
      owner: query.owner?.join(',') || undefined,
      status: query.status?.join(',') || undefined,
      projectId: query.projectId,
    });
  }

  async getKpis(query: ProjectsAnalyticsQuery): Promise<ProjectsKpisData> {
    const qs = this.buildAnalyticsQuery(query);
    return this.get<ProjectsKpisData>(
      this.appendQuery(`${this.baseUrl}/kpis`, qs),
      'Failed to fetch projects KPIs'
    );
  }

  async getBurnChart(query: ProjectsAnalyticsQuery): Promise<BurnChartData> {
    const qs = this.buildAnalyticsQuery(query);
    return this.get<BurnChartData>(
      this.appendQuery(`${this.baseUrl}/burn`, qs),
      'Failed to fetch burn chart data'
    );
  }

  async getWorkload(query: ProjectsAnalyticsQuery): Promise<WorkloadData> {
    const qs = this.buildAnalyticsQuery(query);
    return this.get<WorkloadData>(
      this.appendQuery(`${this.baseUrl}/workload`, qs),
      'Failed to fetch workload data'
    );
  }

  async getMilestones(query: ProjectsAnalyticsQuery): Promise<MilestonesData> {
    const qs = this.buildAnalyticsQuery(query);
    return this.get<MilestonesData>(
      this.appendQuery(`${this.baseUrl}/milestones`, qs),
      'Failed to fetch milestones data'
    );
  }

  async getRisks(query: ProjectsAnalyticsQuery): Promise<ProjectRisksData> {
    const qs = this.buildAnalyticsQuery(query);
    return this.get<ProjectRisksData>(
      this.appendQuery(`${this.baseUrl}/risks`, qs),
      'Failed to fetch project risks'
    );
  }

  async getHealth(query: ProjectsAnalyticsQuery): Promise<ProjectHealthData> {
    const qs = this.buildAnalyticsQuery(query);
    return this.get<ProjectHealthData>(
      this.appendQuery(`${this.baseUrl}/health`, qs),
      'Failed to fetch project health data'
    );
  }

  async getVelocity(query: ProjectsAnalyticsQuery): Promise<VelocityData> {
    const qs = this.buildAnalyticsQuery(query);
    return this.get<VelocityData>(
      this.appendQuery(`${this.baseUrl}/velocity`, qs),
      'Failed to fetch velocity data'
    );
  }

  async getBudget(query: ProjectsAnalyticsQuery): Promise<BudgetData> {
    const qs = this.buildAnalyticsQuery(query);
    return this.get<BudgetData>(
      this.appendQuery(`${this.baseUrl}/budget`, qs),
      'Failed to fetch budget data'
    );
  }

  async getFilterOptions(): Promise<ProjectsFilterOptions> {
    return this.get<ProjectsFilterOptions>(
      `${this.baseUrl}/filter-options`,
      'Failed to fetch filter options'
    );
  }
}
