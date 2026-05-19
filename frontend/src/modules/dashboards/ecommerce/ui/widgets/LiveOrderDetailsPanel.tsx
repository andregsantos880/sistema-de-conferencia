import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/shared/ui/shadcn/components/ui/drawer';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { formatCurrency } from '../../../shared/utils/formatters';
import { formatDistanceToNow } from 'date-fns';
import type { RealtimeOrder } from '../../domain/models/EcommerceAnalytics';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { useMediaQuery } from '@/shared/hooks';

interface LiveOrderDetailsPanelProps {
  order: RealtimeOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

// Country flag emoji helper
function getCountryFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function LiveOrderDetailsPanel({ order, isOpen, onClose }: LiveOrderDetailsPanelProps) {
  if (!order) return null;

  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction={isMobile ? 'bottom' : 'right'}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Order Details</DrawerTitle>
          <DrawerDescription>View realtime order information</DrawerDescription>
        </DrawerHeader>
        
        <div className="p-4 space-y-8">
          {/* Main Amount Header */}
          <div className="text-center p-6 bg-muted/30 rounded-xl border border-border/50">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Amount</label>
            <p className="text-4xl font-bold mt-2 text-primary">
              {formatCurrency(order.amount, 'USD')}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {formatDistanceToNow(new Date(order.timestamp), { addSuffix: true })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Order ID */}
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Order ID</label>
              <p className="font-mono font-medium">{order.id}</p>
            </div>

            {/* Channel */}
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Channel</label>
              <div>
                <Badge variant="outline" className="font-normal text-base px-3 py-1">
                  {order.channel}
                </Badge>
              </div>
            </div>

            {/* Country */}
            <div className="col-span-2 space-y-1">
              <label className="text-sm text-muted-foreground">Location</label>
              <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-border/50">
                <span className="text-3xl">{getCountryFlag(order.countryCode)}</span>
                <div>
                  <p className="font-medium">{order.country}</p>
                  <p className="text-xs text-muted-foreground">{order.countryCode}</p>
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <div className="col-span-2 space-y-1">
              <label className="text-sm text-muted-foreground">Detailed Timestamp</label>
              <p className="font-mono text-sm bg-muted/30 p-2 rounded border border-border/30">
                {new Date(order.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
          
          {/* Action Buttons Placeholder */}
          <div className="pt-4 flex gap-3">
             <div className="w-full h-10 bg-primary/10 rounded-md flex items-center justify-center text-primary text-sm font-medium cursor-not-allowed opacity-70">
                View Full Receipt
             </div>
             <div className="w-full h-10 bg-destructive/10 rounded-md flex items-center justify-center text-destructive text-sm font-medium cursor-not-allowed opacity-70">
                Report Issue
             </div>
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
