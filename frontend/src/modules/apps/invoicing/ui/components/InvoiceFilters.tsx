/**
 * InvoiceFilters Component
 * 
 * Filter controls for the invoice list page.
 */

import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/components/ui/select';
import type { InvoiceStatus, InvoiceFilters as IInvoiceFilters } from '../../domain/models/Invoice';

interface InvoiceFiltersProps {
  filters: IInvoiceFilters;
  onFiltersChange: (filters: IInvoiceFilters) => void;
}

export function InvoiceFilters({ filters, onFiltersChange }: InvoiceFiltersProps) {
  const { t } = useTranslation('invoices');

  const statusOptions = useMemo(() => [
    { value: 'all' as const, label: t('filters.allStatuses') },
    { value: 'draft' as InvoiceStatus, label: t('status.draft') },
    { value: 'sent' as InvoiceStatus, label: t('status.sent') },
    { value: 'paid' as InvoiceStatus, label: t('status.paid') },
    { value: 'overdue' as InvoiceStatus, label: t('status.overdue') },
    { value: 'cancelled' as InvoiceStatus, label: t('status.cancelled') },
  ], [t]);
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      // Debounce search
      const timeoutId = setTimeout(() => {
        onFiltersChange({ ...filters, search: value, page: 1 });
      }, 300);
      return () => clearTimeout(timeoutId);
    },
    [filters, onFiltersChange]
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        status: value as InvoiceStatus | 'all',
        page: 1,
      });
    },
    [filters, onFiltersChange]
  );

  const handleClearFilters = useCallback(() => {
    setSearchValue('');
    onFiltersChange({
      page: 1,
      pageSize: filters.pageSize,
    });
  }, [filters.pageSize, onFiltersChange]);

  const hasActiveFilters = searchValue || (filters.status && filters.status !== 'all');

  return (
    <div className="flex flex-col gap-4 page-header sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('filters.searchPlaceholder')}
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status || 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('filters.status')} />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-9 px-2"
          >
            <X className="h-4 w-4 mr-1" />
            {t('filters.clear')}
          </Button>
        )}
      </div>
    </div>
  );
}

export default InvoiceFilters;
