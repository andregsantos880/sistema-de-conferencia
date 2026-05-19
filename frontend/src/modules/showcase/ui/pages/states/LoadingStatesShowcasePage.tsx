import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { LoadingState } from '@/shared/ui/components/states/LoadingState';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import {
  Skeleton,
  SkeletonTable,
  SkeletonKpiCard,
  SkeletonCard,
} from '@/shared/ui/components/Skeleton';

const LoadingStatesShowcasePage: React.FC = () => {
  const [buttonLoading, setButtonLoading] = useState(false);

  const handleButtonClick = () => {
    setButtonLoading(true);
    setTimeout(() => setButtonLoading(false), 2000);
  };

  return (
    <ShowcasePage
      title="Loading States"
      description="Demonstrate perceived performance and loading polish using skeletons and spinners."
    >
      <ShowcaseSection
        title="Skeleton Table"
        description="Table layout using skeleton rows that match real table structure."
      >
        <CodeExample
          id="states"
          title="Table Loading State"
          code={`<Card>
  <CardHeader>
    <CardTitle>Recent Transactions</CardTitle>
  </CardHeader>
  <CardContent>
    <SkeletonTable rows={5} columns={4} />
  </CardContent>
</Card>`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <SkeletonTable rows={5} columns={4} />
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Skeleton Cards"
        description="Stat card skeletons and dashboard loading grid."
      >
        <CodeExample
          id="states"
          title="Dashboard Loading State"
          code={`<div className="space-y-6">
  {/* KPI Cards Loading */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <SkeletonKpiCard />
    <SkeletonKpiCard />
    <SkeletonKpiCard />
    <SkeletonKpiCard />
  </div>
  
  {/* Chart Cards Loading */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <SkeletonCard className="h-64" />
    <SkeletonCard className="h-64" />
  </div>
</div>`}
        >
          <div className="space-y-6">
            {/* KPI Cards Loading */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SkeletonKpiCard />
              <SkeletonKpiCard />
              <SkeletonKpiCard />
              <SkeletonKpiCard />
            </div>
            
            {/* Chart Cards Loading */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SkeletonCard className="h-64" />
              <SkeletonCard className="h-64" />
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Inline Loaders"
        description="Button loading state and inline spinner inside text."
      >
        <CodeExample
          id="states"
          title="Button & Inline Loading"
          code={`{/* Button with loading state */}
<Button disabled={isLoading} onClick={handleClick}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Saving...' : 'Save Changes'}
</Button>

{/* Inline text with spinner */}
<p className="flex items-center gap-2 text-muted-foreground">
  <Loader2 className="h-4 w-4 animate-spin" />
  Checking availability...
</p>`}
        >
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <Button 
                disabled={buttonLoading} 
                onClick={handleButtonClick}
              >
                {buttonLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {buttonLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              
              <Button variant="outline" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </Button>
              
              <Button variant="secondary" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </Button>
            </div>
            
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking availability...
              </p>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Syncing with server...
              </p>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Full Page Loader"
        description="Centered loader with message and optional overlay version."
      >
        <CodeExample
          id="states"
          title="Centered Loading State"
          code={`{/* Centered loader */}
<LoadingState message="Loading your dashboard..." />

{/* Overlay loader */}
<div className="relative">
  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
    <LoadingState message="Refreshing data..." />
  </div>
  {/* Content behind overlay */}
</div>`}
        >
          <div className="space-y-6">
            {/* Standard centered loader */}
            <Card className="p-6">
              <LoadingState message="Loading your dashboard..." size="md" />
            </Card>
            
            {/* Overlay loader example */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Refreshing data...</p>
                </div>
              </div>
              <CardContent className="p-6 opacity-50">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-32 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default LoadingStatesShowcasePage;
