import { Card, CardContent, CardHeader } from '@/shared/ui/shadcn/components/ui/card';
import { WidgetHeader } from './WidgetHeader';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { SimpleSortableTable } from '@/shared/ui/components/table/SimpleSortableTable';
import { ScrollArea } from '@/shadcn/components/ui/scroll-area';
import { ScrollFadeContainer } from '@/components/scroll';

export type LeaderboardTableHeight = 'sm' | 'md' | 'lg' | 'full';

const heightClasses: Record<LeaderboardTableHeight, string> = {
  sm: 'h-[200px]',
  md: 'h-[400px]',
  lg: 'h-[600px]',
  full: 'h-full',
};

export interface LeaderboardTableProps<TData> {
  title: string;
  columns: ColumnDef<TData>[];
  data: TData[];
  initialSort?: SortingState;
  onExport?: () => void;
  onRefresh?: () => void;
  density?: 'compact' | 'spacious';
  /** Height of the scrollable table container. Defaults to 'md' (400px). */
  height?: LeaderboardTableHeight;
  className?: string;
  actions?: ReactNode;
  /** Callback when a row is clicked */
  onRowClick?: (row: TData) => void;
  /** Phase 3: ID of currently selected row */
  selectedRowId?: string | null;
  /** Phase 3: Function to extract ID from row */
  getRowId?: (row: TData) => string;
  
  // ─────────────────────────────────────────────────────────────────────────────
  // Expandable Row Support
  // ─────────────────────────────────────────────────────────────────────────────
  
  /** Enable row expansion */
  expandable?: boolean;
  /** Render function for expanded row content */
  renderExpandedRow?: (row: TData) => ReactNode;
  /** Allow multiple rows to be expanded simultaneously (default: true) */
  multiExpand?: boolean;
}

export function LeaderboardTable<TData>({
  title,
  columns,
  data,
  initialSort = [],
  onExport,
  onRefresh,
  density = 'spacious',
  height = 'md',
  className,
  actions,
  onRowClick,
  selectedRowId,
  getRowId,
  expandable,
  renderExpandedRow,
  multiExpand = true,
}: LeaderboardTableProps<TData>) {
  return (
    <Card className={className}>
      <CardHeader className={density === 'compact' ? 'py-3' : undefined}>
        <WidgetHeader title={title} onExport={onExport} onRefresh={onRefresh} actions={actions} />
      </CardHeader>
      <CardContent>
        <ScrollFadeContainer 
          className={heightClasses[height]} 
          fadeSize='lg'
          fadeClassName="from-card via-card-80"
        >
          <ScrollArea className="h-full">
            <SimpleSortableTable
              columns={columns}
              data={data}
              initialSort={initialSort as SortingState}
              density={density}
              onRowClick={onRowClick}
              selectedRowId={selectedRowId}
              getRowId={getRowId}
              expandable={expandable}
              renderExpandedRow={renderExpandedRow}
              multiExpand={multiExpand}
            />
          </ScrollArea>
        </ScrollFadeContainer>
      </CardContent>
    </Card>
  );
}
