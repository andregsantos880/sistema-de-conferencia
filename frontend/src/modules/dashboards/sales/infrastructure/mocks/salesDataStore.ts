/**
 * Sales MSW Data Store
 * 
 * Single source of truth for all sales-related mock data.
 * All MSW handlers derive their responses from this filtered dataset.
 * 
 * Principles:
 * - Immutable base data
 * - Deterministic generation
 * - Relational consistency (reps → opportunities → accounts)
 * - Filters affect data; focus never does
 */

import { addDays, format, subDays } from 'date-fns';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Rep {
  id: string;
  name: string;
  team: string;
  region: string;
  quota: number;
}

export interface Account {
  id: string;
  name: string;
  ownerId: string;
  region: string;
  country: string;
  countryCode: string;
  health: 'Good' | 'Warning' | 'Risk';
  lastTouch: Date;
}

export interface Opportunity {
  id: string;
  accountId: string;
  ownerId: string;
  stage: 'Prospect' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  amount: number;
  probability: number;
  createdDate: Date;
  closeDate: Date;
  lastActivityDate: Date;
  isAtRisk: boolean;
  riskScore: 'Low' | 'Medium' | 'High';
}

export interface Activity {
  id: string;
  ownerId: string;
  opportunityId: string | null;
  type: 'call' | 'email' | 'meeting' | 'task';
  timestamp: Date;
  dayOfWeek: number; // 0-6
  hour: number; // 0-23
}

export interface SalesFiltersInput {
  from?: Date;
  to?: Date;
  team?: string | null;
  region?: string | null;
  owner?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Seeded Random Generator (deterministic)
// ─────────────────────────────────────────────────────────────────────────────

function seededRandom(seed: number) {
  let s = Math.abs(seed) % 2147483647 || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Base Data Generation (runs once, immutable)
// ─────────────────────────────────────────────────────────────────────────────

const SEED = 42; // Fixed seed for deterministic data
const rand = seededRandom(SEED);

// Teams and Regions
const TEAMS = ['Enterprise', 'SMB', 'Mid-Market'];
const REGIONS = ['NA', 'EMEA', 'APAC', 'LATAM'];

// Countries by region
const COUNTRIES_BY_REGION: Record<string, Array<{ name: string; code: string }>> = {
  'NA': [
    { name: 'United States', code: 'US' },
    { name: 'Canada', code: 'CA' },
  ],
  'EMEA': [
    { name: 'United Kingdom', code: 'GB' },
    { name: 'Germany', code: 'DE' },
    { name: 'France', code: 'FR' },
  ],
  'APAC': [
    { name: 'Japan', code: 'JP' },
    { name: 'Australia', code: 'AU' },
    { name: 'India', code: 'IN' },
  ],
  'LATAM': [
    { name: 'Brazil', code: 'BR' },
    { name: 'Mexico', code: 'MX' },
  ],
};

// Generate Reps
const REP_NAMES = ['Alex', 'Blake', 'Casey', 'Dana', 'Evan', 'Frankie', 'Gale', 'Harper', 'Jordan', 'Kelly'];
export const REPS: Rep[] = REP_NAMES.map((name, i) => ({
  id: `rep-${i}`,
  name,
  team: TEAMS[i % TEAMS.length],
  region: REGIONS[i % REGIONS.length],
  quota: 150000 + Math.floor(rand() * 100000),
}));

// Generate Accounts (distributed across reps)
export const ACCOUNTS: Account[] = [];
for (let i = 0; i < 50; i++) {
  const rep = REPS[i % REPS.length];
  const region = rep.region;
  const countries = COUNTRIES_BY_REGION[region] || COUNTRIES_BY_REGION['NA'];
  const country = countries[Math.floor(rand() * countries.length)];
  
  ACCOUNTS.push({
    id: `acct-${i}`,
    name: `Company ${i + 1}`,
    ownerId: rep.id,
    region,
    country: country.name,
    countryCode: country.code,
    health: ['Good', 'Warning', 'Risk'][Math.floor(rand() * 3)] as 'Good' | 'Warning' | 'Risk',
    lastTouch: subDays(new Date(), Math.floor(rand() * 30)),
  });
}

// Generate Opportunities (multiple per account)
const STAGES: Opportunity['stage'][] = ['Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
const STAGE_PROBABILITIES: Record<string, number> = {
  'Prospect': 0.1,
  'Qualified': 0.25,
  'Proposal': 0.5,
  'Negotiation': 0.75,
  'Closed Won': 1.0,
  'Closed Lost': 0,
};

export const OPPORTUNITIES: Opportunity[] = [];
for (let i = 0; i < 200; i++) {
  const account = ACCOUNTS[i % ACCOUNTS.length];
  const rep = REPS.find(r => r.id === account.ownerId)!;
  
  // Weight stages to create funnel shape (more early stage, fewer late stage)
  const stageWeights = [0.30, 0.25, 0.20, 0.15, 0.07, 0.03]; // Prospect through Closed Lost
  let stageRoll = rand();
  let stageIndex = 0;
  let cumulative = 0;
  for (let j = 0; j < stageWeights.length; j++) {
    cumulative += stageWeights[j];
    if (stageRoll < cumulative) {
      stageIndex = j;
      break;
    }
  }
  const stage = STAGES[stageIndex];
  
  const amount = Math.floor(5000 + rand() * 95000);
  const probability = STAGE_PROBABILITIES[stage] + (rand() * 0.1 - 0.05);
  const createdDate = subDays(new Date(), Math.floor(rand() * 90) + 30);
  const closeDate = addDays(new Date(), Math.floor(rand() * 60) - 15);
  const lastActivityDate = subDays(new Date(), Math.floor(rand() * 20));
  const daysWithoutActivity = Math.floor((new Date().getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
  const isAtRisk = daysWithoutActivity > 10 && stage !== 'Closed Won' && stage !== 'Closed Lost';
  
  OPPORTUNITIES.push({
    id: `opp-${i}`,
    accountId: account.id,
    ownerId: rep.id,
    stage,
    amount,
    probability: Math.max(0, Math.min(1, probability)),
    createdDate,
    closeDate,
    lastActivityDate,
    isAtRisk,
    riskScore: daysWithoutActivity > 14 ? 'High' : daysWithoutActivity > 7 ? 'Medium' : 'Low',
  });
}

// Generate Activities (distributed across time)
export const ACTIVITIES: Activity[] = [];
for (let i = 0; i < 500; i++) {
  const rep = REPS[Math.floor(rand() * REPS.length)];
  const opp = rand() > 0.3 ? OPPORTUNITIES[Math.floor(rand() * OPPORTUNITIES.length)] : null;
  
  // Business hours bias (9am-6pm)
  const hour = Math.floor(rand() * 24);
  const isBusinessHour = hour >= 9 && hour <= 17;
  const weight = isBusinessHour ? 3 : 1;
  if (rand() * 4 > weight) continue; // Skip some non-business hours
  
  const dayOfWeek = Math.floor(rand() * 7);
  const timestamp = subDays(new Date(), Math.floor(rand() * 30));
  timestamp.setHours(hour);
  
  ACTIVITIES.push({
    id: `act-${i}`,
    ownerId: rep.id,
    opportunityId: opp?.id ?? null,
    type: ['call', 'email', 'meeting', 'task'][Math.floor(rand() * 4)] as Activity['type'],
    timestamp,
    dayOfWeek,
    hour,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter Application (central filter function)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply sales filters to datasets.
 * 
 * Rules:
 * - Filters are ANDed, not ORed
 * - Missing filter = no restriction
 * - Focus state is NEVER passed here (this is filter-only)
 */
export function applySalesFilters(filters: SalesFiltersInput) {
  // Start with all data
  let filteredReps = [...REPS];
  let filteredOpportunities = [...OPPORTUNITIES];
  let filteredAccounts = [...ACCOUNTS];
  let filteredActivities = [...ACTIVITIES];
  
  // Filter by team
  if (filters.team) {
    filteredReps = filteredReps.filter(r => r.team === filters.team);
    const repIds = new Set(filteredReps.map(r => r.id));
    filteredOpportunities = filteredOpportunities.filter(o => repIds.has(o.ownerId));
    filteredAccounts = filteredAccounts.filter(a => repIds.has(a.ownerId));
    filteredActivities = filteredActivities.filter(a => repIds.has(a.ownerId));
  }
  
  // Filter by region
  if (filters.region) {
    filteredReps = filteredReps.filter(r => r.region === filters.region);
    filteredAccounts = filteredAccounts.filter(a => a.region === filters.region);
    const repIds = new Set(filteredReps.map(r => r.id));
    const accountIds = new Set(filteredAccounts.map(a => a.id));
    filteredOpportunities = filteredOpportunities.filter(o => 
      repIds.has(o.ownerId) && accountIds.has(o.accountId)
    );
    filteredActivities = filteredActivities.filter(a => repIds.has(a.ownerId));
  }
  
  // Filter by owner (rep name)
  if (filters.owner) {
    const rep = REPS.find(r => r.name === filters.owner || r.id === filters.owner);
    if (rep) {
      filteredReps = [rep];
      filteredOpportunities = filteredOpportunities.filter(o => o.ownerId === rep.id);
      filteredAccounts = filteredAccounts.filter(a => a.ownerId === rep.id);
      filteredActivities = filteredActivities.filter(a => a.ownerId === rep.id);
    } else {
      // No matching rep - return empty
      filteredReps = [];
      filteredOpportunities = [];
      filteredAccounts = [];
      filteredActivities = [];
    }
  }
  
  // Filter by date range (for opportunities and activities)
  if (filters.from || filters.to) {
    const from = filters.from ?? new Date(0);
    const to = filters.to ?? new Date();
    
    // Opportunities: include if closeDate falls in range OR if still open
    filteredOpportunities = filteredOpportunities.filter(o => {
      const closeTime = o.closeDate.getTime();
      const fromTime = from.getTime();
      const toTime = to.getTime();
      return (closeTime >= fromTime && closeTime <= toTime) || 
             (o.stage !== 'Closed Won' && o.stage !== 'Closed Lost');
    });
    
    // Activities: include if timestamp falls in range
    filteredActivities = filteredActivities.filter(a => {
      const ts = a.timestamp.getTime();
      return ts >= from.getTime() && ts <= to.getTime();
    });
    
    // Update accounts to only include those with opportunities
    const activeAccountIds = new Set(filteredOpportunities.map(o => o.accountId));
    filteredAccounts = filteredAccounts.filter(a => activeAccountIds.has(a.id));
  }
  
  return {
    reps: filteredReps,
    opportunities: filteredOpportunities,
    accounts: filteredAccounts,
    activities: filteredActivities,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Aggregation Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function aggregateFunnel(opportunities: Opportunity[]) {
  const stages: Opportunity['stage'][] = ['Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'];
  
  return stages.map(stage => {
    const stageOpps = opportunities.filter(o => o.stage === stage);
    return {
      name: stage,
      count: stageOpps.length,
      value: stageOpps.reduce((sum, o) => sum + o.amount, 0),
      weighted: stageOpps.length, // Use count for funnel shape
    };
  });
}

export function aggregateRepLeaderboard(opportunities: Opportunity[], reps: Rep[]) {
  return reps.map(rep => {
    const repOpps = opportunities.filter(o => o.ownerId === rep.id);
    const wonOpps = repOpps.filter(o => o.stage === 'Closed Won');
    const revenue = wonOpps.reduce((sum, o) => sum + o.amount, 0);
    const wonDeals = wonOpps.length;
    const avgDealSize = wonDeals > 0 ? Math.floor(revenue / wonDeals) : 0;
    const quotaAttainment = rep.quota > 0 ? revenue / rep.quota : 0;
    
    // Generate sparkline data based on rep position
    const spark = Array.from({ length: 12 }, (_, i) => 
      Math.floor(50 + Math.sin(i + rep.name.charCodeAt(0)) * 30 + 20)
    );
    
    return {
      id: rep.id,
      name: rep.name,
      revenue,
      wonDeals,
      avgDealSize,
      quotaAttainment: Math.min(1.2, quotaAttainment),
      spark,
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

export function aggregateTopAccounts(accounts: Account[], opportunities: Opportunity[], limit = 10) {
  const repsById = new Map(REPS.map(r => [r.id, r]));
  
  return accounts.map(account => {
    const accountOpps = opportunities.filter(o => o.accountId === account.id);
    const pipeline = accountOpps
      .filter(o => o.stage !== 'Closed Won' && o.stage !== 'Closed Lost')
      .reduce((sum, o) => sum + o.amount, 0);
    
    const rep = repsById.get(account.ownerId);
    
    return {
      id: account.id,
      account: account.name,
      owner: rep?.name ?? 'Unknown',
      region: account.region,
      pipeline,
      lastTouch: format(account.lastTouch, 'yyyy-MM-dd'),
      health: account.health,
    };
  })
  .sort((a, b) => b.pipeline - a.pipeline)
  .slice(0, limit);
}

export function aggregateOpportunitiesAtRisk(opportunities: Opportunity[]) {
  const accountsById = new Map(ACCOUNTS.map(a => [a.id, a]));
  
  // Create quick lookup for activities by opportunity
  // (In a real app, this would be a DB query. Here we scan in-memory.)
  const activitiesByOppId = new Map<string, Activity>();
  // We want the LATEST activity for each opp
  ACTIVITIES.forEach(a => {
    if (!a.opportunityId) return;
    const current = activitiesByOppId.get(a.opportunityId);
    if (!current || a.timestamp > current.timestamp) {
      activitiesByOppId.set(a.opportunityId, a);
    }
  });

  return opportunities
    .filter(o => o.isAtRisk && o.stage !== 'Closed Won' && o.stage !== 'Closed Lost')
    .map(o => {
      const account = accountsById.get(o.accountId);
      
      // Calculate global account context (ignoring current filters)
      const accountOpps = OPPORTUNITIES.filter(op => op.accountId === o.accountId && op.stage !== 'Closed Won' && op.stage !== 'Closed Lost');
      const accountPipeline = accountOpps.reduce((sum, op) => sum + op.amount, 0);
      const accountOpenOpps = accountOpps.length;

      const daysWithoutActivity = Math.floor(
        (new Date().getTime() - o.lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const lastActivity = activitiesByOppId.get(o.id);
      
      return {
        id: o.id,
        accountId: o.accountId,
        account: account?.name ?? 'Unknown',
        accountHealth: account?.health ?? 'Warning',
        accountPipeline,
        accountOpenOpps,
        amount: o.amount,
        stage: o.stage,
        probability: o.probability,
        lastActivityDays: daysWithoutActivity,
        lastActivityDate: o.lastActivityDate.toISOString(),
        lastActivityType: lastActivity?.type ?? 'email', // Fallback if missing
        createdDate: o.createdDate.toISOString(),
        closeDate: format(o.closeDate, 'yyyy-MM-dd'),
        riskScore: o.riskScore,
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 20);
}

export function aggregateSalesByLocation(accounts: Account[], opportunities: Opportunity[]) {
  const locationMap = new Map<string, { 
    countryCode: string; 
    countryName: string; 
    orders: number; 
    revenue: number;
  }>();
  
  const baseLocations: Array<{ code: string; name: string; lat: number; lng: number }> = [
    { code: 'US', name: 'United States', lat: 37.0902, lng: -95.7129 },
    { code: 'GB', name: 'United Kingdom', lat: 55.3781, lng: -3.436 },
    { code: 'CA', name: 'Canada', lat: 56.1304, lng: -106.3468 },
    { code: 'DE', name: 'Germany', lat: 51.1657, lng: 10.4515 },
    { code: 'FR', name: 'France', lat: 46.2276, lng: 2.2137 },
    { code: 'BR', name: 'Brazil', lat: -14.235, lng: -51.9253 },
    { code: 'MX', name: 'Mexico', lat: 23.6345, lng: -102.5528 },
    { code: 'AU', name: 'Australia', lat: -25.2744, lng: 133.7751 },
    { code: 'IN', name: 'India', lat: 20.5937, lng: 78.9629 },
    { code: 'JP', name: 'Japan', lat: 36.2048, lng: 138.2529 },
  ];
  
  // Aggregate by country
  accounts.forEach(account => {
    const accountOpps = opportunities.filter(o => o.accountId === account.id);
    const revenue = accountOpps.reduce((sum, o) => sum + o.amount, 0);
    const orders = accountOpps.filter(o => o.stage === 'Closed Won').length;
    
    const existing = locationMap.get(account.countryCode);
    if (existing) {
      existing.orders += orders;
      existing.revenue += revenue;
    } else {
      locationMap.set(account.countryCode, {
        countryCode: account.countryCode,
        countryName: account.country,
        orders,
        revenue,
      });
    }
  });
  
  // Merge with base locations for lat/lng
  return baseLocations.map(loc => {
    const data = locationMap.get(loc.code);
    return {
      id: loc.code.toLowerCase(),
      countryCode: loc.code,
      countryName: loc.name,
      lat: loc.lat,
      lng: loc.lng,
      orders: data?.orders ?? 0,
      revenue: data?.revenue ?? 0,
    };
  }).filter(l => l.orders > 0 || l.revenue > 0);
}

export function aggregateActivitiesHeatmap(activities: Activity[]) {
  // Create 7x24 matrix (days x hours)
  const matrix: number[][] = Array.from({ length: 7 }, () => 
    Array.from({ length: 24 }, () => 0)
  );
  
  activities.forEach(activity => {
    if (activity.dayOfWeek >= 0 && activity.dayOfWeek < 7 &&
        activity.hour >= 0 && activity.hour < 24) {
      matrix[activity.dayOfWeek][activity.hour]++;
    }
  });
  
  return matrix;
}
