/**
 * Invoice React Query Hooks
 * 
 * Provides data fetching and mutation hooks for the Invoicing module.
 * Uses TanStack Query for server state management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInvoiceRepository } from './useInvoiceRepository';
import type {
  Invoice,
  InvoiceFilters,
  CreateInvoiceDto,
  UpdateInvoiceDto,
} from '../../domain/models/Invoice';

// ============================================================================
// Query Keys
// ============================================================================

export const INVOICE_QUERY_KEYS = {
  all: ['invoices'] as const,
  lists: () => [...INVOICE_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: InvoiceFilters) => [...INVOICE_QUERY_KEYS.lists(), filters] as const,
  details: () => [...INVOICE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...INVOICE_QUERY_KEYS.details(), id] as const,
};

// ============================================================================
// List Hooks
// ============================================================================

/**
 * Fetch invoices with optional filters
 */
export function useInvoices(filters?: InvoiceFilters) {
  const repo = useInvoiceRepository();

  return useQuery({
    queryKey: INVOICE_QUERY_KEYS.list(filters),
    queryFn: () => repo.getInvoices(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// ============================================================================
// Detail Hooks
// ============================================================================

/**
 * Fetch a single invoice by ID
 */
export function useInvoice(id: string | null) {
  const repo = useInvoiceRepository();

  return useQuery({
    queryKey: INVOICE_QUERY_KEYS.detail(id ?? ''),
    queryFn: () => repo.getInvoiceById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new invoice
 */
export function useCreateInvoice() {
  const repo = useInvoiceRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateInvoiceDto) => repo.createInvoice(dto),
    onSuccess: () => {
      // Invalidate list queries to refresh
      queryClient.invalidateQueries({ queryKey: INVOICE_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Update an existing invoice
 */
export function useUpdateInvoice() {
  const repo = useInvoiceRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateInvoiceDto }) =>
      repo.updateInvoice(id, dto),
    onSuccess: (updatedInvoice) => {
      // Update the invoice in cache
      queryClient.setQueryData(
        INVOICE_QUERY_KEYS.detail(updatedInvoice.id),
        updatedInvoice
      );
      // Invalidate list queries to reflect changes
      queryClient.invalidateQueries({ queryKey: INVOICE_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Delete an invoice
 */
export function useDeleteInvoice() {
  const repo = useInvoiceRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repo.deleteInvoice(id),
    onSuccess: (_data, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: INVOICE_QUERY_KEYS.detail(id) });
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: INVOICE_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Mark invoice as paid
 */
export function useMarkInvoiceAsPaid() {
  const repo = useInvoiceRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repo.markAsPaid(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: INVOICE_QUERY_KEYS.detail(id) });

      // Snapshot previous value
      const previousInvoice = queryClient.getQueryData<Invoice>(
        INVOICE_QUERY_KEYS.detail(id)
      );

      // Optimistically update
      if (previousInvoice) {
        queryClient.setQueryData<Invoice>(
          INVOICE_QUERY_KEYS.detail(id),
          { ...previousInvoice, status: 'paid' }
        );
      }

      return { previousInvoice };
    },
    onError: (_err, id, context) => {
      // Rollback on error
      if (context?.previousInvoice) {
        queryClient.setQueryData(
          INVOICE_QUERY_KEYS.detail(id),
          context.previousInvoice
        );
      }
    },
    onSettled: (_data, _error, id) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: INVOICE_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: INVOICE_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Mark invoice as sent
 */
export function useMarkInvoiceAsSent() {
  const repo = useInvoiceRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repo.markAsSent(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: INVOICE_QUERY_KEYS.detail(id) });

      const previousInvoice = queryClient.getQueryData<Invoice>(
        INVOICE_QUERY_KEYS.detail(id)
      );

      if (previousInvoice) {
        queryClient.setQueryData<Invoice>(
          INVOICE_QUERY_KEYS.detail(id),
          { ...previousInvoice, status: 'sent' }
        );
      }

      return { previousInvoice };
    },
    onError: (_err, id, context) => {
      if (context?.previousInvoice) {
        queryClient.setQueryData(
          INVOICE_QUERY_KEYS.detail(id),
          context.previousInvoice
        );
      }
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: INVOICE_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: INVOICE_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Duplicate an invoice
 */
export function useDuplicateInvoice() {
  const repo = useInvoiceRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repo.duplicateInvoice(id),
    onSuccess: (newInvoice) => {
      // Add to cache
      queryClient.setQueryData(
        INVOICE_QUERY_KEYS.detail(newInvoice.id),
        newInvoice
      );
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: INVOICE_QUERY_KEYS.lists() });
    },
  });
}
