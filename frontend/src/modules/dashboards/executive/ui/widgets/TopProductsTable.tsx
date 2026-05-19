import { LeaderboardTable } from '../../../shared/components/LeaderboardTable';
import { Sparkline } from '../../../shared/components/Sparkline';
import { useTopProductsData } from '../../application/hooks/useExecutiveAnalytics';
import { formatCurrency, formatNumber } from '../../../shared/utils/formatters';
import type { DateRange } from '../../../shared/utils/dateRange';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { useMemo } from 'react';
import { computeProductInsights } from '../../application/selectors/executiveInsights';
import { cn } from '@/shadcn/lib/utils';
import { TrendingDown, Gem, AlertTriangle } from 'lucide-react';

interface ProductRow {
  id: string;
  name: string;
  revenue: number;
  orders: number;
  grossMargin: number;
  spark: number[];
  // Derived fields
  revenueShare?: number;
  isHighMargin?: boolean;
  isDeclining?: boolean;
  isConcentrationRisk?: boolean;
}

export interface TopProductsTableProps {
  range: DateRange;
}

export function TopProductsTable({ range }: TopProductsTableProps) {
  const { t } = useTranslation('dashboards');
  const { data, isLoading, refetch } = useTopProductsData(range, 10);

  // Compute product insights with derived fields
  const enrichedProducts = useMemo(() => {
    if (!data) return [];
    const insights = computeProductInsights(data);
    
    return data.products.map((product): ProductRow => {
      const insight = insights.find(i => i.id === product.id);
      return {
        ...product,
        revenueShare: insight?.revenueShare,
        isHighMargin: insight?.isHighMargin,
        isDeclining: insight?.isDeclining,
        isConcentrationRisk: insight?.isConcentrationRisk,
      };
    });
  }, [data]);

  const columns: ColumnDef<ProductRow>[] = [
    {
      accessorKey: 'name',
      header: 'Product',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.name}</span>
          <div className="flex gap-1">
            {row.original.isHighMargin && (
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                <Gem className="w-3 h-3 mr-0.5" />
                High GM
              </Badge>
            )}
            {row.original.isDeclining && (
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">
                <TrendingDown className="w-3 h-3 mr-0.5" />
                Declining
              </Badge>
            )}
            {row.original.isConcentrationRisk && (
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                <AlertTriangle className="w-3 h-3 mr-0.5" />
                Concentration
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'revenue',
      header: 'Revenue',
      cell: ({ row }) => (
        <div className="font-mono">{formatCurrency(row.original.revenue, 'USD', true)}</div>
      ),
    },
    {
      accessorKey: 'revenueShare',
      header: 'Share',
      cell: ({ row }) => (
        <div className={cn(
          'font-medium',
          row.original.revenueShare && row.original.revenueShare >= 0.30 ? 'text-amber-600 dark:text-amber-400' : ''
        )}>
          {row.original.revenueShare ? `${(row.original.revenueShare * 100).toFixed(0)}%` : '-'}
        </div>
      ),
    },
    {
      accessorKey: 'orders',
      header: 'Orders',
      cell: ({ row }) => (
        <div>{formatNumber(row.original.orders)}</div>
      ),
    },
    {
      accessorKey: 'grossMargin',
      header: 'GM%',
      cell: ({ row }) => (
        <div className={cn(
          row.original.grossMargin >= 75 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''
        )}>
          {row.original.grossMargin.toFixed(1)}%
        </div>
      ),
    },
    {
      id: 'trend',
      header: 'Trend',
      cell: ({ row }) => (
        <div className="w-24 h-8">
          <Sparkline data={row.original.spark} className="h-[32px]" />
        </div>
      ),
    },
  ];

  const handleExport = () => {
    if (!data) return;
    
    const csv = [
      ['Product', 'Revenue', 'Orders', 'Gross Margin %'],
      ...data.products.map(p => [p.name, p.revenue.toString(), p.orders.toString(), p.grossMargin.toFixed(1)]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'top-products.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading || !data) {
    return (
      <div className="col-span-full lg:col-span-6 h-[400px] rounded-lg border bg-card p-6">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <LeaderboardTable
      title={t('widgets.topProducts')}
      columns={columns}
      data={enrichedProducts}
      initialSort={[{ id: 'revenue', desc: true }]}
      onExport={handleExport}
      onRefresh={() => refetch()}
      density="compact"
      height="full"
      actions={
        <Button variant="ghost" size="sm" onClick={() => undefined}>
          {t('common.seeAll', 'See all')}
        </Button>
      }
      className="col-span-full lg:col-span-6"
    />
  );
}
