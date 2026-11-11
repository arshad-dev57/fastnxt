'use client';

export const dynamic = 'force-dynamic';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Receipt,
  Plus,
  Download,
  Eye,
  Banknote,
  Percent,
  ArrowUpDown,
} from 'lucide-react';
import {
  ClinicPage,
  ClinicMockBanner,
  ClinicPageHeader,
  ClinicStatCard,
  ClinicCard,
  ClinicTable,
  ClinicTableHeader,
  ClinicTableBody,
  ClinicTableRow,
  ClinicTableCell,
  ClinicSearchInput,
  ClinicSelect,
  ClinicButton,
  ClinicModal,
  ClinicPagination,
  ClinicEmptyState,
  ClinicField,
  clinicInputClass,
  ClinicStatusBadge,
  ClinicAvatar,
} from '../ui';
import {
  useClinicStore,
  fullPatientName,
  patientById,
  nextId,
} from '../_lib/store';
import { formatDate, formatPkr, todayIso, addDaysIso } from '../_lib/format';
import {
  deriveInvoiceStatus,
  INVOICE_STATUSES,
  makeAuditEntry,
  nextInvoiceNumber,
  recalcInvoiceTotals,
} from '../_lib/billing';
import type { ClinicInvoice } from '../_lib/types';
import type { PaymentMethod } from '../_lib/types';

const PAGE_SIZE = 10;
type SortKey = 'date' | 'total' | 'outstanding' | 'status' | 'number';

export default function ClinicInvoicesPage() {
  const store = useClinicStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [formPatientId, setFormPatientId] = useState('');
  const [formItems, setFormItems] = useState([
    { description: '', qty: 1, unitPrice: 0, amount: 0 },
  ]);
  const [formDiscount, setFormDiscount] = useState(0);
  const [formNotes, setFormNotes] = useState('');

  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Cash');
  const [payRef, setPayRef] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');

  const stats = useMemo(() => {
    const outstanding = store.invoices.reduce((s, i) => s + i.outstanding, 0);
    const paid = store.invoices.reduce((s, i) => s + i.paidAmount, 0);
    const overdue = store.invoices.filter((i) => i.status === 'Overdue').length;
    const draft = store.invoices.filter((i) => i.status === 'Draft').length;
    return { outstanding, paid, overdue, draft, count: store.invoices.length };
  }, [store.invoices]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = store.invoices.filter((inv) => {
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
      const p = patientById(inv.patientId, store.patients);
      const name = fullPatientName(p).toLowerCase();
      if (!q) return true;
      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        name.includes(q) ||
        inv.id.toLowerCase().includes(q)
      );
    });
    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') cmp = a.date.localeCompare(b.date);
      else if (sortKey === 'total') cmp = a.total - b.total;
      else if (sortKey === 'outstanding') cmp = a.outstanding - b.outstanding;
      else if (sortKey === 'number') cmp = a.invoiceNumber.localeCompare(b.invoiceNumber);
      else cmp = a.status.localeCompare(b.status);
      return sortAsc ? cmp : -cmp;
    });
    return rows;
  }, [store.invoices, store.patients, search, statusFilter, sortKey, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const activeInvoice = activeId ? store.invoices.find((i) => i.id === activeId) : null;

  const openPay = (id: string) => {
    const inv = store.invoices.find((i) => i.id === id);
    setActiveId(id);
    setPayAmount(String(inv?.outstanding ?? 0));
    setPayMethod('Cash');
    setPayRef('');
    setPayOpen(true);
  };

  const openDiscount = (id: string) => {
    const inv = store.invoices.find((i) => i.id === id);
    setActiveId(id);
    setDiscountAmount(String(inv?.discount ?? 0));
    setDiscountOpen(true);
  };

  const saveCreate = () => {
    if (!formPatientId) {
      toast.error('Select a patient');
      return;
    }
    const validItems = formItems.filter((i) => i.description.trim() && i.unitPrice > 0);
    if (!validItems.length) {
      toast.error('Add at least one line item');
      return;
    }
    const { items, subtotal, tax, total } = recalcInvoiceTotals(
      validItems,
      formDiscount,
      store.settings.taxPercent
    );
    const id = nextId('INV', store.invoices);
    const inv: ClinicInvoice = {
      id,
      invoiceNumber: nextInvoiceNumber(store.invoices),
      patientId: formPatientId,
      date: todayIso(),
      dueDate: addDaysIso(todayIso(), 14),
      items,
      subtotal,
      discount: formDiscount,
      tax,
      total,
      paidAmount: 0,
      outstanding: total,
      status: 'Unpaid',
      notes: formNotes || undefined,
    };
    store.update((prev) => ({
      ...prev,
      invoices: [inv, ...prev.invoices],
      auditLogs: [
        makeAuditEntry(prev.auditLogs, {
          user: 'Billing Desk',
          action: 'Create',
          module: 'Billing',
          recordRef: id,
          description: `Created invoice ${inv.invoiceNumber}`,
        }),
        ...prev.auditLogs,
      ],
    }));
    toast.success('Invoice created');
    setCreateOpen(false);
    setFormPatientId('');
    setFormItems([{ description: '', qty: 1, unitPrice: 0, amount: 0 }]);
    setFormDiscount(0);
    setFormNotes('');
  };

  const savePayment = () => {
    if (!activeInvoice) return;
    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (amount > activeInvoice.outstanding) {
      toast.error('Amount exceeds outstanding balance');
      return;
    }
    const paidAmount = activeInvoice.paidAmount + amount;
    const outstanding = Math.max(0, activeInvoice.total - paidAmount);
    const status = deriveInvoiceStatus(
      activeInvoice.total,
      paidAmount,
      activeInvoice.dueDate,
      activeInvoice.status
    );
    const payId = nextId('PAY', store.payments);
    store.update((prev) => ({
      ...prev,
      invoices: prev.invoices.map((i) =>
        i.id === activeInvoice.id ? { ...i, paidAmount, outstanding, status } : i
      ),
      payments: [
        {
          id: payId,
          patientId: activeInvoice.patientId,
          invoiceId: activeInvoice.id,
          date: todayIso(),
          amount,
          method: payMethod,
          reference: payRef || undefined,
          receivedBy: 'Billing Desk',
          status: 'Completed',
        },
        ...prev.payments,
      ],
      auditLogs: [
        makeAuditEntry(prev.auditLogs, {
          user: 'Billing Desk',
          action: 'Payment',
          module: 'Payments',
          recordRef: payId,
          description: `Collected ${formatPkr(amount)} on ${activeInvoice.invoiceNumber}`,
        }),
        ...prev.auditLogs,
      ],
    }));
    toast.success('Payment recorded');
    setPayOpen(false);
  };

  const saveDiscount = () => {
    if (!activeInvoice) return;
    const discount = Number(discountAmount) || 0;
    const { items, subtotal, tax, total } = recalcInvoiceTotals(
      activeInvoice.items,
      discount,
      store.settings.taxPercent
    );
    const outstanding = Math.max(0, total - activeInvoice.paidAmount);
    const status = deriveInvoiceStatus(
      total,
      activeInvoice.paidAmount,
      activeInvoice.dueDate,
      activeInvoice.status
    );
    store.update((prev) => ({
      ...prev,
      invoices: prev.invoices.map((i) =>
        i.id === activeInvoice.id
          ? { ...i, items, subtotal, discount, tax, total, outstanding, status }
          : i
      ),
    }));
    toast.success('Discount applied');
    setDiscountOpen(false);
  };

  const previewTotals = useMemo(() => {
    const valid = formItems.filter((i) => i.qty > 0);
    if (!valid.length) return { subtotal: 0, tax: 0, total: 0 };
    return recalcInvoiceTotals(valid, formDiscount, store.settings.taxPercent);
  }, [formItems, formDiscount, store.settings.taxPercent]);

  return (
    <ClinicPage>
      <ClinicMockBanner />
      <ClinicPageHeader
        title="Invoices & Billing"
        subtitle="Create invoices, collect payments, and track outstanding balances in PKR."
        icon={<Receipt className="w-5 h-5 text-white" />}
        actions={
          <>
            <ClinicButton variant="secondary" onClick={() => toast.success('Invoice export queued (demo)')}>
              <Download className="w-3.5 h-3.5" /> Export
            </ClinicButton>
            <ClinicButton onClick={() => setCreateOpen(true)}>
              <Plus className="w-3.5 h-3.5" /> New invoice
            </ClinicButton>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <ClinicStatCard label="Total invoices" value={stats.count} icon={Receipt} hint="All billing records" />
        <ClinicStatCard label="Collected" value={formatPkr(stats.paid)} icon={Banknote} color="#059669" />
        <ClinicStatCard label="Outstanding" value={formatPkr(stats.outstanding)} icon={Percent} color="#d97706" />
        <ClinicStatCard label="Overdue" value={stats.overdue} icon={Receipt} color="#dc2626" hint={`${stats.draft} drafts`} />
      </div>

      <ClinicCard
        title="Invoice register"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <ClinicSearchInput value={search} onChange={setSearch} placeholder="Search invoice or patient…" />
            <ClinicSelect
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All statuses' },
                ...INVOICE_STATUSES.map((s) => ({ value: s, label: s })),
              ]}
            />
          </div>
        }
      >
        <ClinicTable>
          <ClinicTableHeader
            columns={[
              'Invoice #',
              'Patient',
              'Date',
              'Due',
              'Amount',
              'Paid',
              'Outstanding',
              'Status',
              'Actions',
            ]}
          />
          <ClinicTableBody>
            {pageRows.map((inv) => {
              const p = patientById(inv.patientId, store.patients);
              return (
                <ClinicTableRow key={inv.id}>
                  <ClinicTableCell className="font-semibold text-teal-800">{inv.invoiceNumber}</ClinicTableCell>
                  <ClinicTableCell>
                    <div className="flex items-center gap-2">
                      <ClinicAvatar name={fullPatientName(p)} color={p?.avatarColor} size="sm" />
                      <span>{fullPatientName(p)}</span>
                    </div>
                  </ClinicTableCell>
                  <ClinicTableCell>
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('date')}>
                      {formatDate(inv.date)} <ArrowUpDown className="w-3 h-3 opacity-40" />
                    </button>
                  </ClinicTableCell>
                  <ClinicTableCell>{formatDate(inv.dueDate)}</ClinicTableCell>
                  <ClinicTableCell className="font-semibold">{formatPkr(inv.total)}</ClinicTableCell>
                  <ClinicTableCell>{formatPkr(inv.paidAmount)}</ClinicTableCell>
                  <ClinicTableCell className="font-semibold text-amber-700">{formatPkr(inv.outstanding)}</ClinicTableCell>
                  <ClinicTableCell>
                    <ClinicStatusBadge status={inv.status} />
                  </ClinicTableCell>
                  <ClinicTableCell>
                    <div className="flex flex-wrap gap-1">
                      <Link href={`/clinic/invoices/${inv.id}`}>
                        <ClinicButton variant="ghost" className="!px-2 !py-1">
                          <Eye className="w-3.5 h-3.5" />
                        </ClinicButton>
                      </Link>
                      {inv.outstanding > 0 && inv.status !== 'Cancelled' && (
                        <ClinicButton variant="ghost" className="!px-2 !py-1" onClick={() => openPay(inv.id)}>
                          <Banknote className="w-3.5 h-3.5" />
                        </ClinicButton>
                      )}
                      {inv.status !== 'Cancelled' && inv.status !== 'Paid' && (
                        <ClinicButton variant="ghost" className="!px-2 !py-1" onClick={() => openDiscount(inv.id)}>
                          <Percent className="w-3.5 h-3.5" />
                        </ClinicButton>
                      )}
                    </div>
                  </ClinicTableCell>
                </ClinicTableRow>
              );
            })}
          </ClinicTableBody>
        </ClinicTable>
        {!pageRows.length && (
          <ClinicEmptyState title="No invoices match your filters" description="Create a new invoice or adjust filters." />
        )}
        <ClinicPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </ClinicCard>

      <ClinicModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create invoice"
        maxWidth="max-w-3xl"
        actions={
          <>
            <ClinicButton variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </ClinicButton>
            <ClinicButton onClick={saveCreate}>Save invoice</ClinicButton>
          </>
        }
      >
        <ClinicField label="Patient" required>
          <select
            className={clinicInputClass()}
            value={formPatientId}
            onChange={(e) => setFormPatientId(e.target.value)}
          >
            <option value="">Select patient…</option>
            {store.patients.map((p) => (
              <option key={p.id} value={p.id}>
                {fullPatientName(p)} ({p.id})
              </option>
            ))}
          </select>
        </ClinicField>
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-600">Line items</p>
          {formItems.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                <input
                  className={clinicInputClass()}
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => {
                    const next = [...formItems];
                    next[idx] = { ...next[idx], description: e.target.value };
                    setFormItems(next);
                  }}
                />
              </div>
              <input
                type="number"
                min={1}
                className={`${clinicInputClass()} col-span-2`}
                value={item.qty}
                onChange={(e) => {
                  const next = [...formItems];
                  next[idx] = { ...next[idx], qty: Number(e.target.value) || 1 };
                  setFormItems(next);
                }}
              />
              <input
                type="number"
                min={0}
                className={`${clinicInputClass()} col-span-3`}
                placeholder="Unit PKR"
                value={item.unitPrice || ''}
                onChange={(e) => {
                  const next = [...formItems];
                  next[idx] = { ...next[idx], unitPrice: Number(e.target.value) || 0 };
                  setFormItems(next);
                }}
              />
              <ClinicButton
                variant="ghost"
                className="col-span-2"
                onClick={() => setFormItems(formItems.filter((_, i) => i !== idx))}
                disabled={formItems.length === 1}
              >
                Remove
              </ClinicButton>
            </div>
          ))}
          <ClinicButton
            variant="secondary"
            onClick={() =>
              setFormItems([...formItems, { description: '', qty: 1, unitPrice: 0, amount: 0 }])
            }
          >
            <Plus className="w-3.5 h-3.5" /> Add line
          </ClinicButton>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ClinicField label={`Discount (PKR)`}>
            <input
              type="number"
              className={clinicInputClass()}
              value={formDiscount}
              onChange={(e) => setFormDiscount(Number(e.target.value) || 0)}
            />
          </ClinicField>
          <ClinicField label={`Tax (${store.settings.taxPercent}%)`}>
            <input className={clinicInputClass()} disabled value={formatPkr(previewTotals.tax)} />
          </ClinicField>
        </div>
        <div className="rounded-xl bg-teal-50 border border-teal-100 p-4 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold">{formatPkr(previewTotals.subtotal)}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Total payable</span>
            <span className="font-extrabold text-teal-800">{formatPkr(previewTotals.total)}</span>
          </div>
        </div>
        <ClinicField label="Notes">
          <textarea className={clinicInputClass()} rows={2} value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
        </ClinicField>
      </ClinicModal>

      <ClinicModal
        isOpen={payOpen}
        onClose={() => setPayOpen(false)}
        title="Collect payment"
        actions={
          <>
            <ClinicButton variant="secondary" onClick={() => setPayOpen(false)}>
              Cancel
            </ClinicButton>
            <ClinicButton onClick={savePayment}>Record payment</ClinicButton>
          </>
        }
      >
        {activeInvoice && (
          <p className="text-sm text-slate-600">
            Outstanding on <strong>{activeInvoice.invoiceNumber}</strong>:{' '}
            <strong className="text-teal-700">{formatPkr(activeInvoice.outstanding)}</strong>
          </p>
        )}
        <ClinicField label="Amount (PKR)" required>
          <input className={clinicInputClass()} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
        </ClinicField>
        <ClinicField label="Method">
          <ClinicSelect
            value={payMethod}
            onChange={(v) => setPayMethod(v as PaymentMethod)}
            options={[
              { value: 'Cash', label: 'Cash' },
              { value: 'Bank Transfer', label: 'Bank Transfer' },
              { value: 'Card', label: 'Card' },
              { value: 'Online Payment', label: 'Online' },
              { value: 'Other', label: 'Other' },
            ]}
            className="w-full"
          />
        </ClinicField>
        <ClinicField label="Reference">
          <input className={clinicInputClass()} value={payRef} onChange={(e) => setPayRef(e.target.value)} />
        </ClinicField>
      </ClinicModal>

      <ClinicModal
        isOpen={discountOpen}
        onClose={() => setDiscountOpen(false)}
        title="Apply discount"
        actions={
          <>
            <ClinicButton variant="secondary" onClick={() => setDiscountOpen(false)}>
              Cancel
            </ClinicButton>
            <ClinicButton onClick={saveDiscount}>Apply</ClinicButton>
          </>
        }
      >
        <ClinicField label="Discount amount (PKR)">
          <input className={clinicInputClass()} value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} />
        </ClinicField>
      </ClinicModal>
    </ClinicPage>
  );
}
