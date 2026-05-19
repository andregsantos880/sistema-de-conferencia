/**
 * Table Components
 * 
 * @module table
 * 
 * This module exports all table-related components:
 * 
 * - SimpleSortableTable: Lightweight client-side table with sorting, pagination, expansion, and selection
 * - DataTable: Enterprise-grade table with TanStack Table, supports both client and server modes
 * - TablePagination: Reusable pagination UI primitive
 * - EditableTableCell: Inline editable table cell component
 */

// Main table components
export { SimpleSortableTable } from './SimpleSortableTable';
export type { SimpleSortableTableProps } from './SimpleSortableTable';

export { DataTable } from './DataTable';
export type { 
  DataTableColumn,
  DataTableProps,
  TableMode,
  TableDensity,
} from './DataTable';

// Primitives
export { TablePagination } from './TablePagination';
export type { TablePaginationProps } from './TablePagination';

// Utilities
export { EditableTableCell } from './EditableTableCell';
