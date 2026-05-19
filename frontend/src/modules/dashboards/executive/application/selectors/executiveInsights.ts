/**
 * Executive Insights Selector
 * 
 * Derives actionable insights from raw dashboard data using rule-based logic.
 * No AI generation - purely deterministic based on thresholds and business rules.
 */

import type {
  MrrData,
  ChurnData,
  TopProductsData,
  RetentionData,
  RevenueVsTargetData,
  MrrMovementsData,
} from '../../domain/models/ExecutiveAnalytics';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type InsightSeverity = 'positive' | 'neutral' | 'warning' | 'critical';
export type StatusLabel = 'above_plan' | 'on_track' | 'healthy' | 'at_risk' | 'critical';

export interface ExecutiveInsight {
  id: string;
  type: 'risk' | 'opportunity';
  severity: InsightSeverity;
  title: string;
  description: string;
  metric?: string;
  value?: number | string;
}

export interface KpiStatus {
  label: StatusLabel;
  target?: number;
  gap?: number;
  gapPercent?: number;
}

export interface ExecutiveSummary {
  headline: string;
  bullets: string[];
  overallSentiment: 'positive' | 'neutral' | 'negative';
}

export interface MrrMovementsSummary {
  netMrr: number;
  primaryDriver: 'new' | 'expansion' | 'contraction' | 'churn';
  driverAmount: number;
}

export interface ProductInsight {
  id: string;
  name: string;
  revenue: number;
  revenueShare: number;
  isHighMargin: boolean;
  isDeclining: boolean;
  isConcentrationRisk: boolean;
}

export interface RetentionInsight {
  isVolatile: boolean;
  volatilityScore: number;
  hasSharpDrop: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

// ─────────────────────────────────────────────────────────────────────────────
// Thresholds & Configuration
// ─────────────────────────────────────────────────────────────────────────────

const THRESHOLDS = {
  churn: {
    healthy: 3.0,
    warning: 5.0,
    critical: 7.0,
  },
  revenueGap: {
    aheadPercent: 5,
    behindWarning: -5,
    behindCritical: -15,
  },
  productConcentration: {
    riskThreshold: 0.40, // 40% of revenue from single product
  },
  margin: {
    highThreshold: 75,
  },
  retention: {
    volatilityThreshold: 5, // Standard deviation threshold
    sharpDropThreshold: 10, // >10% drop between consecutive periods
  },
  mrrGrowth: {
    strong: 5,
    weak: 0,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MRR Movement Calculation
// ─────────────────────────────────────────────────────────────────────────────

export function computeMrrMovementsSummary(data: MrrMovementsData): MrrMovementsSummary {
  const points = data.current;
  if (!points.length) {
    return { netMrr: 0, primaryDriver: 'new', driverAmount: 0 };
  }

  // Sum all movements across the period
  const totals = points.reduce(
    (acc, p) => ({
      new: acc.new + p.new,
      expansion: acc.expansion + p.expansion,
      contraction: acc.contraction + Math.abs(p.contraction),
      churn: acc.churn + Math.abs(p.churn),
      net: acc.net + p.net,
    }),
    { new: 0, expansion: 0, contraction: 0, churn: 0, net: 0 }
  );

  // Determine primary driver
  const drivers: Array<{ key: MrrMovementsSummary['primaryDriver']; value: number }> = [
    { key: 'new', value: totals.new },
    { key: 'expansion', value: totals.expansion },
    { key: 'contraction', value: totals.contraction },
    { key: 'churn', value: totals.churn },
  ];

  const sorted = drivers.sort((a, b) => b.value - a.value);
  const primaryDriver = sorted[0];

  return {
    netMrr: totals.net,
    primaryDriver: primaryDriver.key,
    driverAmount: primaryDriver.value,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Revenue vs Target Gap
// ─────────────────────────────────────────────────────────────────────────────

export function computeRevenueGap(data: RevenueVsTargetData): { 
  gap: number; 
  gapPercent: number; 
  status: StatusLabel;
  currentRevenue: number;
  currentTarget: number;
} {
  const revenueSeries = data.series.find(s => s.name === 'Revenue')?.data ?? [];
  const targetSeries = data.series.find(s => s.name === 'Target')?.data ?? [];

  // Get latest values
  const latestRevenue = revenueSeries[revenueSeries.length - 1]?.y ?? 0;
  const latestTarget = targetSeries[targetSeries.length - 1]?.y ?? 0;

  const gap = latestRevenue - latestTarget;
  const gapPercent = latestTarget > 0 ? (gap / latestTarget) * 100 : 0;

  let status: StatusLabel = 'on_track';
  if (gapPercent >= THRESHOLDS.revenueGap.aheadPercent) {
    status = 'above_plan';
  } else if (gapPercent <= THRESHOLDS.revenueGap.behindCritical) {
    status = 'critical';
  } else if (gapPercent <= THRESHOLDS.revenueGap.behindWarning) {
    status = 'at_risk';
  }

  return { gap, gapPercent, status, currentRevenue: latestRevenue, currentTarget: latestTarget };
}

// ─────────────────────────────────────────────────────────────────────────────
// Churn Status
// ─────────────────────────────────────────────────────────────────────────────

export function computeChurnStatus(data: ChurnData): KpiStatus {
  const churnRate = data.current;
  
  let label: StatusLabel = 'healthy';
  if (churnRate >= THRESHOLDS.churn.critical) {
    label = 'critical';
  } else if (churnRate >= THRESHOLDS.churn.warning) {
    label = 'at_risk';
  }

  return {
    label,
    target: THRESHOLDS.churn.healthy,
    gap: churnRate - THRESHOLDS.churn.healthy,
    gapPercent: ((churnRate - THRESHOLDS.churn.healthy) / THRESHOLDS.churn.healthy) * 100,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Product Insights
// ─────────────────────────────────────────────────────────────────────────────

export function computeProductInsights(data: TopProductsData): ProductInsight[] {
  const totalRevenue = data.products.reduce((sum, p) => sum + p.revenue, 0);

  return data.products.map(product => {
    const revenueShare = totalRevenue > 0 ? product.revenue / totalRevenue : 0;
    
    // Check if trend is declining (compare first vs last spark values)
    const spark = product.spark;
    const firstHalf = spark.slice(0, Math.floor(spark.length / 2));
    const secondHalf = spark.slice(Math.floor(spark.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const isDeclining = secondAvg < firstAvg * 0.9; // 10% decline

    return {
      id: product.id,
      name: product.name,
      revenue: product.revenue,
      revenueShare,
      isHighMargin: product.grossMargin >= THRESHOLDS.margin.highThreshold,
      isDeclining,
      isConcentrationRisk: revenueShare >= THRESHOLDS.productConcentration.riskThreshold,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Retention Volatility Detection
// ─────────────────────────────────────────────────────────────────────────────

export function computeRetentionInsight(data: RetentionData): RetentionInsight {
  const values = data.series.map(p => p.retention);
  
  if (values.length < 3) {
    return { isVolatile: false, volatilityScore: 0, hasSharpDrop: false, riskLevel: 'low' };
  }

  // Calculate standard deviation
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Check for sharp drops
  let hasSharpDrop = false;
  for (let i = 1; i < values.length; i++) {
    const drop = values[i - 1] - values[i];
    if (drop >= THRESHOLDS.retention.sharpDropThreshold) {
      hasSharpDrop = true;
      break;
    }
  }

  const isVolatile = stdDev >= THRESHOLDS.retention.volatilityThreshold;
  
  let riskLevel: RetentionInsight['riskLevel'] = 'low';
  if (hasSharpDrop || stdDev >= THRESHOLDS.retention.volatilityThreshold * 1.5) {
    riskLevel = 'high';
  } else if (isVolatile) {
    riskLevel = 'medium';
  }

  return {
    isVolatile,
    volatilityScore: stdDev,
    hasSharpDrop,
    riskLevel,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate Risks & Opportunities
// ─────────────────────────────────────────────────────────────────────────────

export interface InsightGeneratorInput {
  mrr?: MrrData;
  churn?: ChurnData;
  products?: TopProductsData;
  retention?: RetentionData;
  revenueVsTarget?: RevenueVsTargetData;
  mrrMovements?: MrrMovementsData;
}

export function generateInsights(input: InsightGeneratorInput): {
  risks: ExecutiveInsight[];
  opportunities: ExecutiveInsight[];
} {
  const risks: ExecutiveInsight[] = [];
  const opportunities: ExecutiveInsight[] = [];

  // Churn-based insights
  if (input.churn) {
    const churnStatus = computeChurnStatus(input.churn);
    if (churnStatus.label === 'critical') {
      risks.push({
        id: 'churn-critical',
        type: 'risk',
        severity: 'critical',
        title: 'Critical Churn Rate',
        description: `Churn at ${input.churn.current.toFixed(1)}% exceeds critical threshold`,
        metric: 'churn',
        value: input.churn.current,
      });
    } else if (churnStatus.label === 'at_risk') {
      risks.push({
        id: 'churn-warning',
        type: 'risk',
        severity: 'warning',
        title: 'Elevated Churn Rate',
        description: `Churn trending above healthy levels at ${input.churn.current.toFixed(1)}%`,
        metric: 'churn',
        value: input.churn.current,
      });
    }

    if (input.churn.delta < -10) {
      opportunities.push({
        id: 'churn-improving',
        type: 'opportunity',
        severity: 'positive',
        title: 'Churn Improving',
        description: `Churn decreased ${Math.abs(input.churn.delta).toFixed(1)}% - momentum to build on`,
        metric: 'churn_delta',
        value: input.churn.delta,
      });
    }
  }

  // Revenue gap insights
  if (input.revenueVsTarget) {
    const gapData = computeRevenueGap(input.revenueVsTarget);
    if (gapData.status === 'critical') {
      risks.push({
        id: 'revenue-critical',
        type: 'risk',
        severity: 'critical',
        title: 'Significant Revenue Shortfall',
        description: `Revenue ${Math.abs(gapData.gapPercent).toFixed(1)}% below target`,
        metric: 'revenue_gap',
        value: gapData.gap,
      });
    } else if (gapData.status === 'at_risk') {
      risks.push({
        id: 'revenue-warning',
        type: 'risk',
        severity: 'warning',
        title: 'Below Revenue Target',
        description: `Revenue tracking ${Math.abs(gapData.gapPercent).toFixed(1)}% below plan`,
        metric: 'revenue_gap',
        value: gapData.gap,
      });
    } else if (gapData.status === 'above_plan') {
      opportunities.push({
        id: 'revenue-ahead',
        type: 'opportunity',
        severity: 'positive',
        title: 'Revenue Exceeding Target',
        description: `Tracking ${gapData.gapPercent.toFixed(1)}% above plan`,
        metric: 'revenue_gap',
        value: gapData.gap,
      });
    }
  }

  // Product concentration risk
  if (input.products) {
    const productInsights = computeProductInsights(input.products);
    const concentrationRisk = productInsights.find(p => p.isConcentrationRisk);
    if (concentrationRisk) {
      risks.push({
        id: 'product-concentration',
        type: 'risk',
        severity: 'warning',
        title: 'Revenue Concentration Risk',
        description: `${concentrationRisk.name} represents ${(concentrationRisk.revenueShare * 100).toFixed(0)}% of total revenue`,
        metric: 'concentration',
        value: concentrationRisk.revenueShare,
      });
    }

    const decliningProducts = productInsights.filter(p => p.isDeclining);
    if (decliningProducts.length > 0) {
      risks.push({
        id: 'products-declining',
        type: 'risk',
        severity: 'warning',
        title: 'Declining Product Performance',
        description: `${decliningProducts.length} product(s) showing declining trends`,
        metric: 'declining_products',
        value: decliningProducts.length,
      });
    }

    const highMarginProducts = productInsights.filter(p => p.isHighMargin && !p.isDeclining);
    if (highMarginProducts.length > 0) {
      opportunities.push({
        id: 'high-margin-opportunity',
        type: 'opportunity',
        severity: 'positive',
        title: 'High-Margin Growth',
        description: `${highMarginProducts.length} high-margin product(s) performing well`,
        metric: 'high_margin',
        value: highMarginProducts.length,
      });
    }
  }

  // Retention volatility
  if (input.retention) {
    const retentionInsight = computeRetentionInsight(input.retention);
    if (retentionInsight.riskLevel === 'high') {
      risks.push({
        id: 'retention-volatile',
        type: 'risk',
        severity: 'warning',
        title: 'Retention Volatility Detected',
        description: retentionInsight.hasSharpDrop 
          ? 'Sharp retention drop detected in recent period'
          : 'Unusual retention fluctuations observed',
        metric: 'retention_volatility',
        value: retentionInsight.volatilityScore,
      });
    }
  }

  // Limit to top 3 each
  return {
    risks: risks.slice(0, 3),
    opportunities: opportunities.slice(0, 3),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate Executive Summary
// ─────────────────────────────────────────────────────────────────────────────

export function generateExecutiveSummary(input: InsightGeneratorInput): ExecutiveSummary {
  const bullets: string[] = [];
  let overallSentiment: ExecutiveSummary['overallSentiment'] = 'neutral';
  let positiveCount = 0;
  let negativeCount = 0;

  // MRR headline
  if (input.mrr && input.mrrMovements) {
    const mrrChange = input.mrr.delta;
    const direction = mrrChange > 0 ? 'increased' : mrrChange < 0 ? 'decreased' : 'remained flat';
    const mrrSummary = computeMrrMovementsSummary(input.mrrMovements);
    
    const driverLabel = mrrSummary.primaryDriver === 'new' ? 'new revenue' :
      mrrSummary.primaryDriver === 'expansion' ? 'expansion revenue' :
      mrrSummary.primaryDriver === 'contraction' ? 'contraction' : 'churn';

    bullets.push(`MRR ${direction} ${Math.abs(mrrChange).toFixed(1)}%, driven primarily by ${driverLabel}`);
    
    if (mrrChange >= THRESHOLDS.mrrGrowth.strong) positiveCount++;
    else if (mrrChange < THRESHOLDS.mrrGrowth.weak) negativeCount++;
  }

  // Churn status
  if (input.churn) {
    const churnDelta = input.churn.delta;
    if (churnDelta < -5) {
      bullets.push(`Churn declined ${Math.abs(churnDelta).toFixed(0)}%`);
      positiveCount++;
    } else if (churnDelta > 10) {
      bullets.push(`Churn increased ${churnDelta.toFixed(0)}%`);
      negativeCount++;
    }
  }

  // Top product concentration
  if (input.products) {
    const insights = computeProductInsights(input.products);
    const topProduct = insights[0];
    if (topProduct) {
      bullets.push(`${topProduct.name} accounts for ${(topProduct.revenueShare * 100).toFixed(0)}% of total revenue`);
    }
  }

  // Revenue vs target
  if (input.revenueVsTarget) {
    const gapData = computeRevenueGap(input.revenueVsTarget);
    if (gapData.status === 'above_plan') {
      bullets.push(`Revenue ${gapData.gapPercent.toFixed(1)}% ahead of target`);
      positiveCount++;
    } else if (gapData.status === 'at_risk' || gapData.status === 'critical') {
      bullets.push(`Revenue ${Math.abs(gapData.gapPercent).toFixed(1)}% below target`);
      negativeCount++;
    }
  }

  // Determine overall sentiment
  if (positiveCount > negativeCount + 1) {
    overallSentiment = 'positive';
  } else if (negativeCount > positiveCount + 1) {
    overallSentiment = 'negative';
  }

  // Generate headline
  const headline = bullets.slice(0, 2).join(', while ').replace(/, while$/, '') + '.';

  return {
    headline,
    bullets,
    overallSentiment,
  };
}
