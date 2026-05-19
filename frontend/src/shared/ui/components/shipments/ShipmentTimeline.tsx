// import { useTranslation } from 'react-i18next';
import { type ShipmentEvent } from '@/modules/dashboards/shipments/domain/models';
// import { formatDistanceToNow } from 'date-fns';
import { format } from 'date-fns';
import { cn } from '@/shadcn/lib/utils';
import { Package, Truck, MapPin, CheckCircle2 } from 'lucide-react';

interface ShipmentTimelineProps {
  events: ShipmentEvent[];
  className?: string;
}

/**
 * Shared component to display shipment event timeline
 * Shows chronological list of shipment events with icons and details
 */
export function ShipmentTimeline({ events, className }: ShipmentTimelineProps) {
  // const { t } = useTranslation('dashboards');

  // Sort events by timestamp (newest first for display)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getEventIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('placed') || desc.includes('order')) return Package;
    if (desc.includes('picked') || desc.includes('confirm')) return CheckCircle2;
    if (desc.includes('transit') || desc.includes('preparing')) return Truck;
    return MapPin;
  };

  return (
    <div className={cn("space-y-0", className)}>
      {sortedEvents.map((event, index) => {
        const Icon = getEventIcon(event.description);
        const isLast = index === sortedEvents.length - 1;
        
        return (
          <div key={event.id} className="flex gap-4 relative">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-[13px] top-8 bottom-0 w-[2px] bg-border" />
            )}
            
            {/* Icon */}
            <div className="relative z-10 mt-1">
              <div className={cn(
                "h-7 w-7 rounded-full border-2 bg-background flex items-center justify-center shrink-0",
                isLast ? "border-primary" : "border-border"
              )}>
                <Icon className={cn(
                  "h-3.5 w-3.5",
                  isLast ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
            </div>

            {/* Content */}
            <div className={cn("flex-1 pb-6", isLast && "pb-0")}>
              <div className="flex items-baseline gap-2 mb-1">
                <h4 className="text-sm font-semibold">{event.description}</h4>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(event.timestamp), 'dd MMM yyyy HH:mm')}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {event.details}
              </p>
              {event.location && event.location.city && (
                <p className="text-xs text-muted-foreground mt-1">
                  @ {event.location.city}, {event.location.state}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
