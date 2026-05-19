/**
 * Invoice Mock Data
 * 
 * In-memory database for invoice mock data.
 * Provides realistic seed data with various statuses and customers.
 */

import { daysAgo } from '@/mocks/utils/demoDate';
import type {
  Invoice,
  InvoiceCustomer,
  InvoiceLineItem,
} from '../../domain/models/Invoice';
import { calculateLineItemTotal } from '../../domain/models/Invoice';

// ============================================================================
// Mock Customers
// ============================================================================

const customers: InvoiceCustomer[] = [
  {
    id: 'cust-1',
    name: 'Acme Corporation',
    email: 'billing@acme.com',
    company: 'Acme Corporation',
    addressLine1: '123 Business Ave',
    addressLine2: 'Suite 500',
    city: 'San Francisco',
    country: 'United States',
    taxId: 'US-123456789',
  },
  {
    id: 'cust-2',
    name: 'TechStart Inc.',
    email: 'accounts@techstart.io',
    company: 'TechStart Inc.',
    addressLine1: '456 Innovation Blvd',
    city: 'Austin',
    country: 'United States',
    taxId: 'US-987654321',
  },
  {
    id: 'cust-3',
    name: 'Global Solutions Ltd',
    email: 'finance@globalsolutions.co.uk',
    company: 'Global Solutions Ltd',
    addressLine1: '10 Downing Street',
    city: 'London',
    country: 'United Kingdom',
    taxId: 'GB-112233445',
  },
  {
    id: 'cust-4',
    name: 'Marie Dubois',
    email: 'marie.dubois@email.fr',
    addressLine1: '25 Rue de la Paix',
    city: 'Paris',
    country: 'France',
  },
  {
    id: 'cust-5',
    name: 'Sunrise Digital Agency',
    email: 'invoices@sunrisedigital.com',
    company: 'Sunrise Digital Agency',
    addressLine1: '789 Creative Lane',
    city: 'Los Angeles',
    country: 'United States',
    taxId: 'US-555666777',
  },
  {
    id: 'cust-6',
    name: 'Nordic Innovations AB',
    email: 'billing@nordicinnovations.se',
    company: 'Nordic Innovations AB',
    addressLine1: 'Kungsgatan 44',
    city: 'Stockholm',
    country: 'Sweden',
    taxId: 'SE-998877665',
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

function createLineItem(
  id: string,
  description: string,
  quantity: number,
  unitPrice: number,
  discount?: number
): InvoiceLineItem {
  const item = { description, quantity, unitPrice, discount };
  return {
    id,
    description,
    quantity,
    unitPrice,
    discount,
    total: calculateLineItemTotal(item),
  };
}

function calculateTotals(lineItems: InvoiceLineItem[], taxRate: number) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  return { subtotal, taxAmount, total };
}

// ============================================================================
// Mock Invoices Database
// ============================================================================

export const invoicesDb: Invoice[] = [
  // Paid invoices
  {
    id: 'inv-001',
    number: 'INV-2024-0001',
    status: 'paid',
    issueDate: daysAgo(45),
    dueDate: daysAgo(15),
    customer: customers[0],
    currency: 'USD',
    lineItems: [
      createLineItem('li-001-1', 'Website Development - Phase 1', 1, 5000),
      createLineItem('li-001-2', 'UI/UX Design Services', 40, 150),
      createLineItem('li-001-3', 'Project Management', 20, 100),
    ],
    ...calculateTotals([
      createLineItem('li-001-1', 'Website Development - Phase 1', 1, 5000),
      createLineItem('li-001-2', 'UI/UX Design Services', 40, 150),
      createLineItem('li-001-3', 'Project Management', 20, 100),
    ], 10),
    taxRate: 10,
    notes: 'Thank you for your business!',
    terms: 'Payment due within 30 days.',
    createdAt: daysAgo(45),
    updatedAt: daysAgo(15),
  },
  {
    id: 'inv-002',
    number: 'INV-2024-0002',
    status: 'paid',
    issueDate: daysAgo(60),
    dueDate: daysAgo(30),
    customer: customers[1],
    currency: 'USD',
    lineItems: [
      createLineItem('li-002-1', 'Mobile App Development', 1, 15000),
      createLineItem('li-002-2', 'API Integration', 1, 3000),
    ],
    ...calculateTotals([
      createLineItem('li-002-1', 'Mobile App Development', 1, 15000),
      createLineItem('li-002-2', 'API Integration', 1, 3000),
    ], 8),
    taxRate: 8,
    notes: 'Project completed successfully.',
    createdAt: daysAgo(60),
    updatedAt: daysAgo(30),
  },

  // Sent invoices
  {
    id: 'inv-003',
    number: 'INV-2024-0003',
    status: 'sent',
    issueDate: daysAgo(10),
    dueDate: daysAgo(-20),
    customer: customers[2],
    currency: 'GBP',
    lineItems: [
      createLineItem('li-003-1', 'Consulting Services - Q4', 80, 125),
      createLineItem('li-003-2', 'Training Workshop', 2, 2500),
    ],
    ...calculateTotals([
      createLineItem('li-003-1', 'Consulting Services - Q4', 80, 125),
      createLineItem('li-003-2', 'Training Workshop', 2, 2500),
    ], 20),
    taxRate: 20,
    terms: 'Net 30',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },
  {
    id: 'inv-004',
    number: 'INV-2024-0004',
    status: 'sent',
    issueDate: daysAgo(5),
    dueDate: daysAgo(-25),
    customer: customers[4],
    currency: 'USD',
    lineItems: [
      createLineItem('li-004-1', 'Brand Identity Design', 1, 8500),
      createLineItem('li-004-2', 'Logo Design Package', 1, 2500),
      createLineItem('li-004-3', 'Brand Guidelines Document', 1, 1500),
    ],
    ...calculateTotals([
      createLineItem('li-004-1', 'Brand Identity Design', 1, 8500),
      createLineItem('li-004-2', 'Logo Design Package', 1, 2500),
      createLineItem('li-004-3', 'Brand Guidelines Document', 1, 1500),
    ], 9),
    taxRate: 9,
    notes: 'Final deliverables attached.',
    terms: 'Payment due within 30 days of invoice date.',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },

  // Overdue invoices
  {
    id: 'inv-005',
    number: 'INV-2024-0005',
    status: 'overdue',
    issueDate: daysAgo(50),
    dueDate: daysAgo(20),
    customer: customers[3],
    currency: 'EUR',
    lineItems: [
      createLineItem('li-005-1', 'Photography Services', 8, 350),
      createLineItem('li-005-2', 'Photo Editing & Retouching', 50, 45),
    ],
    ...calculateTotals([
      createLineItem('li-005-1', 'Photography Services', 8, 350),
      createLineItem('li-005-2', 'Photo Editing & Retouching', 50, 45),
    ], 20),
    taxRate: 20,
    notes: 'Please remit payment at your earliest convenience.',
    createdAt: daysAgo(50),
    updatedAt: daysAgo(20),
  },
  {
    id: 'inv-006',
    number: 'INV-2024-0006',
    status: 'overdue',
    issueDate: daysAgo(40),
    dueDate: daysAgo(10),
    customer: customers[5],
    currency: 'EUR',
    lineItems: [
      createLineItem('li-006-1', 'Software License - Annual', 1, 12000),
      createLineItem('li-006-2', 'Premium Support Package', 1, 3600),
      createLineItem('li-006-3', 'Implementation Services', 40, 175, 10),
    ],
    ...calculateTotals([
      createLineItem('li-006-1', 'Software License - Annual', 1, 12000),
      createLineItem('li-006-2', 'Premium Support Package', 1, 3600),
      createLineItem('li-006-3', 'Implementation Services', 40, 175, 10),
    ], 25),
    taxRate: 25,
    terms: 'Net 30. Late payments subject to 1.5% monthly interest.',
    createdAt: daysAgo(40),
    updatedAt: daysAgo(10),
  },

  // Draft invoices
  {
    id: 'inv-007',
    number: 'INV-2024-0007',
    status: 'draft',
    issueDate: daysAgo(0),
    dueDate: daysAgo(-30),
    customer: customers[0],
    currency: 'USD',
    lineItems: [
      createLineItem('li-007-1', 'Website Maintenance - Monthly', 1, 1500),
      createLineItem('li-007-2', 'Security Updates', 4, 200),
      createLineItem('li-007-3', 'Performance Optimization', 8, 125),
    ],
    ...calculateTotals([
      createLineItem('li-007-1', 'Website Maintenance - Monthly', 1, 1500),
      createLineItem('li-007-2', 'Security Updates', 4, 200),
      createLineItem('li-007-3', 'Performance Optimization', 8, 125),
    ], 10),
    taxRate: 10,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(0),
  },
  {
    id: 'inv-008',
    number: 'INV-2024-0008',
    status: 'draft',
    issueDate: daysAgo(0),
    dueDate: daysAgo(-30),
    customer: customers[1],
    currency: 'USD',
    lineItems: [
      createLineItem('li-008-1', 'App Feature Development', 1, 7500),
    ],
    ...calculateTotals([
      createLineItem('li-008-1', 'App Feature Development', 1, 7500),
    ], 8),
    taxRate: 8,
    notes: 'Pending client approval.',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(0),
  },

  // Cancelled invoice
  {
    id: 'inv-009',
    number: 'INV-2024-0009',
    status: 'cancelled',
    issueDate: daysAgo(30),
    dueDate: daysAgo(0),
    customer: customers[2],
    currency: 'GBP',
    lineItems: [
      createLineItem('li-009-1', 'Cancelled Project - Deposit', 1, 5000),
    ],
    ...calculateTotals([
      createLineItem('li-009-1', 'Cancelled Project - Deposit', 1, 5000),
    ], 20),
    taxRate: 20,
    notes: 'Project cancelled by client. Deposit refunded.',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(25),
  },

  // More paid invoices for variety
  {
    id: 'inv-010',
    number: 'INV-2024-0010',
    status: 'paid',
    issueDate: daysAgo(90),
    dueDate: daysAgo(60),
    customer: customers[4],
    currency: 'USD',
    lineItems: [
      createLineItem('li-010-1', 'Social Media Campaign', 1, 4500),
      createLineItem('li-010-2', 'Content Creation', 20, 150),
      createLineItem('li-010-3', 'Analytics & Reporting', 1, 800),
    ],
    ...calculateTotals([
      createLineItem('li-010-1', 'Social Media Campaign', 1, 4500),
      createLineItem('li-010-2', 'Content Creation', 20, 150),
      createLineItem('li-010-3', 'Analytics & Reporting', 1, 800),
    ], 9),
    taxRate: 9,
    notes: 'Campaign completed with excellent results!',
    createdAt: daysAgo(90),
    updatedAt: daysAgo(60),
  },
];

// ============================================================================
// Database Operations
// ============================================================================

let invoiceCounter = 11;

export function getInvoiceById(id: string): Invoice | undefined {
  return invoicesDb.find(inv => inv.id === id);
}

export function createInvoiceInDb(invoice: Omit<Invoice, 'id' | 'number' | 'createdAt' | 'updatedAt'>): Invoice {
  const now = new Date().toISOString();
  const newInvoice: Invoice = {
    ...invoice,
    id: `inv-${String(invoiceCounter++).padStart(3, '0')}`,
    number: `INV-${new Date().getFullYear()}-${String(invoiceCounter).padStart(4, '0')}`,
    createdAt: now,
    updatedAt: now,
  };
  invoicesDb.push(newInvoice);
  return newInvoice;
}

export function updateInvoiceInDb(id: string, updates: Partial<Invoice>): Invoice | undefined {
  const index = invoicesDb.findIndex(inv => inv.id === id);
  if (index === -1) return undefined;

  invoicesDb[index] = {
    ...invoicesDb[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return invoicesDb[index];
}

export function deleteInvoiceFromDb(id: string): boolean {
  const index = invoicesDb.findIndex(inv => inv.id === id);
  if (index === -1) return false;
  invoicesDb.splice(index, 1);
  return true;
}

export function duplicateInvoiceInDb(id: string): Invoice | undefined {
  const original = getInvoiceById(id);
  if (!original) return undefined;

  const now = new Date().toISOString();
  const duplicated: Invoice = {
    ...original,
    id: `inv-${String(invoiceCounter++).padStart(3, '0')}`,
    number: `INV-${new Date().getFullYear()}-${String(invoiceCounter).padStart(4, '0')}`,
    status: 'draft',
    issueDate: now.split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: now,
    updatedAt: now,
    lineItems: original.lineItems.map((item, idx) => ({
      ...item,
      id: `li-${Date.now()}-${idx}`,
    })),
  };
  invoicesDb.push(duplicated);
  return duplicated;
}
