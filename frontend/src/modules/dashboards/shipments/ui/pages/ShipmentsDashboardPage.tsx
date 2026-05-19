import { useState } from 'react';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { ShipmentMap } from '../components/map/ShipmentMap';
import { ShipmentSidebar } from '../components/sidebar/ShipmentSidebar';
import { ShipmentStatsGrid } from '../components/analytics/ShipmentStatsGrid';
import { RecentShipmentsTable } from '../components/analytics/RecentShipmentsTable';
import { useShipmentsQuery } from '../../application/hooks/useShipmentsData';
import { Skeleton } from '@/shared/ui/components/Skeleton';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { Drawer, DrawerContent, DrawerTrigger } from '@/shared/ui/shadcn/components/ui/drawer';

/**
 * Main shipments tracking dashboard page
 * Desktop: Map with sidebar + analytics below
 * Mobile: Fullscreen map with drawer + scrollable analytics below
 */
export default function ShipmentsDashboardPage() {
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Fetch data
  const { data: shipmentsData, isLoading: isLoadingShipments, refetch: refetchShipments } = useShipmentsQuery();

  const shipments = shipmentsData?.shipments || [];
  const metrics = shipmentsData?.metrics;

  const handleMarkerClick = (shipmentId: string) => {
    setSelectedShipmentId(shipmentId);
    if (isMobile) {
      setIsDrawerOpen(true);
    }
  };

  const handleShipmentSelect = (shipmentId: string) => {
    setSelectedShipmentId(shipmentId);
    if (isMobile) {
      setIsDrawerOpen(false); // Close drawer after selection on mobile
    }
  };

  const handleRefresh = () => {
    refetchShipments();
  };

  // Loading state
  if (isLoadingShipments) {
    return (
      <div className="h-[calc(100vh-4rem)] flex overflow-hidden">
        <div className="flex-1 relative bg-muted/20">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="w-[400px] border-l bg-background h-full hidden lg:block">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Map Section - Fullscreen on mobile, fixed height on desktop */}
      <div className="h-[calc(100vh-300px)] w-full relative group/dashboard md:border-b md:rounded-xl shrink-0 overflow-hidden">
        {/* Map Layer - Absolute to cover full space */}
        <div className="absolute inset-0 z-0">
          <ShipmentMap
            shipments={shipments}
            selectedShipmentId={selectedShipmentId || undefined}
            onMarkerClick={handleMarkerClick}
            className="h-full w-full"
          />
        </div>

        {/* Desktop: Floating Sidebar Container - Right Aligned */}
        {!isMobile && (
        <div className={`
          absolute right-0 top-0 bottom-0 z-10
          hidden md:flex transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'w-full sm:w-[400px] translate-x-0' : 'w-0 translate-x-full'}
        `}>
          {/* Desktop Toggle Handle */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute -left-10 top-4 shadow-md rounded-r-none rounded-l-md border-r-0 h-10 w-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m9 18 6-6-6-6"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m15 18-6-6 6-6"/></svg>
            )}
          </Button>

          {/* Desktop Sidebar Content */}
          <div className="h-full w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-l shadow-xl flex flex-col">
            <ShipmentSidebar
              shipments={shipments}
              selectedShipmentId={selectedShipmentId}
              onShipmentSelect={handleShipmentSelect}
              onRefresh={handleRefresh}
              className="h-full flex flex-col"
            />
          </div>
        </div>
        )}

        {/* Mobile: Drawer Toggle Button (Floating over map) */}
        {isMobile && (
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 h-10 w-16 shadow-xl rounded-t-md rounded-b-none md:hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
              >
                {isDrawerOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m18 15-6-6-6 6"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m6 9 6 6 6-6"/></svg>
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[75vh] max-h-[75vh]">
              <ShipmentSidebar
                shipments={shipments}
                selectedShipmentId={selectedShipmentId}
                onShipmentSelect={handleShipmentSelect}
                onRefresh={handleRefresh}
                className="h-full flex flex-col overflow-hidden"
              />
            </DrawerContent>
          </Drawer>
        )}
      </div>

      {/* Analytics Section - Below Map (Scrollable on mobile) */}
      <div className="py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {metrics && <ShipmentStatsGrid metrics={metrics} />}
        
        <RecentShipmentsTable shipments={shipments} onSelectShipment={handleShipmentSelect} />
      </div>
    </div>
  );
}
