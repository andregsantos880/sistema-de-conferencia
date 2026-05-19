import { useMemo } from 'react';
import { LeaderboardTable } from '../../../shared/components/LeaderboardTable';
import { InfoCard } from '../../../shared/components/InfoCard';
import { useOpportunitiesAtRisk } from '../../application/hooks/useSalesAnalytics';
import type { DateRange } from '../../../shared/utils/dateRange';
import type { SalesDashboardFilters } from '../../application/hooks/useSalesDashboardFilters';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import { formatCurrency, formatPercent } from '../../../shared/utils/formatters';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { 
  AlertTriangle, 
  Activity, 
  Clock, 
  Building, 
  Calendar, 
  Mail, 
  Phone, 
  FileText, 
  TrendingUp
} from 'lucide-react';

interface Row { 
  id: string; 
  accountId: string;
  account: string; 
  accountHealth: 'Good' | 'Warning' | 'Risk';
  accountPipeline: number;
  accountOpenOpps: number;
  amount: number; 
  stage: string; 
  probability: number; 
  lastActivityDays: number; 
  lastActivityDate: string;
  lastActivityType: 'call' | 'email' | 'meeting' | 'task';
  createdDate: string;
  closeDate: string; 
  riskScore: 'Low' | 'Medium' | 'High';
}

export interface OpportunitiesAtRiskProps { 
  range: DateRange; 
  filters?: Partial<SalesDashboardFilters>; 
  
  // ─────────────────────────────────────────────────────────────────────────────
  // FOCUS states (UI-only, no refetch)
  // These are applied as client-side filters, NOT sent to MSW
  // ─────────────────────────────────────────────────────────────────────────────
  
  /** Focus: filter by stage (from Funnel click) - client-side only */
  focusStage?: string | null;
  
  /** Focus: highlight a specific opportunity row */
  focusOpportunityId?: string | null;
  
  /** Callback when an opportunity row is clicked (for focus) */
  onOpportunityFocus?: (opportunityId: string | null) => void;
}

// Deterministic risk signals
const AVG_DAYS_IN_STAGE: Record<string, number> = {
  'Prospect': 15,
  'Qualified': 25,
  'Proposal': 20,
  'Negotiation': 30, // Negotiation often drags
};

function ExpandedRowContent({ row }: { row: Row }) {

  // Compute Days in Stage (using Created Date as proxy for "Deal Age" roughly)
  // In a real app we'd track stage entry. Here we use (Now - Created) * 0.5 as "Time in current stage" heuristic
  // Or simpler: Just calculate total days open and compare to typical sales cycle
  const daysOpen = Math.floor((new Date().getTime() - new Date(row.createdDate).getTime()) / (1000 * 60 * 60 * 24));
  
  // Deterministic Signals
  const signals: string[] = [];
  
  if (row.lastActivityDays > 14) {
    signals.push(`No activity in ${row.lastActivityDays} days`);
  }
  
  const stageThreshold = AVG_DAYS_IN_STAGE[row.stage] || 30;
  // Heuristic: If days open is much larger than stage threshold (assuming progression), risk is high.
  // For simplicity: "Deal Age > 60 days" often implies stuck if not closed.
  if (daysOpen > 60) {
    signals.push(`Deal age (${daysOpen} days) exceeds avg cycle`);
  }
  
  if (row.probability < 0.3 && row.stage === 'Negotiation') {
    signals.push('Low probability for Negotiation stage');
  }
  
  if (row.riskScore === 'High') {
    signals.push('High automatic risk score detected');
  }
  
  if (row.accountHealth === 'Risk') {
    signals.push('Account health is currently at risk');
  }

  // Fallback
  if (signals.length === 0) {
    signals.push('Activity velocity slowing down');
  }

  // Icons
  const activityIcons = {
    call: Phone,
    email: Mail,
    meeting: Calendar,
    task: FileText,
  };
  const ActivityIcon = activityIcons[row.lastActivityType] || Activity;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Risk Breakdown */}
      <InfoCard 
        title="Why this deal is at risk" 
        icon={AlertTriangle} 
        variant="danger"
        className="lg:col-span-1"
      >
        <ul className="space-y-2">
          {signals.map((signal, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-500" />
              {signal}
            </li>
          ))}
        </ul>
      </InfoCard>

      {/* Stage Diagnostics */}
      <InfoCard 
        title="Stage Diagnostics" 
        icon={TrendingUp} 
        variant="default" // Neutral/Blue
        className="lg:col-span-1"
      >
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg border border-border/50">
            <span className="text-sm font-medium text-muted-foreground">{row.stage}</span>
            <Badge variant="outline" className="bg-background">{daysOpen} days open</Badge>
          </div>
          
          <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Avg for {row.stage}</span>
                <span>~{stageThreshold} days</span>
              </div>
              
              {/* Comparison Bar */}
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${daysOpen > stageThreshold ? 'bg-amber-500' : 'bg-primary'}`}
                  style={{ width: `${Math.min(100, (daysOpen / (stageThreshold * 2)) * 100)}%` }}
                />
              </div>
              {daysOpen > stageThreshold && (
                <span className="text-xs text-amber-600 font-medium block text-right mt-1">
                  +{daysOpen - stageThreshold} days over avg
                </span>
              )}
          </div>
        </div>
      </InfoCard>
      
      {/* Activity Summary */}
      <InfoCard 
        title="Activity Summary" 
        icon={Clock} 
        variant="warning"
          className="lg:col-span-1"
      >
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded-full border border-border/50 shadow-sm">
                <ActivityIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold capitalize">{row.lastActivityType}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(row.lastActivityDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="pt-2 border-t border-border/50 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Days inactive</span>
              <span className={`text-sm font-bold ${row.lastActivityDays > 14 ? 'text-rose-600' : 'text-amber-600'}`}>
                {row.lastActivityDays} days
              </span>
            </div>
          </div>
      </InfoCard>
      
      {/* Account Context */}
      <InfoCard 
        title="Account Context" 
        icon={Building} 
        variant="info"
          className="lg:col-span-1"
      >
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Health</span>
              <Badge variant={row.accountHealth === 'Good' ? 'default' : row.accountHealth === 'Risk' ? 'destructive' : 'secondary'}>
                {row.accountHealth}
              </Badge>
            </div>
            
            <div className="pt-2 border-t border-border/50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total Open Opps</span>
                <span className="text-sm font-medium">{row.accountOpenOpps}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total Pipeline</span>
                <span className="text-sm font-bold text-primary">
                  {formatCurrency(row.accountPipeline, 'USD', true)}
                </span>
              </div>
            </div>
          </div>
      </InfoCard>
    </div>
  );
}

export function OpportunitiesAtRisk({ 
  range, 
  filters, 
  focusStage,
  // focusOpportunityId,
  // onOpportunityFocus,
}: OpportunitiesAtRiskProps) {
  const { t } = useTranslation('dashboards');
  
  // Data fetched using FILTERS only (not focus)
  const { data, refetch } = useOpportunitiesAtRisk(range, filters);

  // CLIENT-SIDE filtering using focus state
  // This does NOT trigger a refetch - it filters the existing dataset
  const filteredData = useMemo(() => {
    const opportunities = data?.opportunities ?? [];
    
    // Apply focus stage filter (client-side only)
    if (focusStage) {
      return opportunities.filter((o) => o.stage === focusStage);
    }
    
    return opportunities;
  }, [data?.opportunities, focusStage]);

  const columns: ColumnDef<Row>[] = [
    { accessorKey: 'account', header: 'Account' },
    { 
      accessorKey: 'amount', 
      header: 'Amount', 
      cell: ({ row }) => <span className="font-mono">{formatCurrency(row.original.amount, 'USD', true)}</span> 
    },
    { accessorKey: 'stage', header: 'Stage' },
    { 
      accessorKey: 'probability', 
      header: 'Prob.', 
      cell: ({ row }) => formatPercent(row.original.probability) 
    },
    { accessorKey: 'lastActivityDays', header: 'Last Act. (d)' },
    { accessorKey: 'closeDate', header: 'Close Date' },
    { 
      accessorKey: 'riskScore', 
      header: 'Risk', 
      cell: ({ row }) => {
        const risk = row.original.riskScore;
        const cls = risk === 'High'
          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900'
          : risk === 'Medium'
          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900'
          : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900';
        return <Badge variant="outline" className={`font-semibold border ${cls}`}>{risk}</Badge>;
      } 
    },
  ];

  // const handleRowClick = (row: Row) => {
  //   if (onOpportunityFocus) {
  //     // Toggle: if clicking focused opportunity, clear; otherwise focus new one
  //     onOpportunityFocus(focusOpportunityId === row.id ? null : row.id);
  //   }
  // };

  return (
    <LeaderboardTable
      title={focusStage ? `${t('sales.widgets.atRisk')} — ${focusStage}` : t('sales.widgets.atRisk')}
      columns={columns}
      data={filteredData as Row[]}
      initialSort={[{ id: 'amount', desc: true }]}
      onRefresh={() => refetch()}
      density="spacious"
      expandable
      renderExpandedRow={(row) => <ExpandedRowContent row={row} />}
      multiExpand={false} // Only one explanation at a time to focus decision making
      // onRowClick={handleRowClick}
      // selectedRowId={focusOpportunityId}
      getRowId={(row) => row.id}
    />
  );
}
