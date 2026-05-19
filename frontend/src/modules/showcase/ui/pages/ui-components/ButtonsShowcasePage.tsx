import React, { useState } from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import {
  Search,
  Filter,
  RefreshCw,
  Settings,
  Plus,
  Download,
  Trash2,
  Loader2,
  Grid,
  List,
  LayoutGrid,
} from 'lucide-react';
import { cn } from '@/shadcn/lib/utils';

const ButtonsShowcasePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  const handleLoadingClick = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <ShowcasePage
      title="Buttons"
      description="Button components with various styles and sizes."
    >
      {/* Button Variants */}
      <ShowcaseSection
        title="Button Variants"
        description="Different button styles for various use cases."
      >
        <CodeExample
          id="buttons"
          title="Primary & Secondary"
          code={`<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="destructive">Destructive</Button>`}
        >
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Button Sizes */}
      <ShowcaseSection
        title="Button Sizes"
        description="Buttons come in different sizes."
      >
        <CodeExample
          id="buttons-sizes"
          title="Size Variations"
          code={`<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Icon-Only Buttons */}
      <ShowcaseSection
        title="Icon-Only Buttons"
        description="Compact buttons with icons for common actions. Ensure proper sizing and accessible hit-areas."
      >
        <CodeExample
          id="buttons-icon-only"
          title="Icon Buttons"
          code={`<Button variant="outline" size="icon"><Search className="h-4 w-4" /></Button>
<Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
<Button variant="ghost" size="icon"><RefreshCw className="h-4 w-4" /></Button>
<Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>`}
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">Default State</p>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="icon" aria-label="Search">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" aria-label="Filter">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Refresh">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Settings">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" aria-label="Grid view">
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3">Disabled State</p>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="icon" disabled aria-label="Search disabled">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" disabled aria-label="Filter disabled">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" disabled aria-label="Refresh disabled">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" disabled aria-label="Settings disabled">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3">Size Variations</p>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Small search">
                  <Search className="h-3.5 w-3.5" />
                </Button>
                <Button variant="outline" size="icon" aria-label="Default search">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-11 w-11" aria-label="Large search">
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Button + Icon */}
      <ShowcaseSection
        title="Button + Icon"
        description="Buttons with leading icons for enhanced visual communication."
      >
        <CodeExample
          id="buttons-with-icons"
          title="Buttons with Leading Icons"
          code={`<Button><Plus className="mr-2 h-4 w-4" />Add Item</Button>
<Button variant="secondary"><Download className="mr-2 h-4 w-4" />Export</Button>
<Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
<Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</Button>`}
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">Primary CTA</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
                <Button size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Project
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3">Secondary Actions</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="secondary">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button variant="ghost">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3">Destructive Action</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3">Loading State</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button disabled={isLoading} onClick={handleLoadingClick}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Click to Load
                    </>
                  )}
                </Button>
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </Button>
              </div>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Rounded Buttons */}
      <ShowcaseSection
        title="Rounded Buttons"
        description="Pill-style buttons ideal for tags, filters, and status labels."
      >
        <CodeExample
          id="buttons-rounded"
          title="Pill Buttons"
          code={`<Button className="rounded-full">Active</Button>
<Button variant="secondary" className="rounded-full">Pending</Button>
<Button variant="outline" className="rounded-full">Archived</Button>`}
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">Status Tags</p>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" className="rounded-full px-4">
                  Active
                </Button>
                <Button size="sm" variant="secondary" className="rounded-full px-4 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400">
                  Pending
                </Button>
                <Button size="sm" variant="outline" className="rounded-full px-4">
                  Archived
                </Button>
                <Button size="sm" variant="destructive" className="rounded-full px-4">
                  Rejected
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3">Filter Chips</p>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="secondary" className="rounded-full px-4">
                  All
                </Button>
                <Button size="sm" variant="outline" className="rounded-full px-4">
                  Design
                </Button>
                <Button size="sm" variant="outline" className="rounded-full px-4">
                  Development
                </Button>
                <Button size="sm" variant="outline" className="rounded-full px-4">
                  Marketing
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3">Size Variations</p>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" className="rounded-full px-3 h-7 text-xs">
                  Small
                </Button>
                <Button className="rounded-full px-5">
                  Default
                </Button>
                <Button size="lg" className="rounded-full px-6">
                  Large
                </Button>
              </div>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Button Groups */}
      <ShowcaseSection
        title="Button Groups"
        description="Grouped buttons with shared borders for related actions."
      >
        <CodeExample
          id="buttons-groups"
          title="Grouped Buttons"
          code={`<div className="inline-flex rounded-md shadow-sm">
  <Button variant="outline" className="rounded-r-none">Grid</Button>
  <Button variant="outline" className="rounded-none border-l-0">List</Button>
</div>`}
        >
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-3">View Mode Selector</p>
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  className="rounded-r-none"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="mr-2 h-4 w-4" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  className={cn('rounded-l-none', viewMode !== 'list' && 'border-l-0')}
                  onClick={() => setViewMode('list')}
                >
                  <List className="mr-2 h-4 w-4" />
                  List
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3">Time Range Selector</p>
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <Button
                  variant={timeRange === '7d' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => setTimeRange('7d')}
                >
                  7 days
                </Button>
                <Button
                  variant={timeRange === '30d' ? 'default' : 'outline'}
                  size="sm"
                  className={cn('rounded-none', timeRange !== '30d' && 'border-l-0')}
                  onClick={() => setTimeRange('30d')}
                >
                  30 days
                </Button>
                <Button
                  variant={timeRange === '90d' ? 'default' : 'outline'}
                  size="sm"
                  className={cn('rounded-l-none', timeRange !== '90d' && 'border-l-0')}
                  onClick={() => setTimeRange('90d')}
                >
                  90 days
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3">Icon-Only Group</p>
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <Button variant="outline" size="icon" className="rounded-r-none" aria-label="Grid view">
                  <Grid className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-none border-l-0" aria-label="List view">
                  <List className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-l-none border-l-0" aria-label="Layout view">
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3">Action Group</p>
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <Button variant="outline" className="rounded-r-none">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button variant="outline" className="rounded-none border-l-0">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" className="rounded-l-none border-l-0">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default ButtonsShowcasePage;

