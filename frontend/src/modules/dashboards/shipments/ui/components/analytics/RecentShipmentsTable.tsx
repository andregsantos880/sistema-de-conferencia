import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/shadcn/components/ui/table';
import { type Shipment, ShipmentStatus } from '../../../domain/models';
import { ArrowRight, MapPin, ChevronDown, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/shadcn/components/ui/card';
import { WidgetHeader } from '@/modules/dashboards/shared/components';
import { StatusBadge } from '../shared/StatusBadge';
import { cn } from '@/shadcn/lib/utils';
import { ExpandedRow } from './ExpandedRow';
import { getStatusColor } from '../../../shared/utils/shipmentHelpers';

interface RecentShipmentsTableProps {
  shipments: Shipment[];
  onSelectShipment?: (shipmentId: string) => void;
}

export function RecentShipmentsTable({ shipments, onSelectShipment }: RecentShipmentsTableProps) {
  const { t } = useTranslation('dashboards');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const recentItems = shipments.slice(0, 5);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isExpanded = (id: string) => expandedRows.has(id);

  const handleViewInMap = (e: React.MouseEvent, shipmentId: string) => {
    e.stopPropagation();
    
    // Scroll to top to show the map
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Select the shipment after a short delay to allow scroll animation
    setTimeout(() => {
      onSelectShipment?.(shipmentId);
    }, 300);
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <WidgetHeader title={t('shipments.table.recentShipments')} />
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10"></TableHead>
                <TableHead className="w-[140px]">{t('shipments.table.trackingId')}</TableHead>
                <TableHead>{t('shipments.table.status')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('shipments.table.origin')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('shipments.table.destination')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('shipments.table.eta')}</TableHead>
                <TableHead className="text-right hidden md:table-cell">{t('shipments.table.updated')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentItems.map((shipment) => {
                const statusColor = getStatusColor(shipment.status);
                const eta = shipment.estimatedDelivery 
                  ? formatDistanceToNow(new Date(shipment.estimatedDelivery), { addSuffix: true }).replace('about ', '').replace('in ', '')
                  : 'N/A';
                const updated = shipment.events.length > 0 
                   ? formatDistanceToNow(new Date(shipment.events[shipment.events.length-1].timestamp), { addSuffix: true })
                   : t('common.justNow', { defaultValue: 'Just now' });
                
                const isDelayed = shipment.status === ShipmentStatus.DELAYED;
                // const lateMinutes = shipment.lateDurationMinutes || 0;

                return (
                  <React.Fragment key={shipment.id}>
                    {/* Main Row */}
                    <TableRow 
                      onClick={() => toggleRow(shipment.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleRow(shipment.id);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-expanded={isExpanded(shipment.id)}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-muted/50 focus:outline-none",
                        isExpanded(shipment.id) && "bg-muted/30"
                      )}
                    >
                      <TableCell className="p-3">
                        <div className="flex items-center justify-center">
                          {isExpanded(shipment.id) ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColor }} />
                           {shipment.trackingNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge 
                          status={shipment.status} 
                          size="sm" 
                          className="bg-transparent h-auto" 
                        />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[120px]">{shipment.origin.city}, {shipment.origin.state}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="hidden sm:flex h-[2px] w-8 bg-muted-foreground/20 relative items-center justify-center">
                             <div className="h-1 w-1 rounded-full bg-muted-foreground/40 absolute left-0" />
                             <ArrowRight className="h-3 w-3 text-muted-foreground/60 absolute right-0" />
                          </div>
                          <span className="text-muted-foreground truncate max-w-[120px]">{shipment.destination.city}, {shipment.destination.state}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                         <span className="text-sm font-medium">{eta}</span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-xs hidden md:table-cell">
                        {updated}
                      </TableCell>
                    </TableRow>

                    {/* Expanded Details Row */}
                    {isExpanded(shipment.id) && (
                      <ExpandedRow
                        shipment={shipment}
                        isDelayed={isDelayed}
                        onViewInMap={handleViewInMap}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
