/**
 * Domain models for Projects Analytics Dashboard
 */

// ============================================================================
// KPI Types
// ============================================================================

export interface TrendPoint {
  x: string;
  y: number;
}

export interface KpiMetric {
  current: number;
  trend: TrendPoint[];
  previous?: {
    value: number;
    trend: TrendPoint[];
  };
  /** Optional human-readable description for this KPI, provided by the API */
  description?: string;
}

export interface ProjectsKpisData {
  activeProjects: KpiMetric;
  onTrackProjects: KpiMetric;
  atRiskProjects: KpiMetric;
  delayedProjects: KpiMetric;
  overdueTasks: KpiMetric;
  avgUtilization: KpiMetric;
  avgCycleTime: KpiMetric;
}

// ============================================================================
// Burn Chart Types
// ============================================================================

export type BurnChartMode = 'burnUp' | 'burnDown';
export type BurnChartScope = 'tasks' | 'storyPoints' | 'hours';

export interface BurnPoint {
  x: string;
  total: number;
  completed: number;
  ideal: number;
}

export interface BurnChartData {
  projectId?: string;
  projectName?: string;
  mode: BurnChartMode;
  scope: BurnChartScope;
  series: BurnPoint[];
  previous?: BurnPoint[];
}

// ============================================================================
// Workload Types
// ============================================================================

export interface TeamWorkload {
  id: string;
  name: string;
  utilization: number;
  hours: number;
  memberCount: number;
}

export interface MemberWorkload {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  teamId: string;
  teamName: string;
  utilization: number;
  hours: number;
  hoursCapacity: number;
  recentHours?: number[];
}

export interface WorkloadData {
  teams: TeamWorkload[];
  members: MemberWorkload[];
  avgUtilization: number;
  maxUtilization: number;
}

// ============================================================================
// Milestone Types
// ============================================================================

export type MilestoneStatus = 'completed' | 'onTrack' | 'atRisk' | 'delayed';

export interface Milestone {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  dueDate: string;
  status: MilestoneStatus;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  daysAway?: number;
  completedDate?: string;
}

export interface MilestonesData {
  milestones: Milestone[];
  upcoming: number;
  atRisk: number;
  completed: number;
}

// ============================================================================
// Risk Types
// ============================================================================

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ProjectRisk {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  level: RiskLevel;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  impactedDate: string;
  probability: number;
  impact: number;
  riskScore: number;
  daysDelayed?: number;
  progress?: number;
}

export interface ProjectRisksData {
  risks: ProjectRisk[];
  highRiskCount: number;
  totalRiskScore: number;
}

// ============================================================================
// Project Health Types
// ============================================================================

export type ProjectStatus = 'onTrack' | 'atRisk' | 'delayed' | 'completed';

export interface ProjectHealthItem {
  status: ProjectStatus;
  count: number;
  percentage: number;
}

export interface ProjectHealthData {
  distribution: ProjectHealthItem[];
  total: number;
  byTeam?: Array<{
    teamId: string;
    teamName: string;
    distribution: ProjectHealthItem[];
  }>;
}

// ============================================================================
// Velocity Types
// ============================================================================

export interface VelocityPoint {
  sprint: string;
  velocity: number;
  commitment: number;
}

export interface VelocityData {
  series: VelocityPoint[];
  avgVelocity: number;
  trend: number;
}

// ============================================================================
// Budget Types
// ============================================================================

export interface BudgetData {
  total: number;
  spent: number;
  remaining: number;
  burnRate: number;
  projected: number;
  isOverBudget: boolean;
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface ProjectsAnalyticsQuery {
  from?: string;
  to?: string;
  compare?: boolean;
  team?: string[];
  owner?: string[];
  status?: ProjectStatus[];
  projectId?: string;
}

// ============================================================================
// Filter Options
// ============================================================================

export interface FilterOption {
  id: string;
  name: string;
}

export interface ProjectsFilterOptions {
  teams: FilterOption[];
  owners: FilterOption[];
  statuses: Array<{ id: ProjectStatus; name: string }>;
}
