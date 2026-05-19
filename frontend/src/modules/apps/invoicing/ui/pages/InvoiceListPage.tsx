/**
 * InvoiceListPage
 * 
 * Displays a paginated list of invoices with filters, sorting, and actions.
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useBulkSelection } from '@/shared/hooks';
import PageLayout from '@/shared/ui/components/PageLayout';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/ui/shadcn/components/ui/pagination';
import { InvoiceFilters } from '../components/InvoiceFilters';
import { InvoiceTable } from '../components/InvoiceTable';
import { InvoiceListSkeleton } from '../components/InvoiceListSkeleton';
import { INVOICING_PATHS } from '../routes';
import {
  useInvoices,
  useMarkInvoiceAsPaid,
  useMarkInvoiceAsSent,
  useDuplicateInvoice,
  useDeleteInvoice,
} from '../../application/hooks';
import type { InvoiceFilters as IInvoiceFilters } from '../../domain/models/Invoice';

export function InvoiceListPage() {
  const { t } = useTranslation('invoices');
  const navigate = useNavigate();

  // Filters state
  const [filters, setFilters] = useState<IInvoiceFilters>({
    page: 1,
    pageSize: 10,
    sortBy: 'issueDate',
    sortOrder: 'desc',
  });

  // Selection state
  const {
    selectedIds,
    clear: clearSelection,
    deselect,
    selectAll,
    toggle: toggleSelect,
    isSelected,
    isAllSelected,
  } = useBulkSelection<string>();

  const handleToggleAll = useCallback(
    (ids: string[]) => {
      if (isAllSelected(ids)) {
        clearSelection();
      } else {
        selectAll(ids);
      }
    },
    [clearSelection, isAllSelected, selectAll]
  );

  // Queries
  const { data, isLoading, error, refetch } = useInvoices(filters);

  // Mutations
  const markAsPaid = useMarkInvoiceAsPaid();
  const markAsSent = useMarkInvoiceAsSent();
  const duplicateInvoice = useDuplicateInvoice();
  const deleteInvoice = useDeleteInvoice();

  // Handlers
  const handleFiltersChange = useCallback((newFilters: IInvoiceFilters) => {
    setFilters(newFilters);
    clearSelection();
  }, [clearSelection]);

  const handlePageChange = useCallback(
    (page: number) => {
      setFilters((prev) => ({ ...prev, page }));
      clearSelection();
    },
    [clearSelection]
  );

  const handleMarkAsPaid = useCallback(
    async (id: string) => {
      try {
        await markAsPaid.mutateAsync(id);
        toast.success(t('success.markedAsPaid'));
      } catch {
        toast.error(t('errors.markAsPaidFailed'));
      }
    },
    [markAsPaid, t]
  );

  const handleMarkAsSent = useCallback(
    async (id: string) => {
      try {
        await markAsSent.mutateAsync(id);
        toast.success(t('success.markedAsSent'));
      } catch {
        toast.error(t('errors.markAsSentFailed'));
      }
    },
    [markAsSent, t]
  );

  const handleDuplicate = useCallback(
    async (id: string) => {
      try {
        const newInvoice = await duplicateInvoice.mutateAsync(id);
        toast.success(t('success.duplicated'));
        navigate(INVOICING_PATHS.EDIT(newInvoice.id));
      } catch {
        toast.error(t('errors.duplicateFailed'));
      }
    },
    [duplicateInvoice, navigate, t]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteInvoice.mutateAsync(id);
        toast.success(t('success.deleted'));
        deselect(id);
      } catch {
        toast.error(t('errors.deleteFailed'));
      }
    },
    [deleteInvoice, deselect, t]
  );

  const handleCreateInvoice = useCallback(() => {
    navigate(INVOICING_PATHS.NEW);
  }, [navigate]);

  // Pagination info
  const totalPages = data?.totalPages ?? 1;
  const currentPage = data?.page ?? 1;
  const totalItems = data?.total ?? 0;
  const pageSize = data?.pageSize ?? 10;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <PageLayout
      title={t('title')}
      subtitle={t('subtitle')}
      isLoading={isLoading}
      error={error}
      data={data?.items ?? []}
      loadingFallback={<InvoiceListSkeleton />}
      errorConfig={{
        title: t('errors.loadFailed'),
        description: t('errors.loadFailedDescription'),
        icon: FileText,
        onRetry: () => refetch(),
      }}
      emptyConfig={{
        title: t('empty.title'),
        description: t('empty.description'),
        icon: FileText,
        action: {
          label: t('actions.new'),
          onClick: handleCreateInvoice,
          icon: Plus,
        },
      }}
      actions={
        <Button onClick={handleCreateInvoice}>
          <Plus className="h-4 w-4 mr-2" />
          {t('actions.new')}
        </Button>
      }
    >
      {(invoices) => (
        <div className="space-y-4">
          {/* Filters */}
          <InvoiceFilters filters={filters} onFiltersChange={handleFiltersChange} />

          {/* Table */}
          <InvoiceTable
            invoices={invoices}
            selectedIds={selectedIds}
            isSelected={isSelected}
            onToggle={toggleSelect}
            onToggleAll={handleToggleAll}
            onMarkAsPaid={handleMarkAsPaid}
            onMarkAsSent={handleMarkAsSent}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t('pagination.showing', { start: startItem, end: endItem, total: totalItems })}
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(pageNum);
                          }}
                          isActive={pageNum === currentPage}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                      }}
                      className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
}

export default InvoiceListPage;
