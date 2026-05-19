import { useMemo } from 'react';
import { LeaderboardTable } from '../../../shared/components/LeaderboardTable';
import { InfoCard } from '../../../shared/components/InfoCard';
import { useTopAccounts } from '../../application/hooks/useSalesAnalytics';
import type { DateRange } from '../../../shared/utils/dateRange';
import type { SalesDashboardFilters } from '../../application/hooks/useSalesDashboardFilters';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import { formatCurrency } from '../../../shared/utils/formatters';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Phone, Mail, Calendar, CheckCircle } from 'lucide-react';

interface Row { 
  id: string; 
  account: string; 
  owner: string; 
  region: string; 
  pipeline: number; 
  lastTouch: string; 
  health: string;
}

export interface TopAccountsTableProps { 
  range: DateRange; 
  filters?: Partial<SalesDashboardFilters>;
  
  // ─────────────────────────────────────────────────────────────────────────────
  // FOCUS states (UI-only, no refetch)
  // ─────────────────────────────────────────────────────────────────────────────
  
  /** Currently focused account ID - for row highlighting */
  focusAccountId?: string | null;
  
  /** Callback when an account row is clicked (for focus) */
  onAccountFocus?: (accountId: string | null) => void;
}

/**
 * Expanded Row Content
 * 
 * Shows account details derived from existing MSW data:
 * - Pipeline summary
 * - Health indicators
 * - Recent activity snapshot
 */
function ExpandedRowContent({ row }: { row: Row }) {
  const { t } = useTranslation('dashboards');
  
  // Derive health trend (simulated from health status)
  const getTrend = (health: string) => {
    if (health === 'Good') return { 
      icon: TrendingUp, 
      label: 'Improving', 
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    };
    if (health === 'Warning') return { 
      icon: Minus, 
      label: 'Stable', 
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20'
    };
    return { 
      icon: TrendingDown, 
      label: 'Declining', 
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20'
    };
  };
  
  const trend = getTrend(row.health);
  const TrendIcon = trend.icon;
  
  // Parse days since last touch
  const daysSinceTouch = Math.floor(
    (new Date().getTime() - new Date(row.lastTouch).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Simulated activity type based on days
  const lastActivityType = daysSinceTouch < 3 ? 'meeting' : daysSinceTouch < 7 ? 'call' : 'email';
  const activityIcons = {
    meeting: { icon: Calendar, label: 'Meeting', color: 'text-blue-600 dark:text-blue-400' },
    call: { icon: Phone, label: 'Call', color: 'text-purple-600 dark:text-purple-400' },
    email: { icon: Mail, label: 'Email', color: 'text-indigo-600 dark:text-indigo-400' },
  };
  const activity = activityIcons[lastActivityType];
  const ActivityIcon = activity.icon;
  
  // Calculate engagement score visual
  const engagementScore = daysSinceTouch > 14 ? 25 : daysSinceTouch > 7 ? 60 : 90;
  const engagementColor = daysSinceTouch > 14 ? 'bg-rose-500' : daysSinceTouch > 7 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Pipeline Summary Card */}
      <InfoCard
        title={t('sales.widgets.topAccounts.pipelineSummary', 'Pipeline Summary')}
        icon={CheckCircle}
        variant="default"
      >
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Open Pipeline</span>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {formatCurrency(row.pipeline, 'USD', true)}
          </div>
        </div>
        
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Open Opportunities</span>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-bold text-foreground">{Math.ceil(row.pipeline / 25000)}</span>
            </div>
          </div>
        </div>
      </InfoCard>
      
      {/* Health Indicators Card */}
      <InfoCard
        title={t('sales.widgets.topAccounts.healthIndicators', 'Health Indicators')}
        icon={TrendIcon}
        iconBgColor={trend.bgColor}
        iconColor={trend.color}
        iconBorderColor={trend.borderColor}
        accentColor={trend.bgColor}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</span>
          <Badge 
            variant="outline" 
            className={`${trend.borderColor} ${trend.color} font-semibold shadow-sm`}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            {row.health}
          </Badge>
        </div>
        
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Trend</span>
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full ${trend.bgColor} ${trend.borderColor} border`}>
              <TrendIcon className={`h-3.5 w-3.5 ${trend.color}`} />
              <span className={`text-xs font-bold ${trend.color}`}>{trend.label}</span>
            </div>
          </div>
        </div>
      </InfoCard>
      
      {/* Recent Activity Card */}
      <InfoCard
        title={t('sales.widgets.topAccounts.recentActivity', 'Recent Activity')}
        icon={ActivityIcon}
        variant="info"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Contact</span>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
            <ActivityIcon className={`h-3 w-3 ${activity.color}`} />
            <span className={`text-xs font-bold ${activity.color}`}>{activity.label}</span>
          </div>
        </div>
        
        <div className="pt-2 border-t border-border/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Engagement</span>
            <span className={`text-sm font-bold ${daysSinceTouch > 14 ? 'text-rose-600 dark:text-rose-400' : daysSinceTouch > 7 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {daysSinceTouch} days ago
            </span>
          </div>
          
          {/* Engagement Score Bar */}
          <div className="space-y-1">
            <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
              <div 
                className={`h-full ${engagementColor} rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${engagementScore}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-muted-foreground">Score</span>
              <span className={`text-[10px] font-bold ${daysSinceTouch > 14 ? 'text-rose-600 dark:text-rose-400' : daysSinceTouch > 7 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {engagementScore}%
              </span>
            </div>
          </div>
        </div>
      </InfoCard>
    </div>
  );
}

export function TopAccountsTable({ 
  range, 
  filters,
}: TopAccountsTableProps) {
  const { t } = useTranslation('dashboards');
  const { data, refetch } = useTopAccounts(range, filters, 10);

  const columns: ColumnDef<Row>[] = useMemo(() => [
    { 
      accessorKey: 'account', 
      header: 'Account',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.account}</span>
      ),
    },
    { accessorKey: 'owner', header: 'Owner' },
    { accessorKey: 'region', header: 'Region' },
    { 
      accessorKey: 'pipeline', 
      header: 'Pipeline $', 
      cell: ({ row }) => (
        <span className="font-mono">{formatCurrency(row.original.pipeline, 'USD', true)}</span>
      ),
    },
    { accessorKey: 'lastTouch', header: 'Last Touch' },
    { 
      accessorKey: 'health', 
      header: 'Health',
      cell: ({ row }) => {
        const health = row.original.health;
        return (
          <div className="flex items-center gap-1.5">
            <CheckCircle className={`h-3.5 w-3.5 ${
              health === 'Good' ? 'text-green-500' :
              health === 'Warning' ? 'text-yellow-500' :
              'text-red-500'
            }`} />
            <span>{health}</span>
          </div>
        );
      },
    },
  ], []);

  return (
    <LeaderboardTable
      title={t('sales.widgets.topAccounts')}
      columns={columns}
      data={data?.accounts ?? []}
      initialSort={[{ id: 'pipeline', desc: true }]}
      onRefresh={() => refetch()}
      density="spacious"
      height="full"
      expandable
      multiExpand={false}
      renderExpandedRow={(row) => <ExpandedRowContent row={row} />}
      getRowId={(row) => row.id}
    />
  );
}
