import React from 'react';
import { useMap } from 'react-leaflet';
import { 
  X, 
  FileText, 
  ChevronRight 
} from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Separator } from '@/shared/ui/shadcn/components/ui/separator';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { Progress } from '@/shared/ui/shadcn/components/ui/progress';
import { ShipmentStatus, type Shipment } from '../../../domain/models';

interface ShipmentPopupContentProps {
  shipment: Shipment;
}

export function ShipmentPopupContent({ shipment }: ShipmentPopupContentProps) {
  const map = useMap();

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    map.closePopup();
  };

  // Format Dates
  const etaDate = new Date(shipment.estimatedDelivery);
  const isToday = new Date().toDateString() === etaDate.toDateString();
  const dateStr = isToday ? 'Today' : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(etaDate);
  const timeStr = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(etaDate);

  // Status Logic
  const isDelayed = shipment.status === ShipmentStatus.DELAYED;
  const lateMinutes = shipment.lateDurationMinutes || 45; // Default fallback if data missing
  
  // Carrier Logo Fallback
  const CarrierLogo = () => (
    <div className="h-8 w-8 rounded bg-slate-900 text-white flex items-center justify-center shrink-0">
      <span className="font-bold text-xs">{shipment.carrier.code.substring(0, 2)}</span>
    </div>
  );

  return (
    <div className="map-modal w-[380px] font-sans text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-950 rounded-xl overflow-hidden shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
      {/* Hide default Leaflet Close Button via style injection */}
      <style>{`
        .leaflet-popup-content-wrapper { padding: 0; background: transparent; box-shadow: none; }
        .leaflet-popup-content { margin: 0; width: auto !important; }
        .leaflet-popup-tip { background: white; }
        .dark .leaflet-popup-tip { background: #020617; }
        .leaflet-popup-close-button { display: none !important; }
      `}</style>

      {/* Header with Map Background */}
      <div className="relative h-32 bg-slate-100 dark:bg-slate-900 overflow-hidden">
        {/* Map Placeholder Image/Pattern */}
        <div 
          className="absolute inset-0 opacity-50 dark:opacity-30 mix-blend-multiply dark:mix-blend-normal contrast-125"
          style={{
            backgroundImage: `url('https://c.tile.openstreetmap.org/12/2101/1344.png')`, // Generic tile
            backgroundSize: 'cover',
            filter: 'grayscale(100%) hue-rotate(200deg)'
          }}
        />
        
        {/* Mock Route Line Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
           <path 
             d="M -10 80 Q 170 20 350 50" 
             fill="none" 
             stroke={isDelayed ? "#f59e0b" : "#3b82f6"} 
             strokeWidth="4" 
             strokeDasharray="6 4"
             className="drop-shadow-sm"
           />
           <circle cx="280" cy="50" r="12" fill={isDelayed ? "#fef3c7" : "#dbeafe"} stroke="white" strokeWidth="2" />
           <circle cx="280" cy="50" r="4" fill={isDelayed ? "#f59e0b" : "#3b82f6"} />
        </svg>

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between z-10">
          <span className="font-bold text-sm bg-white/90 dark:bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-black/5 shadow-sm tracking-wide">
            #{shipment.trackingNumber}
          </span>
          
          <button 
            onClick={handleClose}
            className="h-8 w-8 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur flex items-center justify-center hover:bg-white transition-colors border border-black/5 shadow-sm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Origin Label on Map */}
        <div className="absolute bottom-3 left-4">
           <span className="text-sm font-bold text-slate-900/80 drop-shadow-md bg-white/80 px-2 py-0.5 rounded backdrop-blur-sm shadow-sm ring-1 ring-black/5">
             {shipment.origin.city}
           </span>
        </div>
      </div>

      <div className="p-5 space-y-2">
        
        {/* Status & ETA */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {isDelayed ? 'Delayed' : 'In Transit'}
            </h3>
            {isDelayed ? (
              <span className="text-slate-500 font-medium">
                - {lateMinutes} min late
              </span>
            ) : (
              <span className="text-slate-500 font-medium">
                - On Time
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm">
             <span className="text-slate-500">ETA</span>
             <span className="font-semibold text-slate-900 dark:text-slate-100">{dateStr}, {timeStr}</span>
             
             {isDelayed && (
               <Badge variant="outline" className="ml-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-50 h-6 px-2 gap-1.5 flex items-center rounded-sm">
                  <span>#{lateMinutes} min late</span>
                  <FileText className="h-3 w-3" />
               </Badge>
             )}
          </div>
        </div>

        <Separator className="bg-slate-100 dark:bg-slate-800" />

        {/* Carrier Info */}
        <div className="flex items-start gap-1">
          {shipment.carrier.logo ? (
             <img src={shipment.carrier.logo} alt={shipment.carrier.name} className="h-8 w-auto object-contain" onError={(e) => e.currentTarget.style.display='none'} />
          ) : <CarrierLogo />}
          
          <div className="flex-1 space-y-0.5">
             <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{shipment.carrier.name}</div>
             <p className="text-xs text-slate-500 !m-0">
               Tracking Number: {shipment.trackingNumber}, {shipment.origin.state}, {shipment.origin.postalCode}
             </p>
          </div>
        </div>
        
        <Separator className="bg-slate-100 dark:bg-slate-800" />

        {/* Vertical Stepper / Timeline */}
        <div className="relative pl-1 space-y-4">
           {/* Connecting Line */}
           <div className="absolute top-2 bottom-6 left-2 w-[2px] bg-slate-200 dark:bg-slate-800" />
           
           {/* Origin */}
           <div className="flex gap-4 relative">
             <div className="h-3 w-3 rounded-full border-2 border-slate-400 bg-white dark:bg-slate-900 z-10 shrink-0 mt-1.5 ring-4 ring-white dark:ring-slate-950" />
             <div className="space-y-0.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Origin</div>
                <div className="text-sm font-medium leading-snug text-slate-700 dark:text-slate-300">
                   {shipment.origin.address}, {shipment.origin.city}, {shipment.origin.state}. {shipment.origin.postalCode}.
                </div>
             </div>
           </div>

           {/* Destination */}
           <div className="flex gap-4 relative">
             <div className="h-3 w-3 rounded-full border-2 border-slate-900 dark:border-slate-50 bg-white dark:bg-slate-900 z-10 shrink-0 mt-1.5 ring-4 ring-white dark:ring-slate-950" />
             <div className="space-y-0.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Destination</div>
                <div className="text-sm font-medium leading-snug text-slate-700 dark:text-slate-300">
                   {shipment.destination.address}, {shipment.destination.city}, {shipment.destination.state}. {shipment.destination.postalCode}.
                </div>
             </div>
           </div>
        </div>
        
        {/* Route Progress */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
           <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                 Route
              </div>
              <div className="text-slate-500 tabular-nums font-medium">
                {Math.round(shipment.route[0]?.distance || 0)} {shipment.route[0]?.distanceUnit || 'mi'} + {Math.floor((shipment.route[0]?.duration || 0) / 60)}:{String((shipment.route[0]?.duration || 0) % 60).padStart(2, '0')} h
              </div>
           </div>
           
          <Progress value={shipment.progress} className="h-1.5 bg-slate-200 dark:bg-slate-800" indicatorClassName={isDelayed ? 'bg-orange-500' : 'bg-emerald-500'} />
           <div className="flex justify-end items-center gap-3">
             <span className="text-xs font-medium tabular-nums text-slate-600 dark:text-slate-400 min-w-[3ch] text-right">
               {Math.round(shipment.progress)}%
             </span>
           </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
           <Button variant="outline" size="sm" className="h-9 text-xs font-medium border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200">
             Reschedule Delivery
           </Button>
           <Button variant="ghost" size="sm" className="h-9 text-xs font-medium bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-200 shadow-sm border border-transparent justify-between px-3">
             Contact Customer
             <ChevronRight className="h-3 w-3 opacity-50" />
           </Button>
        </div>

      </div>
    </div>
  );
}
