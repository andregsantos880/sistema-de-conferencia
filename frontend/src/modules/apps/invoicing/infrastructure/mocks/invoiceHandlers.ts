/**
 * Invoice MSW Handlers
 * 
 * Mock Service Worker handlers for the Invoicing module.
 * Implements all CRUD operations with realistic behavior.
 */

import { http, delay } from 'msw';
import { ok, fail } from '@/mocks/utils/apiResponse';
import { api } from '@/mocks/utils/apiPath';
import {
  invoicesDb,
  getInvoiceById,
  createInvoiceInDb,
  updateInvoiceInDb,
  deleteInvoiceFromDb,
  duplicateInvoiceInDb,
} from './invoiceData';
import type {
  Invoice,
  InvoiceListItem,
  InvoiceListResponse,
  InvoiceStatus,
  CreateInvoiceDto,
  UpdateInvoiceDto,
} from '../../domain/models/Invoice';
import { calculateLineItemTotal } from '../../domain/models/Invoice';

// ============================================================================
// Helper Functions
// ============================================================================

function toListItem(invoice: Invoice): InvoiceListItem {
  return {
    id: invoice.id,
    number: invoice.number,
    status: invoice.status,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    customerName: invoice.customer.name,
    customerEmail: invoice.customer.email,
    currency: invoice.currency,
    total: invoice.total,
    createdAt: invoice.createdAt,
  };
}

function filterAndSortInvoices(params: URLSearchParams): InvoiceListResponse {
  const search = (params.get('search') || '').toLowerCase();
  const status = params.get('status') as InvoiceStatus | 'all' | null;
  const dateFrom = params.get('dateFrom');
  const dateTo = params.get('dateTo');
  const page = parseInt(params.get('page') || '1', 10);
  const pageSize = parseInt(params.get('pageSize') || '10', 10);
  const sortBy = params.get('sortBy') || 'issueDate';
  const sortOrder = params.get('sortOrder') || 'desc';

  const filtered = invoicesDb.filter(inv => {
    // Search filter
    const matchesSearch = !search ||
      inv.number.toLowerCase().includes(search) ||
      inv.customer.name.toLowerCase().includes(search) ||
      inv.customer.email.toLowerCase().includes(search);

    // Status filter
    const matchesStatus = !status || status === 'all' || inv.status === status;

    // Date range filter
    let matchesDateRange = true;
    if (dateFrom) {
      matchesDateRange = matchesDateRange && inv.issueDate >= dateFrom;
    }
    if (dateTo) {
      matchesDateRange = matchesDateRange && inv.issueDate <= dateTo;
    }

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Sort
  filtered.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'issueDate':
        comparison = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
        break;
      case 'dueDate':
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      case 'total':
        comparison = a.total - b.total;
        break;
      case 'number':
        comparison = a.number.localeCompare(b.number);
        break;
      default:
        comparison = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Paginate
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

  return {
    items: paginatedItems.map(toListItem),
    total,
    page,
    pageSize,
    totalPages,
  };
}

// ============================================================================
// MSW Handlers
// ============================================================================

export const invoiceHandlers = [
  // GET invoices - List invoices with filters
  http.get(api('/invoices'), async ({ request }) => {
    await delay(400);
    const url = new URL(request.url);
    const response = filterAndSortInvoices(url.searchParams);
    return ok(response);
  }),

  // GET invoices/:id - Get single invoice
  http.get(api('/invoices/:id'), async ({ params }) => {
    await delay(300);
    const { id } = params;
    const invoice = getInvoiceById(id as string);

    if (!invoice) {
      return fail('INVOICE_NOT_FOUND', 'Invoice not found', 404);
    }

    return ok(invoice);
  }),

  // POST invoices - Create invoice
  http.post(api('/invoices'), async ({ request }) => {
    await delay(500);
    const dto = await request.json() as CreateInvoiceDto;

    // Validate required fields
    if (!dto.customer?.name || !dto.customer?.email) {
      return fail('VALIDATION_ERROR', 'Customer name and email are required', 400);
    }

    if (!dto.lineItems || dto.lineItems.length === 0) {
      return fail('VALIDATION_ERROR', 'At least one line item is required', 400);
    }

    // Build line items with calculated totals
    const lineItems = dto.lineItems.map((item, idx) => ({
      id: `li-${Date.now()}-${idx}`,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount,
      total: calculateLineItemTotal(item),
    }));

    // Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * (dto.taxRate / 100);
    const total = subtotal + taxAmount;

    const newInvoice = createInvoiceInDb({
      status: 'draft',
      issueDate: dto.issueDate,
      dueDate: dto.dueDate,
      customer: {
        id: `cust-${Date.now()}`,
        ...dto.customer,
      },
      currency: dto.currency,
      taxRate: dto.taxRate,
      subtotal,
      taxAmount,
      total,
      lineItems,
      notes: dto.notes,
      terms: dto.terms,
    });

    return ok(newInvoice, 201);
  }),

  // PUT invoices/:id - Update invoice
  http.put(api('/invoices/:id'), async ({ params, request }) => {
    await delay(400);
    const { id } = params;
    const dto = await request.json() as UpdateInvoiceDto;

    const existing = getInvoiceById(id as string);
    if (!existing) {
      return fail('INVOICE_NOT_FOUND', 'Invoice not found', 404);
    }

    // Build updates
    const updates: Partial<Invoice> = {};

    if (dto.customer) {
      updates.customer = { ...existing.customer, ...dto.customer };
    }
    if (dto.issueDate) updates.issueDate = dto.issueDate;
    if (dto.dueDate) updates.dueDate = dto.dueDate;
    if (dto.currency) updates.currency = dto.currency;
    if (dto.notes !== undefined) updates.notes = dto.notes;
    if (dto.terms !== undefined) updates.terms = dto.terms;
    if (dto.status) updates.status = dto.status;

    // Recalculate totals if line items or tax rate changed
    if (dto.lineItems || dto.taxRate !== undefined) {
      const taxRate = dto.taxRate ?? existing.taxRate;
      const lineItems = dto.lineItems
        ? dto.lineItems.map((item, idx) => ({
            id: `li-${Date.now()}-${idx}`,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            total: calculateLineItemTotal(item),
          }))
        : existing.lineItems;

      const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      updates.lineItems = lineItems;
      updates.taxRate = taxRate;
      updates.subtotal = subtotal;
      updates.taxAmount = taxAmount;
      updates.total = total;
    }

    const updated = updateInvoiceInDb(id as string, updates);
    if (!updated) {
      return fail('UPDATE_FAILED', 'Failed to update invoice', 500);
    }

    return ok(updated);
  }),

  // DELETE invoices/:id - Delete invoice
  http.delete(api('/invoices/:id'), async ({ params }) => {
    await delay(300);
    const { id } = params;

    const existing = getInvoiceById(id as string);
    if (!existing) {
      return fail('INVOICE_NOT_FOUND', 'Invoice not found', 404);
    }

    // Only allow deleting draft or cancelled invoices
    if (existing.status !== 'draft' && existing.status !== 'cancelled') {
      return fail('DELETE_NOT_ALLOWED', 'Only draft or cancelled invoices can be deleted', 400);
    }

    const deleted = deleteInvoiceFromDb(id as string);
    if (!deleted) {
      return fail('DELETE_FAILED', 'Failed to delete invoice', 500);
    }

    return ok({ success: true });
  }),

  // POST invoices/:id/mark-paid - Mark invoice as paid
  http.post(api('/invoices/:id/mark-paid'), async ({ params }) => {
    await delay(300);
    const { id } = params;

    const existing = getInvoiceById(id as string);
    if (!existing) {
      return fail('INVOICE_NOT_FOUND', 'Invoice not found', 404);
    }

    if (existing.status === 'paid') {
      return fail('ALREADY_PAID', 'Invoice is already marked as paid', 400);
    }

    if (existing.status === 'cancelled') {
      return fail('INVALID_STATUS', 'Cannot mark a cancelled invoice as paid', 400);
    }

    const updated = updateInvoiceInDb(id as string, { status: 'paid' });
    if (!updated) {
      return fail('UPDATE_FAILED', 'Failed to update invoice status', 500);
    }

    return ok(updated);
  }),

  // POST invoices/:id/mark-sent - Mark invoice as sent
  http.post(api('/invoices/:id/mark-sent'), async ({ params }) => {
    await delay(300);
    const { id } = params;

    const existing = getInvoiceById(id as string);
    if (!existing) {
      return fail('INVOICE_NOT_FOUND', 'Invoice not found', 404);
    }

    if (existing.status !== 'draft') {
      return fail('INVALID_STATUS', 'Only draft invoices can be marked as sent', 400);
    }

    const updated = updateInvoiceInDb(id as string, { status: 'sent' });
    if (!updated) {
      return fail('UPDATE_FAILED', 'Failed to update invoice status', 500);
    }

    return ok(updated);
  }),

  // POST invoices/:id/duplicate - Duplicate invoice
  http.post(api('/invoices/:id/duplicate'), async ({ params }) => {
    await delay(400);
    const { id } = params;

    const duplicated = duplicateInvoiceInDb(id as string);
    if (!duplicated) {
      return fail('INVOICE_NOT_FOUND', 'Invoice not found', 404);
    }

    return ok(duplicated, 201);
  }),
];
