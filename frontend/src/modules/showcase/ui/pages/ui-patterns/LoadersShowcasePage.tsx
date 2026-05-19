import React from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  SkeletonAvatar,
  SkeletonList,
} from '@/shared/ui/components/Skeleton';
import { LoadingState } from '@/shared/ui/components/states/LoadingState';

const LoadersShowcasePage: React.FC = () => {
  return (
    <ShowcasePage
      title="Loaders & Skeletons"
      description="Loading indicators and placeholder content for async operations."
    >
      <ShowcaseSection
        title="Spinner Loaders"
        description="Animated spinners for indicating loading state."
      >
        <CodeExample
          id="loaders"
          title="Spinner Variants"
          code={`<Loader2 className="h-6 w-6 animate-spin" />

<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>`}
        >
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Small</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Medium</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Large</span>
            </div>
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </Button>
          </div>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Loading State Component"
        description="Centered loading indicator with message."
      >
        <CodeExample
          id="loaders"
          title="LoadingState"
          code={`<LoadingState message="Loading your data..." />`}
        >
          <div className="border rounded-lg p-4">
            <LoadingState message="Loading your data..." size="sm" />
          </div>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Basic Skeleton"
        description="Animated placeholder blocks."
      >
        <CodeExample
          id="loaders"
          title="Skeleton Blocks"
          code={`<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-4 w-[200px]" />
<Skeleton className="h-10 w-10 rounded-full" />`}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Skeleton Text"
        description="Multiple lines of text placeholder."
      >
        <CodeExample
          id="loaders"
          title="SkeletonText"
          code={`<SkeletonText lines={3} />`}
        >
          <div className="max-w-md">
            <SkeletonText lines={4} />
          </div>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Skeleton Card"
        description="Card-shaped skeleton placeholder."
      >
        <CodeExample
          id="loaders"
          title="SkeletonCard"
          code={`<SkeletonCard showHeader showFooter />`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <SkeletonCard showHeader />
            <SkeletonCard showHeader showFooter />
          </div>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Skeleton Table"
        description="Table-shaped skeleton placeholder."
      >
        <CodeExample
          id="loaders"
          title="SkeletonTable"
          code={`<SkeletonTable rows={5} columns={4} />`}
        >
          <SkeletonTable rows={4} columns={4} />
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Skeleton List"
        description="List items with avatars placeholder."
      >
        <CodeExample
          id="loaders"
          title="SkeletonList"
          code={`<SkeletonList items={5} showAvatar />`}
        >
          <div className="max-w-md">
            <SkeletonList items={4} showAvatar />
          </div>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Skeleton Avatar"
        description="Avatar placeholder in different sizes."
      >
        <CodeExample
          id="loaders"
          title="SkeletonAvatar"
          code={`<SkeletonAvatar size="sm" />
<SkeletonAvatar size="md" />
<SkeletonAvatar size="lg" />`}
        >
          <div className="flex items-center gap-4">
            <SkeletonAvatar size="sm" />
            <SkeletonAvatar size="md" />
            <SkeletonAvatar size="lg" />
          </div>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default LoadersShowcasePage;

