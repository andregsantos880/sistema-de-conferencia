import React, { type ReactNode } from 'react';
import PageHeader from '@/shared/ui/components/PageHeader';
import { ShowcaseProvider } from './ShowcaseProvider';
import { useShowcaseContext } from './useShowcaseContext';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface ShowcasePageProps {
  title: string;
  description?: string| ReactNode;
  children: React.ReactNode;
}

/**
 * Internal component that uses the context
 */
const ShowcasePageContent: React.FC<ShowcasePageProps> = ({
  title,
  description,
  children,
}) => {
  const context = useShowcaseContext();

  return (
    <div className="space-y-8 showcase-page-wrapper">
      <div className="flex items-start justify-between gap-4 showcase-page-header">
        <PageHeader title={title} subtitle={description} />

        {context && (
          <Button
            variant="outline"
            size="sm"
            onClick={context.toggleCollapseAll}
            className="flex-shrink-0"
          >
            {context.collapseAll ? (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Expand All
              </>
            ) : (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Collapse All
              </>
            )}
          </Button>
        )}
      </div>
      <div className="space-y-10 showcase-page-content">{children}</div>
    </div>
  );
};

/**
 * ShowcasePage - Wrapper component for showcase pages with collapsible sections
 * 
 * Automatically provides collapse/expand functionality to all ShowcaseSection children
 * without requiring any changes to existing pages.
 */
const ShowcasePage: React.FC<ShowcasePageProps> = (props) => {
  return (
    <ShowcaseProvider>
      <ShowcasePageContent {...props} />
    </ShowcaseProvider>
  );
};

export default ShowcasePage;
