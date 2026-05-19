import { LeaderboardTable } from '../../../shared/components/LeaderboardTable';
import { Sparkline } from '../../../shared/components/Sparkline';
import { useTopProducts } from '../../application/hooks/useEcommerceAnalytics';
import type { DateRange } from '../../../shared/utils/dateRange';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatNumber } from '../../../shared/utils/formatters';
import type { ColumnDef } from '@tanstack/react-table';
import type { DashboardFilters } from '../../application/hooks/useDashboardFilters';

import { TopProductsSkeleton } from './TopProductsSkeleton';

export interface TopProductsCardProps {
  range: DateRange;
  /** Phase 3: Selected product ID for filtering */
  selectedProductId?: string | null;
  /** Phase 3: Handler for product selection */
  onProductSelect?: (productId: string | null) => void;
  filters?: Partial<DashboardFilters>;
}

interface ProductRow {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  revenue: number;
  orders: number;
  trend: number[];
}

export function TopProductsCard({ range, selectedProductId, onProductSelect, filters }: TopProductsCardProps) {
  const { t } = useTranslation('dashboards');
  const { data, isLoading, refetch } = useTopProducts(range, filters);

  const columns: ColumnDef<ProductRow>[] = [
    {
      accessorKey: 'name',
      header: 'Product',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <img
            src={row.original.imageUrl}
            alt={row.original.name}
            className="h-10 w-10 rounded-md object-cover bg-muted"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://via.placeholder.com/40x40?text=?';
            }}
          />
          <span className="font-medium line-clamp-1">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs">
          {row.original.category}
        </span>
      ),
    },
    {
      accessorKey: 'orders',
      header: 'Orders',
      cell: ({ row }) => (
        <span className="font-mono">{formatNumber(row.original.orders)}</span>
      ),
    },
    {
      accessorKey: 'revenue',
      header: 'Revenue',
      cell: ({ row }) => (
        <span className="font-mono font-semibold">
          {formatCurrency(row.original.revenue, 'USD', true)}
        </span>
      ),
    },
    {
      id: 'trend',
      header: 'Trend',
      cell: ({ row }) => (
        <div className="w-24 h-8">
          <Sparkline data={row.original.trend} className="h-[32px]" />
        </div>
      ),
    },
  ];

  if (isLoading || !data) {
    return <TopProductsSkeleton />;
  }

  return (
    <LeaderboardTable
      title={t('ecommerce.widgets.products')}
      columns={columns}
      data={data.data.current.products}
      height='lg'
      initialSort={[{ id: 'revenue', desc: true }]}
      onRefresh={() => refetch()}
      density="compact"
      onRowClick={(row) => {
        // Toggle: if clicking selected product, clear filter; otherwise set new filter
        if (onProductSelect) {
          onProductSelect(selectedProductId === row.id ? null : row.id);
        }
      }}
      selectedRowId={selectedProductId}
      getRowId={(row) => row.id}
      className="h-full"
    />
  );
}
