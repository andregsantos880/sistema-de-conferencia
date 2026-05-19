import { Card, CardContent, CardHeader } from '@/shared/ui/shadcn/components/ui/card';
import { Skeleton } from '@/shared/ui/components/Skeleton';

export function ChannelBreakdownSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Donut Chart Skeleton */}
        <div className="h-[340px] flex items-center justify-center relative">
          <div className="relative h-60 w-60">
             {/* Outer ring */}
            <Skeleton className="absolute inset-0 rounded-full border-[20px] border-muted/20" style={{ borderRadius: '50%' }} />
             {/* Inner segments simulation (4 segments) */}
             <div className="absolute top-0 right-0 w-1/2 h-1/2 border-[20px] rounded-tr-full border-muted/40" />
             <div className="absolute bottom-0 right-0 w-1/2 h-1/2 border-[20px] rounded-br-full border-muted/60" />
          </div>
        </div>

        {/* Legend/List Skeleton */}
        <div className="mt-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex flex-col items-end gap-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
