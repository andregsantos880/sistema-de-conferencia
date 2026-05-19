/**
 * Invoicing Module Routes
 */

export const INVOICING_PATHS = {
  ROOT: '/invoices',
  DETAIL: (id: string) => `/invoices/${id}`,
  NEW: '/invoices/new',
  EDIT: (id: string) => `/invoices/${id}/edit`,
} as const;
