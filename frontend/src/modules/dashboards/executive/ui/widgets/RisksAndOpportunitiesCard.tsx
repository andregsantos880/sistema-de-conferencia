/**
 * RisksAndOpportunitiesCard
 * 
 * Explicitly answers: "What should leadership worry about or act on?"
 * Displays up to 3 risks and 3 opportunities derived from dashboard data.
 */

import { Card, CardContent, CardHeader } from '@/shared/ui/shadcn/components/ui/card';
import { WidgetHeader } from '../../../shared/components/WidgetHeader';
import { AlertTriangle, Rocket, TrendingDown, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/shadcn/lib/utils';
import { useExecutiveInsights } from '../../application/hooks/useExecutiveInsights';
import type { DateRange } from '../../../shared/utils/dateRange';
import type { ExecutiveInsight, InsightSeverity } from '../../application/selectors/executiveInsights';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/shared/ui/components/Skeleton';

export interface RisksAndOpportunitiesCardProps {
  range: DateRange;
  compare: boolean;
}

const severityConfig: Record<InsightSeverity, { icon: typeof AlertTriangle; color: string; bg: string }> = {
  critical: {
    icon: AlertCircle,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  neutral: {
    icon: TrendingUp,
    color: 'text-muted-foreground',
    bg: 'bg-muted/50',
  },
  positive: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
};

function InsightItem({ insight, index }: { insight: ExecutiveInsight; index: number }) {
  const config = severityConfig[insight.severity];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg transition-colors',
        config.bg,
        'hover:brightness-95 dark:hover:brightness-110'
      )}
    >
      <div className={cn('flex-shrink-0 mt-0.5', config.color)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{insight.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{insight.description}</p>
      </div>
    </motion.div>
  );
}

function EmptyState({ type }: { type: 'risks' | 'opportunities' }) {
  const Icon = type === 'risks' ? CheckCircle2 : TrendingDown;
  const message = type === 'risks' 
    ? 'No significant risks detected' 
    : 'No immediate opportunities identified';

  return (
    <div className="flex items-center gap-2 py-3 px-3 text-muted-foreground">
      <Icon className="w-4 h-4" />
      <span className="text-sm">{message}</span>
    </div>
  );
}

export function RisksAndOpportunitiesCard({ range, compare }: RisksAndOpportunitiesCardProps) {
  const { t } = useTranslation('dashboards');
  const { risks, opportunities, isLoading } = useExecutiveInsights(range, compare);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <WidgetHeader title={t('executive.risksOpportunities', 'Risks & Opportunities')} />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary/5">
      <CardHeader>
        <WidgetHeader title={t('executive.risksOpportunities', 'Risks & Opportunities')} />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Risks Section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('executive.risks', 'Risks')}
            </span>
          </div>
          <div className="space-y-2">
            {risks.length > 0 ? (
              risks.map((risk, idx) => (
                <InsightItem key={risk.id} insight={risk} index={idx} />
              ))
            ) : (
              <EmptyState type="risks" />
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Opportunities Section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('executive.opportunities', 'Opportunities')}
            </span>
          </div>
          <div className="space-y-2">
            {opportunities.length > 0 ? (
              opportunities.map((opp, idx) => (
                <InsightItem key={opp.id} insight={opp} index={idx} />
              ))
            ) : (
              <EmptyState type="opportunities" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
