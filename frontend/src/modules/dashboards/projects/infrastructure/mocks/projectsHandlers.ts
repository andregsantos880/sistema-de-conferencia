import { http, delay } from 'msw';
import { subDays, format, eachDayOfInterval } from 'date-fns';
import { ok } from '@/mocks/utils/apiResponse';
import { api } from '@/mocks/utils/apiPath';
import type {
  ProjectsKpisData,
  BurnChartData,
  WorkloadData,
  MilestonesData,
  ProjectRisksData,
  ProjectHealthData,
  VelocityData,
  BudgetData,
  ProjectsFilterOptions,
  TrendPoint,
  MilestoneStatus,
  RiskLevel,
  ProjectStatus,
} from '../../domain/models/ProjectsAnalytics';

// ============================================================================
// Seeded Random Utilities
// ============================================================================

function generateSeed(date: Date, metric: string): number {
  const dateStr = format(date, 'yyyy-MM-dd');
  let hash = 0;
  const str = `${dateStr}-${metric}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateValue(date: Date, metric: string, base: number, variance: number): number {
  const seed = generateSeed(date, metric);
  const random = seededRandom(seed);
  return base + (random - 0.5) * variance;
}

function generateTrendSeries(
  from: Date,
  to: Date,
  metric: string,
  base: number,
  variance: number,
  trend: number = 0
): TrendPoint[] {
  const days = eachDayOfInterval({ start: from, end: to });
  return days.map((date, idx) => {
    const trendValue = days.length > 1 ? (idx / (days.length - 1)) * trend : 0;
    return {
      x: date.toISOString(),
      y: Math.max(0, Math.round(generateValue(date, metric, base + trendValue, variance))),
    };
  });
}

// ============================================================================
// Static Data
// ============================================================================

const TEAMS = [
  { id: 'team-1', name: 'Platform Team' },
  { id: 'team-2', name: 'Mobile Team' },
  { id: 'team-3', name: 'Data Team' },
  { id: 'team-4', name: 'DevOps Team' },
  { id: 'team-5', name: 'Frontend Team' },
];

const OWNERS = [
  { id: 'owner-1', name: 'Alex Rivera', avatar: 'AR' },
  { id: 'owner-2', name: 'Maya Patel', avatar: 'MP' },
  { id: 'owner-3', name: 'James Chen', avatar: 'JC' },
  { id: 'owner-4', name: 'Emma Wilson', avatar: 'EW' },
  { id: 'owner-5', name: 'Liam Johnson', avatar: 'LJ' },
  { id: 'owner-6', name: 'Sofia Garcia', avatar: 'SG' },
];

// Projects data used for risk and milestone generation
const _PROJECTS = [
  { id: 'proj-1', name: 'Cloud Migration Phase 2', teamId: 'team-1' },
  { id: 'proj-2', name: 'Payment Gateway Integration', teamId: 'team-2' },
  { id: 'proj-3', name: 'Mobile App v3.0', teamId: 'team-2' },
  { id: 'proj-4', name: 'Data Analytics Platform', teamId: 'team-3' },
  { id: 'proj-5', name: 'CI/CD Pipeline Upgrade', teamId: 'team-4' },
  { id: 'proj-6', name: 'Customer Portal Redesign', teamId: 'team-5' },
  { id: 'proj-7', name: 'API Gateway v2', teamId: 'team-1' },
  { id: 'proj-8', name: 'Real-time Notifications', teamId: 'team-5' },
];
void _PROJECTS; // Suppress unused warning - kept for reference

const MEMBER_ROLES = ['Tech Lead', 'Senior Dev', 'Full Stack', 'UX Designer', 'DevOps', 'Backend Dev', 'Frontend Dev'];

// ============================================================================
// Handlers
// ============================================================================

export const projectsHandlers = [
  // GET analytics/projects/kpis
  http.get(api('/analytics/projects/kpis'), async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const compare = url.searchParams.get('compare') === 'true';

    const fromDate = from ? new Date(from) : subDays(new Date(), 30);
    const toDate = to ? new Date(to) : new Date();

    const buildKpiMetric = (
      metric: string,
      base: number,
      variance: number,
      trend: number,
      prevBase?: number,
      description?: string,
    ) => {
      const series = generateTrendSeries(fromDate, toDate, metric, base, variance, trend);
      const current = series[series.length - 1]?.y ?? base;

      let previous = undefined;
      if (compare && prevBase !== undefined) {
        const duration = toDate.getTime() - fromDate.getTime();
        const prevFrom = new Date(fromDate.getTime() - duration);
        const prevTo = new Date(toDate.getTime() - duration);
        const prevSeries = generateTrendSeries(prevFrom, prevTo, `${metric}-prev`, prevBase, variance * 0.8, trend * 0.7);
        previous = {
          value: prevSeries[prevSeries.length - 1]?.y ?? prevBase,
          trend: prevSeries,
        };
      }

      return { current, trend: series, previous, description };
    };

    const data: ProjectsKpisData = {
      activeProjects: buildKpiMetric(
        'active-projects',
        24,
        3,
        2,
        21,
        'Change in active delivery projects',
      ),
      onTrackProjects: buildKpiMetric(
        'on-track',
        18,
        2,
        1,
        16,
        'Projects currently on track',
      ),
      atRiskProjects: buildKpiMetric(
        'at-risk',
        4,
        1,
        -1,
        5,
        'Projects flagged as at risk',
      ),
      delayedProjects: buildKpiMetric(
        'delayed',
        2,
        1,
        0,
        1,
        'Projects with significant schedule slippage',
      ),
      overdueTasks: buildKpiMetric(
        'overdue-tasks',
        12,
        4,
        -2,
        18,
        'Open tasks that are currently overdue',
      ),
      avgUtilization: {
        current: 78,
        trend: generateTrendSeries(fromDate, toDate, 'utilization', 78, 8, 3),
        previous: compare ? {
          value: 72,
          trend: generateTrendSeries(
            new Date(fromDate.getTime() - (toDate.getTime() - fromDate.getTime())),
            new Date(toDate.getTime() - (toDate.getTime() - fromDate.getTime())),
            'utilization-prev',
            72,
            6,
            2
          ),
        } : undefined,
      },
      avgCycleTime: buildKpiMetric('cycle-time', 14, 3, -1, 16),
    };

    return ok(data);
  }),

  // GET analytics/projects/burn
  http.get(api('/analytics/projects/burn'), async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const compare = url.searchParams.get('compare') === 'true';

    const fromDate = from ? new Date(from) : subDays(new Date(), 56);
    const toDate = to ? new Date(to) : new Date();

    const days = eachDayOfInterval({ start: fromDate, end: toDate });
    const totalScope = 135;

    const series = days.map((date, idx) => {
      const progress = days.length > 1 ? idx / (days.length - 1) : 0;
      const seed = generateSeed(date, 'burn');
      const random = seededRandom(seed);

      // Scope can increase slightly over time (scope creep)
      const scopeVariance = Math.floor(random * 15);
      const total = totalScope + Math.floor(progress * scopeVariance);

      // Completed grows monotonically with some variance
      const idealCompleted = Math.floor(progress * totalScope);
      const completedVariance = Math.floor((random - 0.5) * 8);
      const completed = Math.min(total, Math.max(0, idealCompleted + completedVariance));

      // Ideal is a straight line
      const ideal = Math.floor(progress * totalScope);

      return {
        x: date.toISOString(),
        total,
        completed,
        ideal,
      };
    });

    let previous = undefined;
    if (compare) {
      const duration = toDate.getTime() - fromDate.getTime();
      const prevFrom = new Date(fromDate.getTime() - duration);
      const prevTo = new Date(toDate.getTime() - duration);
      const prevDays = eachDayOfInterval({ start: prevFrom, end: prevTo });

      previous = prevDays.map((date, idx) => {
        const progress = prevDays.length > 1 ? idx / (prevDays.length - 1) : 0;
        const seed = generateSeed(date, 'burn-prev');
        const random = seededRandom(seed);

        const total = 120 + Math.floor(progress * 10);
        const idealCompleted = Math.floor(progress * 120);
        const completedVariance = Math.floor((random - 0.5) * 6);
        const completed = Math.min(total, Math.max(0, idealCompleted + completedVariance));
        const ideal = Math.floor(progress * 120);

        return { x: date.toISOString(), total, completed, ideal };
      });
    }

    const data: BurnChartData = {
      mode: 'burnUp',
      scope: 'storyPoints',
      series,
      previous,
    };

    return ok(data);
  }),

  // GET analytics/projects/workload
  http.get(api('/analytics/projects/workload'), async () => {
    await delay(300);

    const teams = TEAMS.map((team) => {
      const seed = generateSeed(new Date(), `team-${team.id}`);
      const random = seededRandom(seed);
      const utilization = Math.round(60 + random * 35);
      const memberCount = 3 + Math.floor(random * 4);
      const hours = Math.round(memberCount * 40 * (utilization / 100));

      return {
        id: team.id,
        name: team.name,
        utilization,
        hours,
        memberCount,
      };
    });

    const members = OWNERS.map((owner, idx) => {
      const seed = generateSeed(new Date(), `member-${owner.id}`);
      const random = seededRandom(seed);
      const utilization = Math.round(55 + random * 45);
      const hoursCapacity = 40;
      const hours = Math.round(hoursCapacity * (utilization / 100));
      const team = TEAMS[idx % TEAMS.length];

      // Generate recent hours for sparkline
      const recentHours = Array.from({ length: 7 }, (_, i) => {
        const daySeed = generateSeed(subDays(new Date(), 6 - i), `hours-${owner.id}`);
        return Math.round(4 + seededRandom(daySeed) * 6);
      });

      return {
        id: owner.id,
        name: owner.name,
        avatar: owner.avatar,
        role: MEMBER_ROLES[idx % MEMBER_ROLES.length],
        teamId: team.id,
        teamName: team.name,
        utilization,
        hours,
        hoursCapacity,
        recentHours,
      };
    });

    const avgUtilization = Math.round(
      members.reduce((sum, m) => sum + m.utilization, 0) / members.length
    );
    const maxUtilization = Math.max(...members.map(m => m.utilization));

    const data: WorkloadData = {
      teams,
      members,
      avgUtilization,
      maxUtilization,
    };

    return ok(data);
  }),

  // GET analytics/projects/milestones
  http.get(api('/analytics/projects/milestones'), async () => {
    await delay(300);

    const today = new Date();

    const milestones = [
      {
        id: 'ms-1',
        projectId: 'proj-1',
        projectName: 'Cloud Migration Phase 2',
        name: 'Security Audit Complete',
        dueDate: subDays(today, 5).toISOString(),
        status: 'completed' as MilestoneStatus,
        owner: OWNERS[0],
        completedDate: subDays(today, 6).toISOString(),
      },
      {
        id: 'ms-2',
        projectId: 'proj-6',
        projectName: 'Customer Portal Redesign',
        name: 'Design Review',
        dueDate: subDays(today, -4).toISOString(),
        status: 'onTrack' as MilestoneStatus,
        owner: OWNERS[3],
        daysAway: 4,
      },
      {
        id: 'ms-3',
        projectId: 'proj-3',
        projectName: 'Mobile App v3.0',
        name: 'Beta Release',
        dueDate: subDays(today, -11).toISOString(),
        status: 'atRisk' as MilestoneStatus,
        owner: OWNERS[2],
        daysAway: 11,
      },
      {
        id: 'ms-4',
        projectId: 'proj-2',
        projectName: 'Payment Gateway Integration',
        name: 'UAT Sign-off',
        dueDate: subDays(today, -16).toISOString(),
        status: 'onTrack' as MilestoneStatus,
        owner: OWNERS[1],
        daysAway: 16,
      },
      {
        id: 'ms-5',
        projectId: 'proj-4',
        projectName: 'Data Analytics Platform',
        name: 'Go-Live',
        dueDate: subDays(today, -27).toISOString(),
        status: 'onTrack' as MilestoneStatus,
        owner: OWNERS[4],
        daysAway: 27,
      },
      {
        id: 'ms-6',
        projectId: 'proj-5',
        projectName: 'CI/CD Pipeline Upgrade',
        name: 'Production Deployment',
        dueDate: subDays(today, -8).toISOString(),
        status: 'delayed' as MilestoneStatus,
        owner: OWNERS[5],
        daysAway: 8,
      },
    ];

    const data: MilestonesData = {
      milestones,
      upcoming: milestones.filter(m => m.status !== 'completed').length,
      atRisk: milestones.filter(m => m.status === 'atRisk' || m.status === 'delayed').length,
      completed: milestones.filter(m => m.status === 'completed').length,
    };

    return ok(data);
  }),

  // GET analytics/projects/risks
  http.get(api('/analytics/projects/risks'), async () => {
    await delay(300);

    const today = new Date();

    const risks = [
      {
        id: 'risk-1',
        projectId: 'proj-1',
        projectName: 'Cloud Migration Phase 2',
        title: 'Resource bottleneck',
        description: 'Key team members overallocated across multiple projects',
        level: 'high' as RiskLevel,
        owner: OWNERS[0],
        impactedDate: subDays(today, -20).toISOString(),
        probability: 0.8,
        impact: 15,
        riskScore: 12,
        daysDelayed: 12,
        progress: 45,
      },
      {
        id: 'risk-2',
        projectId: 'proj-2',
        projectName: 'Payment Gateway Integration',
        title: 'Vendor dependency',
        description: 'Third-party API documentation incomplete',
        level: 'high' as RiskLevel,
        owner: OWNERS[1],
        impactedDate: subDays(today, -15).toISOString(),
        probability: 0.7,
        impact: 12,
        riskScore: 8.4,
        daysDelayed: 8,
        progress: 62,
      },
      {
        id: 'risk-3',
        projectId: 'proj-3',
        projectName: 'Mobile App v3.0',
        title: 'Scope creep',
        description: 'Additional features requested after sprint planning',
        level: 'medium' as RiskLevel,
        owner: OWNERS[2],
        impactedDate: subDays(today, -25).toISOString(),
        probability: 0.6,
        impact: 8,
        riskScore: 4.8,
        daysDelayed: 5,
        progress: 78,
      },
      {
        id: 'risk-4',
        projectId: 'proj-4',
        projectName: 'Data Analytics Platform',
        title: 'Technical debt',
        description: 'Legacy code integration causing delays',
        level: 'medium' as RiskLevel,
        owner: OWNERS[3],
        impactedDate: subDays(today, -30).toISOString(),
        probability: 0.5,
        impact: 6,
        riskScore: 3,
        daysDelayed: 3,
        progress: 55,
      },
      {
        id: 'risk-5',
        projectId: 'proj-7',
        projectName: 'API Gateway v2',
        title: 'Performance concerns',
        description: 'Load testing reveals potential bottlenecks',
        level: 'low' as RiskLevel,
        owner: OWNERS[4],
        impactedDate: subDays(today, -40).toISOString(),
        probability: 0.3,
        impact: 4,
        riskScore: 1.2,
        progress: 82,
      },
    ];

    const data: ProjectRisksData = {
      risks: risks.sort((a, b) => b.riskScore - a.riskScore),
      highRiskCount: risks.filter(r => r.level === 'high' || r.level === 'critical').length,
      totalRiskScore: risks.reduce((sum, r) => sum + r.riskScore, 0),
    };

    return ok(data);
  }),

  // GET analytics/projects/health
  http.get(api('/analytics/projects/health'), async () => {
    await delay(300);

    const distribution = [
      { status: 'onTrack' as ProjectStatus, count: 18, percentage: 75 },
      { status: 'atRisk' as ProjectStatus, count: 4, percentage: 16.7 },
      { status: 'delayed' as ProjectStatus, count: 2, percentage: 8.3 },
      { status: 'completed' as ProjectStatus, count: 0, percentage: 0 },
    ];

    const byTeam = TEAMS.slice(0, 3).map(team => {
      const seed = generateSeed(new Date(), `health-${team.id}`);
      const random = seededRandom(seed);
      const onTrack = Math.floor(3 + random * 3);
      const atRisk = Math.floor(random * 2);
      const delayed = random > 0.7 ? 1 : 0;
      const total = onTrack + atRisk + delayed;

      return {
        teamId: team.id,
        teamName: team.name,
        distribution: [
          { status: 'onTrack' as ProjectStatus, count: onTrack, percentage: Math.round((onTrack / total) * 100) },
          { status: 'atRisk' as ProjectStatus, count: atRisk, percentage: Math.round((atRisk / total) * 100) },
          { status: 'delayed' as ProjectStatus, count: delayed, percentage: Math.round((delayed / total) * 100) },
          { status: 'completed' as ProjectStatus, count: 0, percentage: 0 },
        ],
      };
    });

    const data: ProjectHealthData = {
      distribution,
      total: 24,
      byTeam,
    };

    return ok(data);
  }),

  // GET analytics/projects/velocity
  http.get(api('/analytics/projects/velocity'), async () => {
    await delay(300);

    const sprints = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

    const series = sprints.map((sprint, idx) => {
      const seed = generateSeed(new Date(), `velocity-${sprint}`);
      const random = seededRandom(seed);
      const baseVelocity = 42 + idx * 3;
      const velocity = Math.round(baseVelocity + (random - 0.5) * 10);
      const commitment = Math.round(baseVelocity + 3 + (random - 0.3) * 5);

      return { sprint, velocity, commitment };
    });

    const avgVelocity = Math.round(
      series.reduce((sum, s) => sum + s.velocity, 0) / series.length
    );

    const firstVelocity = series[0]?.velocity ?? avgVelocity;
    const lastVelocity = series[series.length - 1]?.velocity ?? avgVelocity;
    const trend = Math.round(((lastVelocity - firstVelocity) / firstVelocity) * 100);

    const data: VelocityData = {
      series,
      avgVelocity,
      trend,
    };

    return ok(data);
  }),

  // GET analytics/projects/budget
  http.get(api('/analytics/projects/budget'), async () => {
    await delay(300);

    const total = 2500000;
    const spent = 1875000;
    const remaining = total - spent;
    const burnRate = 125000;
    const projected = 2650000;

    const data: BudgetData = {
      total,
      spent,
      remaining,
      burnRate,
      projected,
      isOverBudget: projected > total,
    };

    return ok(data);
  }),

  // GET analytics/projects/filter-options
  http.get(api('/analytics/projects/filter-options'), async () => {
    await delay(200);

    const data: ProjectsFilterOptions = {
      teams: TEAMS,
      owners: OWNERS.map(o => ({ id: o.id, name: o.name })),
      statuses: [
        { id: 'onTrack', name: 'On Track' },
        { id: 'atRisk', name: 'At Risk' },
        { id: 'delayed', name: 'Delayed' },
        { id: 'completed', name: 'Completed' },
      ],
    };

    return ok(data);
  }),
];
