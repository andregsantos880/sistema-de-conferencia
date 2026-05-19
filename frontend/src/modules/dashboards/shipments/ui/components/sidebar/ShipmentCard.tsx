import { StatusBadge } from '../shared/StatusBadge';
import { formatETA, getStatusMarkerColor } from '../../../shared/utils/shipmentHelpers';
import type { Shipment } from '../../../domain/models';
import { ArrowRight, Package } from 'lucide-react';

interface ShipmentCardProps {
  shipment: Shipment;
  selected?: boolean;
  onClick?: () => void;
}

/**
 * Shipment list item for sidebar
 */
export function ShipmentCard({ shipment, selected = false, onClick }: ShipmentCardProps) {
  const isDelayed = shipment.status === 'delayed';
  const deliveryTime = shipment.status === 'delivered' ? shipment.actualDelivery : shipment.estimatedDelivery;
  const statusColor = getStatusMarkerColor(shipment.status);

  return (
    <div
      className={`
        group relative flex items-center gap-3 py-3 px-3 border-b cursor-pointer transition-all duration-200
        ${selected ? 'bg-muted/60' : 'hover:bg-muted/30 bg-background'}
      `}
      onClick={onClick}
    >
      {/* Selected Indicator Line */}
      {selected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
      )}

      {/* Icon / Avatar */}
      <div 
        className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center border shadow-sm transition-transform group-hover:scale-105"
        style={{ 
          backgroundColor: selected ? `${statusColor}15` : 'transparent',
          borderColor: selected ? `${statusColor}30` : 'hsl(var(--border))'
        }}
      >
        <Package 
          className="h-4 w-4" 
          style={{ color: selected ? statusColor : 'hsl(var(--muted-foreground))' }} 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={`text-sm font-semibold truncate ${selected ? 'text-primary' : 'text-foreground'}`}>
            {shipment.trackingNumber}
          </span>
          {isDelayed && (
            <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
              DELAYED
            </span>
          )}
        </div>
        
        <div className="flex items-center text-xs text-muted-foreground truncate mb-1">
          <span className="truncate max-w-[70px]">{shipment.origin.city}</span>
          <ArrowRight className="h-3 w-3 mx-1 shrink-0 opacity-50" />
          <span className="truncate max-w-[70px]">{shipment.destination.city}</span>
        </div>

        {/* ETA */}
        {deliveryTime && (
           <div className="text-[10px] flex items-center gap-1">
             <span className="text-muted-foreground">ETA:</span>
             <span className={`font-medium ${isDelayed ? 'text-destructive' : 'text-foreground'}`}>
               {formatETA(deliveryTime)}
             </span>
           </div>
        )}
      </div>

      {/* Right Side / Status Info */}
      <div className="flex flex-col items-end gap-1 shrink-0 self-start mt-0.5">
        <StatusBadge 
          status={shipment.status} 
          size="sm" 
          className="bg-transparent h-auto" 
        />
      </div>
    </div>
  );
}
