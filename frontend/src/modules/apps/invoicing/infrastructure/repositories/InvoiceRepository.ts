/**
 * InvoiceRepository - HTTP abstraction layer for invoice API calls
 * 
 * This repository encapsulates all HTTP communication with the invoice API.
 * It extends BaseRepository which provides:
 * - Automatic response unwrapping
 * - Consistent error handling
 * - HTTP method helpers
 */

import { injectable, inject } from 'inversify';
import { CORE_SYMBOLS } from '@/core/di/symbols';
import type { IHttpClient } from '@/shared/infrastructure/http/HttpClient';
import { BaseRepository } from '@/shared/infrastructure/repositories';
import type {
  Invoice,
  InvoiceListResponse,
  InvoiceFilters,
  CreateInvoiceDto,
  UpdateInvoiceDto,
} from '../../domain/models/Invoice';

export interface IInvoiceRepository {
  getInvoices(filters?: InvoiceFilters): Promise<InvoiceListResponse>;
  getInvoiceById(id: string): Promise<Invoice>;
  createInvoice(dto: CreateInvoiceDto): Promise<Invoice>;
  updateInvoice(id: string, dto: UpdateInvoiceDto): Promise<Invoice>;
  deleteInvoice(id: string): Promise<void>;
  markAsPaid(id: string): Promise<Invoice>;
  markAsSent(id: string): Promise<Invoice>;
  duplicateInvoice(id: string): Promise<Invoice>;
}

@injectable()
export class InvoiceRepository extends BaseRepository implements IInvoiceRepository {
  private readonly baseUrl = '/invoices';

  constructor(@inject(CORE_SYMBOLS.IHttpClient) http: IHttpClient) {
    super(http);
  }

  // ============================================================================
  // Invoice Operations
  // ============================================================================

  async getInvoices(filters?: InvoiceFilters): Promise<InvoiceListResponse> {
    const queryString = this.buildQueryString({
      search: filters?.search,
      status: filters?.status,
      dateFrom: filters?.dateFrom,
      dateTo: filters?.dateTo,
      page: filters?.page,
      pageSize: filters?.pageSize,
      sortBy: filters?.sortBy,
      sortOrder: filters?.sortOrder,
    });
    const url = this.appendQuery(this.baseUrl, queryString);
    return this.get<InvoiceListResponse>(url, 'Failed to fetch invoices');
  }

  async getInvoiceById(id: string): Promise<Invoice> {
    return this.get<Invoice>(
      `${this.baseUrl}/${id}`,
      'Failed to fetch invoice'
    );
  }

  async createInvoice(dto: CreateInvoiceDto): Promise<Invoice> {
    return this.post<Invoice, CreateInvoiceDto>(
      this.baseUrl,
      dto,
      'Failed to create invoice'
    );
  }

  async updateInvoice(id: string, dto: UpdateInvoiceDto): Promise<Invoice> {
    return this.put<Invoice, UpdateInvoiceDto>(
      `${this.baseUrl}/${id}`,
      dto,
      'Failed to update invoice'
    );
  }

  async deleteInvoice(id: string): Promise<void> {
    return this.delete<void>(
      `${this.baseUrl}/${id}`,
      'Failed to delete invoice'
    );
  }

  async markAsPaid(id: string): Promise<Invoice> {
    return this.post<Invoice>(
      `${this.baseUrl}/${id}/mark-paid`,
      undefined,
      'Failed to mark invoice as paid'
    );
  }

  async markAsSent(id: string): Promise<Invoice> {
    return this.post<Invoice>(
      `${this.baseUrl}/${id}/mark-sent`,
      undefined,
      'Failed to mark invoice as sent'
    );
  }

  async duplicateInvoice(id: string): Promise<Invoice> {
    return this.post<Invoice>(
      `${this.baseUrl}/${id}/duplicate`,
      undefined,
      'Failed to duplicate invoice'
    );
  }
}
