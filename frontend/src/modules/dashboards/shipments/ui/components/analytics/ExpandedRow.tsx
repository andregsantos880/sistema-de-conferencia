import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { type Shipment } from '../../../domain/models';
import { ArrowRight, MapPin, Map, Package, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { StatusBadge } from '../shared/StatusBadge';
import { ShipmentTimeline, ShipmentJourney } from '@/shared/ui/components/shipments';
import { cn } from '@/shadcn/lib/utils';
import { Alert, AlertDescription } from '@/components/Alert';
import { Link } from 'react-router-dom';
import { TableCell, TableRow } from '@/shared/ui/shadcn/components/ui/table';

interface ExpandedRowProps {
  shipment: Shipment;
  isDelayed: boolean;
  onViewInMap: (e: React.MouseEvent, shipmentId: string) => void;
}

/**
 * Expanded row component for shipment details
 * Shows comprehensive information including addresses, journey, alerts, and timeline
 */
export function ExpandedRow({ shipment, isDelayed, onViewInMap }: ExpandedRowProps) {
  const { t } = useTranslation('dashboards');

  return (
    <TableRow className="border-b">
      <TableCell colSpan={7} className="p-0 whitespace-normal">
        <div className="p-4 lg:p-6 bg-background">
          {/* Compact Header - Single Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 pb-3 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl lg:text-2xl font-bold">{shipment.trackingNumber}</h3>
                <StatusBadge status={shipment.status} size="sm" />
                {isDelayed && (
                  <Badge variant="destructive" className="text-xs">
                    {t('shipments.status.delayed')}
                  </Badge>
                )}
              </div>
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <span>{format(new Date(shipment.shippingDate), 'MMM dd, yyyy')}</span>
                <span>•</span>
                <Link 
                  to={`/orders/${shipment.orderId}`} 
                  className="text-primary hover:underline font-medium"
                >
                  {shipment.orderId}
                </Link>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <MessageSquare className="h-3.5 w-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">{t('shipments.details.notifyCustomer')}</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-xs hidden sm:flex">
                {t('shipments.details.cancelOrder')}
              </Button>
            </div>
          </div>

          {/* Two-Column Layout: Left=Details, Right=Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
            {/* Left Column - Main Details */}
            <div className="space-y-4">
              {/* Compact Addresses - Inline on large screens */}
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                {/* Origin */}
                <div className="flex items-start gap-2 flex-1">
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Origin</p>
                    <p className="font-medium text-foreground leading-tight">
                      {shipment.origin.city}, {shipment.origin.state} {shipment.origin.postalCode}
                    </p>
                  </div>
                </div>
                
                {/* Arrow Separator - Hidden on mobile */}
                <div className="hidden sm:flex items-center justify-center shrink-0 mt-5">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                
                {/* Destination */}
                <div className="flex items-start gap-2 flex-1">
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Destination</p>
                    <p className="font-medium text-foreground leading-tight">
                      {shipment.destination.city}, {shipment.destination.state} {shipment.destination.postalCode}
                    </p>
                  </div>
                </div>

                {/* Carrier Badge - Inline on large screens */}
                <Badge variant="outline" className="flex items-center gap-1.5 px-2.5 py-1 text-xs shrink-0 sm:mt-5">
                  <Package className="h-3.5 w-3.5" />
                  {shipment.carrier.name}
                </Badge>
              </div>

              {/* Compact Journey Visualization */}
              <ShipmentJourney
                departureTime={shipment.departureTime}
                expectedArrival={shipment.estimatedDelivery}
                totalDurationMinutes={shipment.route[0]?.duration}
                progress={shipment.progress}
                className="mt-8"
              />

              {/* Alerts */}
              {shipment.alerts && shipment.alerts.length > 0 && (
                <div className="space-y-2">
                  {shipment.alerts.map((alert) => (
                    <Alert 
                      key={alert.id}
                      variant={alert.type === 'warning' ? 'warning' : 'info'} 
                      className={cn(
                        "text-sm"
                      )}
                    >
                      <AlertDescription className="text-xs leading-relaxed">
                        {alert.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {/* Action Buttons - Only on mobile/tablet */}
              <div className="flex gap-2 pt-3 border-t lg:hidden">
                <Button 
                  size="sm" 
                  onClick={(e) => onViewInMap(e, shipment.id)}
                  className="gap-1.5 text-xs"
                >
                  <Map className="h-3.5 w-3.5" />
                  {t('shipments.table.viewInMap')}
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  {t('shipments.table.rescheduleDelivery')}
                </Button>
              </div>
            </div>

            {/* Right Column - Event Timeline Sidebar (Desktop only) */}
            <div className="hidden lg:block">
              <div className="sticky top-4 bg-muted/30 rounded-lg border p-4 h-fit max-h-[600px] overflow-y-auto">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {t('shipments.details.shipmentStatus')}
                </h4>
                <ShipmentTimeline events={shipment.events} />
              </div>
            </div>

            {/* Mobile Timeline - Full Width Below */}
            <div className="lg:hidden pt-4 border-t">
              <h4 className="text-lg font-semibold mb-3">{t('shipments.details.shipmentStatus')}</h4>
              <ShipmentTimeline events={shipment.events} />
            </div>
          </div>

          {/* Action Buttons - Desktop Only (Bottom) */}
          <div className="hidden lg:flex gap-2 pt-4 mt-4 border-t">
            <Button 
              size="sm" 
              onClick={(e) => onViewInMap(e, shipment.id)}
              className="gap-2"
            >
              <Map className="h-4 w-4" />
              {t('shipments.table.viewInMap')}
            </Button>
            <Button size="sm" variant="outline">
              {t('shipments.table.rescheduleDelivery')}
            </Button>
            <Button size="sm" variant="outline">
              {t('shipments.table.contactCustomer')}
            </Button>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
