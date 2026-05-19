import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/ui/shadcn/components/ui/card';
import { Progress } from '@/shared/ui/shadcn/components/ui/progress';
import { DollarSign, AlertCircle } from 'lucide-react';
import { SkeletonChartCard } from '@/shared/ui/components/Skeleton';
import { useBudget } from '../../application/hooks/useProjectsAnalytics';
import type { DateRange } from '../../../shared/utils/dateRange';

interface BudgetOverviewProps {
  range: DateRange;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
}

export function BudgetOverview({ range }: BudgetOverviewProps) {
  const { t } = useTranslation('dashboards');
  const { data, isLoading } = useBudget(range);

  if (isLoading || !data) {
    return <SkeletonChartCard className="h-full" />;
  }

  const spentPercent = (data.spent / data.total) * 100;

  return (
    <Card className="h-full border-border/50 bg-card relative overflow-hidden">
      {/* Gradient accent for over budget warning */}
      {data.isOverBudget && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-warning to-warning/70" />
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              {t('projects.widgets.budget')}
            </CardTitle>
            <CardDescription>Q4 2024 portfolio spend tracking</CardDescription>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
            <DollarSign className="h-5 w-5 text-chart-1" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-bold text-foreground">
              {formatCurrency(data.spent)}
            </span>
            <span className="text-sm text-muted-foreground">
              of {formatCurrency(data.total)}
            </span>
          </div>
          <Progress
            value={spentPercent}
            className="h-3 [&>[data-slot=indicator]]:bg-chart-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground mb-1">Remaining</p>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(data.remaining)}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground mb-1">Burn Rate</p>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(data.burnRate)}/wk
            </p>
          </div>
        </div>

        {data.isOverBudget && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <AlertCircle className="h-4 w-4 text-warning shrink-0" />
            <p className="text-xs text-warning">
              Projected to exceed budget by {formatCurrency(data.projected - data.total)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
