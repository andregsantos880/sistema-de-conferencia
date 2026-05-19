/**
 * Invoice Domain Models
 * 
 * Core types for the Invoicing feature including invoices, line items,
 * customers, and related DTOs.
 */

// ============================================================================
// Status Types
// ============================================================================

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

// ============================================================================
// Line Item
// ============================================================================

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number; // percentage (0–100)
  total: number; // computed: quantity * unitPrice * (1 - discount/100)
}

export interface CreateLineItemDto {
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export interface UpdateLineItemDto {
  id: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  discount?: number;
}

// ============================================================================
// Customer
// ============================================================================

export interface InvoiceCustomer {
  id: string;
  name: string;
  email: string;
  company?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  country?: string;
  taxId?: string;
}

export interface CreateCustomerDto {
  name: string;
  email: string;
  company?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  country?: string;
  taxId?: string;
}

// ============================================================================
// Invoice
// ============================================================================

export interface Invoice {
  id: string;
  number: string;
  status: InvoiceStatus;

  issueDate: string; // ISO string
  dueDate: string;   // ISO string

  customer: InvoiceCustomer;

  currency: string; // e.g. 'USD', 'EUR'
  subtotal: number;
  taxRate: number; // percentage (0-100)
  taxAmount: number;
  total: number;

  lineItems: InvoiceLineItem[];

  notes?: string;
  terms?: string;

  createdAt: string; // ISO
  updatedAt: string; // ISO
}

// ============================================================================
// List Item (for table view)
// ============================================================================

export interface InvoiceListItem {
  id: string;
  number: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  customerName: string;
  customerEmail: string;
  currency: string;
  total: number;
  createdAt: string;
}

// ============================================================================
// DTOs
// ============================================================================

export interface CreateInvoiceDto {
  customer: CreateCustomerDto;
  issueDate: string;
  dueDate: string;
  currency: string;
  taxRate: number;
  lineItems: CreateLineItemDto[];
  notes?: string;
  terms?: string;
}

export interface UpdateInvoiceDto {
  customer?: Partial<CreateCustomerDto>;
  issueDate?: string;
  dueDate?: string;
  currency?: string;
  taxRate?: number;
  lineItems?: CreateLineItemDto[];
  notes?: string;
  terms?: string;
  status?: InvoiceStatus;
}

export interface InvoiceFilters {
  search?: string;
  status?: InvoiceStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'issueDate' | 'dueDate' | 'total' | 'number';
  sortOrder?: 'asc' | 'desc';
}

export interface InvoiceListResponse {
  items: InvoiceListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Status Configuration
// ============================================================================

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { 
  label: string; 
  color: string;
  bgColor: string;
  textColor: string;
}> = {
  draft: { 
    label: 'Draft', 
    color: 'bg-slate-500',
    bgColor: 'bg-slate-100 dark:bg-slate-900',
    textColor: 'text-slate-700 dark:text-slate-300',
  },
  sent: { 
    label: 'Sent', 
    color: 'bg-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900',
    textColor: 'text-blue-700 dark:text-blue-300',
  },
  paid: { 
    label: 'Paid', 
    color: 'bg-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900',
    textColor: 'text-green-700 dark:text-green-300',
  },
  overdue: { 
    label: 'Overdue', 
    color: 'bg-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900',
    textColor: 'text-red-700 dark:text-red-300',
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-gray-500',
    bgColor: 'bg-gray-100 dark:bg-gray-900',
    textColor: 'text-gray-700 dark:text-gray-300',
  },
};

// ============================================================================
// Currency Configuration
// ============================================================================

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
] as const;

export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number]['code'];

// ============================================================================
// Utility Functions
// ============================================================================

export function calculateLineItemTotal(item: CreateLineItemDto): number {
  const discount = item.discount ?? 0;
  return item.quantity * item.unitPrice * (1 - discount / 100);
}

export function calculateInvoiceTotals(
  lineItems: CreateLineItemDto[],
  taxRate: number
): { subtotal: number; taxAmount: number; total: number } {
  const subtotal = lineItems.reduce((sum, item) => sum + calculateLineItemTotal(item), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  return { subtotal, taxAmount, total };
}

export function formatCurrency(amount: number, currency: string): string {
  const currencyConfig = SUPPORTED_CURRENCIES.find(c => c.code === currency);
  const symbol = currencyConfig?.symbol ?? currency;
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}-${random}`;
}
