import { useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/shadcn/components/ui/card';
import { WidgetHeader } from '../../../shared/components/WidgetHeader';
import type { DateRange } from '../../../shared/utils/dateRange';
import type { SalesDashboardFilters } from '../../application/hooks/useSalesDashboardFilters';
import { useSalesLocations } from '../../application/hooks/useSalesLocations';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatNumber, formatPercent } from '../../../shared/utils/formatters';
import type { ColumnDef } from '@tanstack/react-table';
import { SimpleSortableTable } from '@/shared/ui/components/table/SimpleSortableTable';
import { VectorMap } from '../../../shared/components/VectorMap';
import { ScrollArea } from '@/shadcn/components/ui/scroll-area';
import { ScrollFadeContainer } from '@/components/scroll';

export interface SalesByLocationCardProps {
  range: DateRange;
  filters?: Partial<SalesDashboardFilters>;
  
  // ─────────────────────────────────────────────────────────────────────────────
  // FOCUS states (UI-only, local to this widget)
  // ─────────────────────────────────────────────────────────────────────────────
  
  /** Currently focused country code - for map/table highlighting */
  focusCountry?: string | null;
  
  /** Callback when a country is clicked (map or table row) */
  onCountryFocus?: (countryCode: string | null) => void;
}

interface LocationRow {
  id: string;
  countryCode: string;
  countryName: string;
  orders: number;
  revenue: number;
  percentOfTotal: number;
}

export function SalesByLocationCard({ 
  range, 
  filters,
  focusCountry,
  onCountryFocus,
}: SalesByLocationCardProps) {
  const { t } = useTranslation('dashboards');
  const { data, isLoading, refetch } = useSalesLocations(range, filters);

  const locations = useMemo(() => data?.locations ?? [], [data?.locations]);
  
  // Calculate total revenue for percentage
  const totalRevenue = useMemo(
    () => locations.reduce((sum, loc) => sum + loc.revenue, 0),
    [locations]
  );

  const rows: LocationRow[] = useMemo(
    () => locations.map((loc) => ({
      id: loc.countryCode, // Use countryCode (UPPERCASE) for ID to match amCharts
      countryCode: loc.countryCode,
      countryName: loc.countryName,
      orders: loc.orders,
      revenue: loc.revenue,
      percentOfTotal: totalRevenue > 0 ? loc.revenue / totalRevenue : 0,
    })),
    [locations, totalRevenue],
  );

  const columns: ColumnDef<LocationRow>[] = useMemo(
    () => [
      {
        accessorKey: 'countryName',
        header: t('sales.widgets.locations.country', 'Country'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-medium">{row.original.countryName}</span>
          </div>
        ),
      },
      {
        accessorKey: 'orders',
        header: t('sales.widgets.locations.orders', 'Orders'),
        cell: ({ row }) => <span className="font-mono">{formatNumber(row.original.orders)}</span>,
      },
      {
        accessorKey: 'revenue',
        header: t('sales.widgets.locations.revenue', 'Revenue'),
        cell: ({ row }) => <span className="font-mono">{formatCurrency(row.original.revenue, 'USD', true)}</span>,
      },
      {
        accessorKey: 'percentOfTotal',
        header: '% of Total',
        cell: ({ row }) => (
          <span className="font-mono text-muted-foreground">
            {formatPercent(row.original.percentOfTotal)}
          </span>
        ),
      },
    ],
    [t],
  );

  // Handle map marker click
  const handleMarkerClick = useCallback((markerId: string) => {
    if (onCountryFocus) {
      // Toggle: if clicking focused country, clear; otherwise focus new one
      onCountryFocus(focusCountry === markerId ? null : markerId);
    }
  }, [focusCountry, onCountryFocus]);

  // Handle table row click
  const handleRowClick = useCallback((row: LocationRow) => {
    if (onCountryFocus) {
      // Toggle: if clicking focused country, clear; otherwise focus new one
      onCountryFocus(focusCountry === row.id ? null : row.id);
    }
  }, [focusCountry, onCountryFocus]);

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary/5">
      <CardHeader>
        <WidgetHeader
          title={t('sales.widgets.locations.title', 'Sales by Location')}
          subtitle={t('sales.widgets.locations.subtitle', 'Where your revenue is coming from')}
          onRefresh={() => refetch()}
          className="mb-2"
        />
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="h-[300px] w-full rounded-lg bg-muted/10 p-4 border border-border/50">
          {isLoading || !locations.length ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">Loading map</div>
          ) : (
            <VectorMap
              map="world"
              markers={locations.map((loc) => ({
                id: loc.countryCode, // Key for amCharts matching
                name: loc.countryName,
                lat: loc.lat,
                lng: loc.lng,
                value: loc.revenue,
                meta: {
                  orders: loc.orders,
                  revenue: loc.revenue,
                  percentOfTotal: totalRevenue > 0 ? loc.revenue / totalRevenue : 0,
                },
              }))}
              selectedMarkerId={focusCountry}
              onMarkerClick={handleMarkerClick}
              getTooltipHtml={(marker) => {
                const orders = marker.meta?.orders as number | undefined;
                const revenue = marker.meta?.revenue as number | undefined;
                const percent = marker.meta?.percentOfTotal as number | undefined;
                const lines = [
                  `<div class="font-bold text-sm mb-1">${marker.name}</div>`,
                ];
                if (typeof orders === 'number') {
                  lines.push(`<div class="text-xs text-muted-foreground">${t('sales.widgets.locations.orders', 'Orders')}: <span class="text-foreground font-medium">${formatNumber(orders)}</span></div>`);
                }
                if (typeof revenue === 'number') {
                  lines.push(`<div class="text-xs text-muted-foreground">${t('sales.widgets.locations.revenue', 'Revenue')}: <span class="text-foreground font-medium">${formatCurrency(revenue, 'USD', true)}</span></div>`);
                }
                if (typeof percent === 'number') {
                  lines.push(`<div class="text-xs text-muted-foreground">% of Total: <span class="text-foreground font-medium">${formatPercent(percent)}</span></div>`);
                }
                return lines.join('');
              }}
            />
          )}
        </div>

        <ScrollFadeContainer className="h-[280px]">
          <ScrollArea className="h-[280px]">
            <SimpleSortableTable
              columns={columns}
              data={rows}
              initialSort={[{ id: 'revenue', desc: true }]}
              density="compact"
              onRowClick={handleRowClick}
              selectedRowId={focusCountry}
              getRowId={(row) => row.id}
            />
          </ScrollArea>
        </ScrollFadeContainer>
      </CardContent>
    </Card>
  );
}
