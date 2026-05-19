import { Card, CardContent, CardHeader } from '@/shared/ui/shadcn/components/ui/card';
import { Skeleton } from '@/shared/ui/components/Skeleton';

export function FunnelSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Funnel Chart Skeleton */}
        <div className="h-[300px] flex flex-col items-center justify-center gap-1 py-4">
          {Array.from({ length: 5 }).map((_, i) => {
            const widthPercentage = 90 - (i * 15); // 90%, 75%, 60%, 45%, 30%
            return (
              <div key={i} className="w-full flex justify-center">
                 <Skeleton 
                  className="h-10 rounded-sm" 
                  style={{ width: `${widthPercentage}%`, opacity: 1 - (i * 0.1) }} 
                 />
              </div>
            );
          })}
        </div>
        
        {/* Metric List Skeleton */}
        <div className="mt-4 space-y-2">
           {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center px-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-4">
                 <Skeleton className="h-4 w-16" />
                 <Skeleton className="h-4 w-12" />
              </div>
            </div>
           ))}
        </div>
        {/* Summary Skeleton */}
        <div className="mt-4 rounded-lg bg-muted/50 p-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
