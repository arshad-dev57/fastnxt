import type { AuditLog, ClinicInvoice, InvoiceStatus } from './types';

export const INVOICE_STATUSES: InvoiceStatus[] = [
  'Draft',
  'Unpaid',
  'Partially Paid',
  'Paid',
  'Overdue',
  'Cancelled',
];

export function recalcInvoiceTotals(
  items: ClinicInvoice['items'],
  discount: number,
  taxPercent: number
) {
  const normalized = items.map((i) => ({
    ...i,
    amount: i.qty * i.unitPrice,
  }));
  const subtotal = normalized.reduce((s, i) => s + i.amount, 0);
  const afterDiscount = Math.max(0, subtotal - discount);
  const tax = Math.round(afterDiscount * (taxPercent / 100));
  const total = afterDiscount + tax;
  return { items: normalized, subtotal, tax, total };
}

export function deriveInvoiceStatus(
  total: number,
  paidAmount: number,
  dueDate: string,
  explicit: InvoiceStatus
): InvoiceStatus {
  if (explicit === 'Cancelled' || explicit === 'Draft') return explicit;
  if (paidAmount >= total && total > 0) return 'Paid';
  if (paidAmount > 0) return 'Partially Paid';
  const today = new Date().toISOString().slice(0, 10);
  if (dueDate < today) return 'Overdue';
  return explicit === 'Overdue' ? 'Overdue' : 'Unpaid';
}

export function nextInvoiceNumber(existing: ClinicInvoice[]): string {
  const year = new Date().getFullYear();
  const nums = existing
    .map((i) => {
      const m = i.invoiceNumber.match(/INV-\d+-(\d+)/);
      return m ? Number(m[1]) : 0;
    })
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `INV-${year}-${String(next).padStart(3, '0')}`;
}

export function makeAuditEntry(
  existing: AuditLog[],
  entry: Omit<AuditLog, 'id' | 'datetime' | 'ip'> & { datetime?: string; ip?: string }
): AuditLog {
  const nums = existing.map((e) => Number(String(e.id).replace(/\D/g, ''))).filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return {
    ...entry,
    id: `AL-${String(next).padStart(3, '0')}`,
    datetime: entry.datetime ?? new Date().toISOString(),
    ip: entry.ip ?? '127.0.0.1',
  };
}
