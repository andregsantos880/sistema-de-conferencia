/**
 * InvoiceTable Component
 * 
 * Data table for displaying invoices with sorting, selection, and actions.
 * Uses SimpleSortableTable from shared components.
 */

import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Eye, Pencil, Trash2, Copy, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Checkbox } from '@/shared/ui/shadcn/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/components/ui/dropdown-menu';
import { Card, CardContent } from '@/shared/ui/shadcn/components/ui/card';
import { SimpleSortableTable } from '@/shared/ui/components/table/SimpleSortableTable';
import { cn } from '@/shadcn/lib/utils';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { INVOICING_PATHS } from '../routes';
import type { InvoiceListItem } from '../../domain/models/Invoice';
import { formatCurrency } from '../../domain/models/Invoice';

interface InvoiceTableProps {
  invoices: InvoiceListItem[];
  selectedIds: Set<string>;
  isSelected: (id: string) => boolean;
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  onMarkAsPaid: (id: string) => void;
  onMarkAsSent: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function InvoiceTable({
  invoices,
  selectedIds,
  isSelected,
  onToggle,
  onToggleAll,
  onMarkAsPaid,
  onMarkAsSent,
  onDuplicate,
  onDelete,
}: InvoiceTableProps) {
  const { t } = useTranslation('invoices');
  const navigate = useNavigate();

  const invoiceIds = useMemo(() => invoices.map((inv) => inv.id), [invoices]);

  const selectedInViewCount = useMemo(
    () => invoiceIds.filter((id) => selectedIds.has(id)).length,
    [invoiceIds, selectedIds]
  );

  const allSelected = useMemo(
    () => invoiceIds.length > 0 && selectedInViewCount === invoiceIds.length,
    [invoiceIds.length, selectedInViewCount]
  );

  const someSelected = useMemo(
    () => selectedInViewCount > 0 && !allSelected,
    [allSelected, selectedInViewCount]
  );

  const toggleSelectAll = useCallback(() => {
    onToggleAll(invoiceIds);
  }, [invoiceIds, onToggleAll]);

  const handleRowClick = useCallback((invoice: InvoiceListItem) => {
    navigate(INVOICING_PATHS.DETAIL(invoice.id));
  }, [navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const columns: ColumnDef<InvoiceListItem>[] = useMemo(
    () => [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={allSelected ? true : someSelected ? 'indeterminate' : false}
            onCheckedChange={toggleSelectAll}
            aria-label={t('table.selectAll')}
          />
        ),
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={isSelected(row.original.id)}
              onCheckedChange={() => onToggle(row.original.id)}
              aria-label={t('table.selectRow', { number: row.original.number })}
            />
          </div>
        ),
        enableSorting: false,
        size: 40,
      },
      {
        accessorKey: 'number',
        header: t('columns.number'),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.number}</span>
        ),
      },
      {
        accessorKey: 'customerName',
        header: t('columns.customer'),
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.customerName}</div>
            <div className="text-sm text-muted-foreground">
              {row.original.customerEmail}
            </div>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'status',
        header: t('columns.status'),
        cell: ({ row }) => <InvoiceStatusBadge status={row.original.status} />,
        enableSorting: false,
      },
      {
        accessorKey: 'issueDate',
        header: t('columns.issueDate'),
        cell: ({ row }) => formatDate(row.original.issueDate),
      },
      {
        accessorKey: 'dueDate',
        header: t('columns.dueDate'),
        cell: ({ row }) => (
          <span
            className={cn(
              row.original.status === 'overdue' && 'text-red-600 font-medium'
            )}
          >
            {formatDate(row.original.dueDate)}
          </span>
        ),
      },
      {
        accessorKey: 'total',
        header: () => <div className="text-right">{t('columns.total')}</div>,
        cell: ({ row }) => (
          <div className="text-right font-medium">
            {formatCurrency(row.original.total, row.original.currency)}
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const invoice = row.original;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">{t('table.openMenu')}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => navigate(INVOICING_PATHS.DETAIL(invoice.id))}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {t('actions.view')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate(INVOICING_PATHS.EDIT(invoice.id))}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    {t('actions.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(invoice.id)}>
                    <Copy className="mr-2 h-4 w-4" />
                    {t('actions.duplicate')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {invoice.status === 'draft' && (
                    <DropdownMenuItem onClick={() => onMarkAsSent(invoice.id)}>
                      <Send className="mr-2 h-4 w-4" />
                      {t('actions.markAsSent')}
                    </DropdownMenuItem>
                  )}
                  {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                    <DropdownMenuItem onClick={() => onMarkAsPaid(invoice.id)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {t('actions.markAsPaid')}
                    </DropdownMenuItem>
                  )}
                  {(invoice.status === 'draft' || invoice.status === 'cancelled') && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(invoice.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('actions.delete')}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        enableSorting: false,
        size: 50,
      },
    ],
    [t, allSelected, someSelected, isSelected, onToggle, toggleSelectAll, navigate, onDuplicate, onMarkAsSent, onMarkAsPaid, onDelete]
  );

  return (
    <Card>
      <CardContent>
        <SimpleSortableTable
          columns={columns}
          data={invoices}
          onRowClick={handleRowClick}
          initialSort={[{ id: 'issueDate', desc: true }]}
        />
      </CardContent>
    </Card>
  );
}

export default InvoiceTable;
