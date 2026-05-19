import { Card, CardContent, CardHeader } from '@/shared/ui/shadcn/components/ui/card';
import { Skeleton } from '@/shared/ui/components/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/shadcn/components/ui/table';

export function TopProductsSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[600px] w-full overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 9 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-md" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="w-24 h-8">
                      <Skeleton className="h-full w-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
