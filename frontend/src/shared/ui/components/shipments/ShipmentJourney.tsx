import { useTranslation } from 'react-i18next';
import { Package, Truck, MapPin, Clock } from 'lucide-react';
import { cn } from '@/shadcn/lib/utils';
import { format } from 'date-fns';

interface ShipmentJourneyProps {
  departureTime: string | null;
  expectedArrival: string;
  totalDurationMinutes?: number;
  progress?: number;
  className?: string;
}

/**
 * Shared component to display shipment journey timeline
 * Shows visual representation of shipment stages from origin to destination
 */
export function ShipmentJourney({
  departureTime,
  expectedArrival,
  totalDurationMinutes,
  progress = 0,
  className
}: ShipmentJourneyProps) {
  const { t } = useTranslation('dashboards');

  // Calculate total time in days and hours
  const calculateTotalTime = () => {
    if (totalDurationMinutes && totalDurationMinutes > 0) {
      const days = Math.floor(totalDurationMinutes / (60 * 24));
      const remainingMinutes = totalDurationMinutes % (60 * 24);
      const hours = Math.floor(remainingMinutes / 60);
      const minutes = remainingMinutes % 60;
      
      if (days > 0 && hours > 0) {
        return t('shipments.details.daysHours', { days, hours });
      } else if (days > 0) {
        return t('shipments.details.days', { count: days });
      } else if (hours > 0) {
        return t('shipments.details.hours', { count: hours });
      } else {
        // Less than an hour - show minutes
        return `${minutes} min`;
      }
    }
    
    // Fallback: calculate from dates
    if (departureTime && expectedArrival) {
      const departure = new Date(departureTime);
      const arrival = new Date(expectedArrival);
      const diffMs = arrival.getTime() - departure.getTime();
      
      if (diffMs > 0) {
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (diffDays > 0 && diffHours > 0) {
          return t('shipments.details.daysHours', { days: diffDays, hours: diffHours });
        } else if (diffDays > 0) {
          return t('shipments.details.days', { count: diffDays });
        } else if (diffHours > 0) {
          return t('shipments.details.hours', { count: diffHours });
        } else {
          const diffMin = Math.floor(diffMs / (1000 * 60));
          return `${diffMin} min`;
        }
      }
    }
    
    return 'N/A';
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd MMM yy HH:mm');
  };

  // Determine progress bar color and gradient based on percentage
  const getProgressStyles = (pct: number) => {
    // Dynamic color based on progress
    let colorClass = 'to-blue-500'; // Default
    if (pct >= 100) colorClass = 'to-emerald-500';
    else if (pct > 75) colorClass = 'to-indigo-500';
    else if (pct < 25) colorClass = 'to-blue-400';
    
    // Gradient direction changes based on breakpoint (handled via CSS/Tailwind classes)
    return {
      desktop: `bg-gradient-to-r from-transparent ${colorClass}`,
      mobile: `bg-gradient-to-b from-transparent ${colorClass}`
    };
  };

  const progressStyles = getProgressStyles(progress);

  return (
    <div className={cn("", className)}>
      {/* Journey Icons Timeline - Vertical on mobile, horizontal on desktop */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 lg:gap-8 px-3 py-4 bg-muted/20 rounded-lg border">
        {/* Origin - Package */}
        <div className="flex flex-col items-center z-10">
          <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center bg-background">
            <Package className="h-5 w-5 text-primary" />
          </div>
        </div>

        {/* Connection Line & Progress Bar */}
        <div className="h-16 w-[2px] md:h-[2px] md:w-auto md:flex-1 bg-border relative">
          
          {/* Progress Bar (Desktop Horizontal) */}
          <div 
            className={cn(
              "hidden md:block absolute left-0 top-0 h-full transition-all duration-500 rounded-full",
              progressStyles.desktop
            )}
            style={{ width: `${progress}%` }}
          />
          
          {/* Progress Bar (Mobile Vertical) */}
          <div 
            className={cn(
              "md:hidden absolute top-0 left-0 w-full transition-all duration-500 rounded-full",
              progressStyles.mobile
            )}
            style={{ height: `${progress}%` }}
          />

          {/* Truck Icon - Transitions along the path */}
          <div 
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500 z-10 left-1/2 top-[var(--progress)] md:left-[var(--progress)] md:top-1/2"
            style={{ 
              '--progress': `${progress}%`
            } as React.CSSProperties}
          >
            <div className={cn(
              "h-9 w-9 rounded-full bg-background border-2 shadow-sm flex items-center justify-center transition-colors duration-300",
              progress >= 100 ? "border-emerald-500 text-emerald-500" :
              progress > 75 ? "border-indigo-500 text-indigo-500" :
              "border-blue-500 text-blue-500"
            )}>
              <Truck className="h-4 w-4 fill-current" />
            </div>
            
            {/* Percentage Label */}
            {progress > 5 && progress < 95 && (
               <div className={cn(
                 "absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold md:block hidden",
                 progress > 75 ? "text-indigo-500" : "text-blue-500"
               )}>
                 {progress}%
               </div>
            )}
          </div>
        </div>

        {/* Destination - Location */}
        <div className="flex flex-col items-center z-10">
          <div className="h-10 w-10 rounded-full bg-muted border-2 border-border flex items-center justify-center bg-background">
            <MapPin className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Timeline Details - Stacked on mobile, grid on desktop */}
      <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-3 text-center mt-6">
        {/* Total Time */}
        <div>
          <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground mb-1">
            <Clock className="h-3 w-3" />
            <span className="uppercase tracking-wide">{t('shipments.details.totalTime')}</span>
          </div>
          <div className="text-xs font-semibold">{calculateTotalTime()}</div>
        </div>

        {/* Departure Time */}
        <div>
          <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">
            {t('shipments.details.departureTime')}
          </div>
          <div className="text-xs font-semibold">{formatTime(departureTime)}</div>
        </div>

        {/* Expected Arrival */}
        <div>
          <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">
            {t('shipments.details.expectedArrival')}
          </div>
          <div className="text-xs font-semibold">{formatTime(expectedArrival)}</div>
        </div>
      </div>
    </div>
  );
}
