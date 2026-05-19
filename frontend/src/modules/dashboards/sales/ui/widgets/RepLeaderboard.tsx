import { LeaderboardTable } from '../../../shared/components/LeaderboardTable';
import { Sparkline } from '../../../shared/components/Sparkline';
import { useRepLeaderboard } from '../../application/hooks/useSalesAnalytics';
import type { DateRange } from '../../../shared/utils/dateRange';
import type { SalesDashboardFilters } from '../../application/hooks/useSalesDashboardFilters';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import { formatCurrency, formatNumber, formatPercent } from '../../../shared/utils/formatters';

interface Row { 
  id: string; 
  name: string; 
  revenue: number; 
  wonDeals: number; 
  avgDealSize: number; 
  quotaAttainment: number; 
  spark: number[];
}

export interface RepLeaderboardProps { 
  range: DateRange; 
  filters?: Partial<SalesDashboardFilters>; 
  /** Currently selected rep name for visual emphasis */
  selectedRepId?: string | null;
  /** Callback when a rep row is selected */
  onRepSelect?: (repName: string | null) => void;
}

export function RepLeaderboard({ range, filters, selectedRepId, onRepSelect }: RepLeaderboardProps) {
  const { t } = useTranslation('dashboards');
  const { data, refetch } = useRepLeaderboard(range, filters);

  const columns: ColumnDef<Row>[] = [
    {
      accessorKey: 'name',
      header: 'Rep',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    { 
      accessorKey: 'revenue', 
      header: 'Revenue', 
      cell: ({ row }) => <span className="font-mono">{formatCurrency(row.original.revenue, 'USD', true)}</span> 
    },
    { 
      accessorKey: 'wonDeals', 
      header: 'Won', 
      cell: ({ row }) => formatNumber(row.original.wonDeals) 
    },
    { 
      accessorKey: 'avgDealSize', 
      header: 'Avg Deal', 
      cell: ({ row }) => <span className="font-mono">{formatCurrency(row.original.avgDealSize, 'USD', true)}</span> 
    },
    { 
      accessorKey: 'quotaAttainment', 
      header: 'Quota %', 
      cell: ({ row }) => formatPercent(row.original.quotaAttainment) 
    },
    { 
      id: 'trend', 
      header: 'Trend', 
      cell: ({ row }) => <div className="w-24 h-8"><Sparkline data={row.original.spark} /></div> 
    },
    { 
      id: 'rank', 
      header: 'Rank', 
      cell: ({ row }) => row.index + 1 
    },
  ];

  const handleRowClick = (row: Row) => {
    if (onRepSelect) {
      // Toggle: if clicking selected rep, clear; otherwise set new rep
      onRepSelect(selectedRepId === row.name ? null : row.name);
    }
  };

  return (
    <LeaderboardTable
      title={t('sales.widgets.repLeaderboard')}
      columns={columns}
      data={data?.reps ?? []}
      initialSort={[{ id: 'revenue', desc: true }]}
      onExport={() => { /* CSV handled internally */ }}
      onRefresh={() => refetch()}
      density="compact"
      onRowClick={handleRowClick}
      selectedRowId={selectedRepId}
      getRowId={(row) => row.name}
      className="h-full"
    />
  );
}
