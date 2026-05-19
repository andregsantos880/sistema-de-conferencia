import { Card, CardContent, CardHeader } from '@/shared/ui/shadcn/components/ui/card';
import { Skeleton } from '@/shared/ui/components/Skeleton';

export function RevenueOverviewSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart Area Skeleton */}
        <div className="h-[310px] w-full flex items-end justify-between gap-1 pt-6 pb-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className="w-full rounded-t-sm" 
              style={{ 
                height: `${Math.floor(Math.random() * 60 + 30)}%`,
                opacity: 0.2 + (i / 20) 
              }} 
            />
          ))}
        </div>
        
        {/* X-Axis labels placeholder */}
        <div className="flex justify-between mt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-8" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
