import type { Shipment } from '../../../domain/models';
import { ShipmentStatus } from '../../../domain/models';
import { Card } from '@/shared/ui/shadcn/components/ui/card';
import { CheckCircle2, Clock, AlertTriangle, Package } from 'lucide-react';

interface ShipmentMapSummaryProps {
  shipments: Shipment[];
}

export function ShipmentMapSummary({ shipments }: ShipmentMapSummaryProps) {
  const stats = {
    active: shipments.filter(s => s.status === ShipmentStatus.IN_TRANSIT || s.status === ShipmentStatus.OUT_FOR_DELIVERY).length,
    onTime: shipments.filter(s => s.status === ShipmentStatus.DELIVERED).length,
    delayed: shipments.filter(s => s.status === ShipmentStatus.DELAYED).length,
    exception: shipments.filter(s => s.status === ShipmentStatus.EXCEPTION).length,
  };

  return (
    <div className="absolute top-4 left-4 z-[500] pointer-events-auto opacity-90">
      <Card className="p-1.5 bg-background/90 backdrop-blur-md border shadow-lg rounded-xl dark:bg-slate-900/90 w-28 flex flex-col gap-2">
        {/* Active */}
        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-50/50 dark:bg-blue-900/20">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            <Package className="h-5 w-5" />
            <span className="text-xl font-bold leading-none">{stats.active}</span>
          </div>
          <span className="text-xs text-muted-foreground font-medium mt-0.5">In Transit</span>
        </div>

        <div className="h-px bg-border/50 mx-2" />

        {/* On-Time */}
        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-green-50/50 dark:bg-green-900/20">
          <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-xl font-bold leading-none">{stats.onTime}</span>
          </div>
          <span className="text-xs text-muted-foreground font-medium mt-0.5">Delivered</span>
        </div>

        <div className="h-px bg-border/50 mx-2" />

        {/* Delayed */}
        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-red-50/50 dark:bg-red-900/20">
          <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
            <Clock className="h-5 w-5" />
            <span className="text-xl font-bold leading-none">{stats.delayed}</span>
          </div>
          <span className="text-xs text-muted-foreground font-medium mt-0.5">Delayed</span>
        </div>

        {stats.exception > 0 && (
          <>
            <div className="h-px bg-border/50 mx-2" />
            
            {/* Exception */}
            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-orange-50/50 dark:bg-orange-900/20">
              <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-lg font-bold leading-none">{stats.exception}</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium mt-0.5">Exception</span>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
