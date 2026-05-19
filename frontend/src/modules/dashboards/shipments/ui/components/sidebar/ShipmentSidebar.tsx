import { useState } from 'react';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/shadcn/components/ui/tabs';
import { ScrollArea } from '@/shared/ui/shadcn/components/ui/scroll-area';
import { ShipmentCard } from './ShipmentCard';
import type { Shipment } from '../../../domain/models';
import { Search, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ScrollFadeContainer } from '@/components/scroll';

interface ShipmentSidebarProps {
  shipments: Shipment[];
  selectedShipmentId?: string | null;
  onShipmentSelect?: (shipmentId: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

type TabValue = 'all' | 'transit' | 'delivered' | 'delayed';

/**
 * Shipment sidebar with search, tabs, and list
 */
export function ShipmentSidebar({
  shipments,
  selectedShipmentId,
  onShipmentSelect,
  onRefresh,
  isRefreshing = false,
  className = '',
}: ShipmentSidebarProps) {
  const { t } = useTranslation('dashboards');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabValue>('all');

  // Filter shipments based on search and tab
  const filteredShipments = shipments.filter((shipment) => {
    // Search filter
    const matchesSearch =
      search === '' ||
      shipment.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      shipment.origin.displayName.toLowerCase().includes(search.toLowerCase()) ||
      shipment.destination.displayName.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    // Tab filter
    switch (activeTab) {
      case 'transit':
        return shipment.status === 'in_transit' || shipment.status === 'out_for_delivery';
      case 'delivered':
        return shipment.status === 'delivered';
      case 'delayed':
        return shipment.status === 'delayed';
      default:
        return true;
    }
  });

  return (
    <div className={`flex flex-col h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      {/* Header Section - Sticky Top */}
      <div className="flex-none p-4 space-y-4 border-b z-20 shadow-sm bg-background/50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">{t('shipments.title')}</h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder={t('shipments.filters.search')}
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-9 bg-muted/50 border-input/50 focus:bg-background transition-all"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as TabValue)} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1">
            <TabsTrigger value="all" className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
              {t('shipments.tabs.all')}
            </TabsTrigger>
            <TabsTrigger value="transit" className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
              {t('shipments.tabs.transit')}
            </TabsTrigger>
            <TabsTrigger value="delivered" className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
              {t('shipments.tabs.delivered')}
            </TabsTrigger>
            <TabsTrigger value="delayed" className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
              {t('shipments.tabs.delayed')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Scrollable List Section */}
      <div className="flex-1 min-h-0 relative">
        <ScrollFadeContainer className="h-full">
        <ScrollArea className="h-full">
          <div>
            {filteredShipments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-base font-medium text-foreground">{t('shipments.empty.title')}</p>
                <p className="text-sm mt-1">{t('shipments.empty.description')}</p>
              </div>
            ) : (
              filteredShipments.map((shipment) => (
                // className="transform transition-all duration-200 hover:scale-[1.02]"
                <div key={shipment.id}>
                  <ShipmentCard
                    shipment={shipment}
                    selected={shipment.id === selectedShipmentId}
                    onClick={() => onShipmentSelect?.(shipment.id)}
                  />
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        </ScrollFadeContainer>
      </div>

      {/* Footer / Status Bar - Fixed Bottom */}
      <div className="flex-none p-3 border-t bg-background/50 backdrop-blur-sm text-xs font-medium text-muted-foreground flex justify-between items-center z-20">
        <span>
          {t('common.showing', { count: filteredShipments.length, total: shipments.length }) || 
           `${filteredShipments.length} of ${shipments.length} shipments`}
        </span>
        <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          LIVE UPDATES
        </div>
      </div>
    </div>
  );
}
