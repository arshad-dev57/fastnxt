'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from 'react';
import { Wallet, Plus, Printer, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ClinicPage,
  ClinicMockBanner,
  ClinicPageHeader,
  ClinicCard,
  ClinicStatCard,
  ClinicStatusBadge,
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
  ClinicField,
  clinicInputClass,
  CLINIC_COLORS,
} from '../ui';
import { useClinicStore, fullPatientName, nextId } from '../_lib/store';
import { formatDate, formatPkr } from '../_lib/format';
import type { ClinicPayment, PaymentMethod, PaymentStatus } from '../_lib/types';

export default function PaymentsPage() {
  const store = useClinicStore();
  const [q, setQ] = useState('');
  const [method, setMethod] = useState('All');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [receipt, setReceipt] = useState<ClinicPayment | null>(null);
  const [form, setForm] = useState({
    patientId: '',
    invoiceId: '',
    amount: 0,
    method: 'Cash' as PaymentMethod,
    reference: '',
    receivedBy: 'Sana Reception',
    date: new Date().toISOString().slice(0, 10),
  });
  const pageSize = 10;

  const filtered = useMemo(() => {
    return store.payments.filter((p) => {
      const patient = store.patients.find((x) => x.id === p.patientId);
      const hay = `${p.id} ${p.invoiceId} ${fullPatientName(patient)} ${p.reference || ''}`.toLowerCase();
      return (!q || hay.includes(q.toLowerCase())) && (method === 'All' || p.method === method);
    });
  }, [store, q, method]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const totals = useMemo(() => {
    const completed = store.payments.filter((p) => p.status === 'Completed');
    return {
      collected: completed.reduce((s, p) => s + p.amount, 0),
      pending: store.payments.filter((p) => p.status === 'Pending').reduce((s, p) => s + p.amount, 0),
      refunded: store.payments.filter((p) => p.status === 'Refunded').reduce((s, p) => s + p.amount, 0),
    };
  }, [store.payments]);

  const openReceive = () => {
    const unpaid = store.invoices.find((i) => i.outstanding > 0);
    setForm({
      patientId: unpaid?.patientId || store.patients[0]?.id || '',
      invoiceId: unpaid?.id || store.invoices[0]?.id || '',
      amount: unpaid?.outstanding || 0,
      method: 'Cash',
      reference: '',
      receivedBy: 'Sana Reception',
      date: new Date().toISOString().slice(0, 10),
    });
    setOpen(true);
  };

  const savePayment = () => {
    if (!form.invoiceId || form.amount <= 0) {
      toast.error('Invoice and amount are required');
      return;
    }
    const payment: ClinicPayment = {
      id: nextId('PAY', store.payments),
      patientId: form.patientId,
      invoiceId: form.invoiceId,
      date: form.date,
      amount: Number(form.amount),
      method: form.method,
      reference: form.reference || undefined,
      receivedBy: form.receivedBy,
      status: 'Completed',
    };
    store.update((prev) => {
      const invoices = prev.invoices.map((inv) => {
        if (inv.id !== form.invoiceId) return inv;
        const paidAmount = inv.paidAmount + Number(form.amount);
        const outstanding = Math.max(0, inv.total - paidAmount);
        const status =
          outstanding === 0 ? 'Paid' : paidAmount > 0 ? 'Partially Paid' : inv.status;
        return { ...inv, paidAmount, outstanding, status: status as typeof inv.status };
      });
      return { ...prev, payments: [payment, ...prev.payments], invoices };
    });
    toast.success('Payment recorded');
    setOpen(false);
    setReceipt(payment);
  };

  const refund = (pay: ClinicPayment) => {
    if (pay.status === 'Refunded') return;
    store.update((prev) => ({
      ...prev,
      payments: prev.payments.map((p) =>
        p.id === pay.id ? { ...p, status: 'Refunded' as PaymentStatus } : p
      ),
      invoices: prev.invoices.map((inv) => {
        if (inv.id !== pay.invoiceId) return inv;
        const paidAmount = Math.max(0, inv.paidAmount - pay.amount);
        const outstanding = inv.total - paidAmount;
        return {
          ...inv,
          paidAmount,
          outstanding,
          status: (paidAmount === 0 ? 'Unpaid' : 'Partially Paid') as typeof inv.status,
        };
      }),
    }));
    toast.success('Refund processed (demo)');
  };

  return (
    <ClinicPage>
      <ClinicMockBanner />
      <ClinicPageHeader
        title="Payments & Receipts"
        subtitle="Collect payments, issue receipts and process refunds"
        icon={<Wallet className="w-5 h-5 text-white" />}
        actions={
          <ClinicButton onClick={openReceive}>
            <Plus className="w-4 h-4" /> Receive Payment
          </ClinicButton>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ClinicStatCard label="Collected" value={formatPkr(totals.collected)} icon={Wallet} color={CLINIC_COLORS.success} />
        <ClinicStatCard label="Pending" value={formatPkr(totals.pending)} icon={Wallet} color={CLINIC_COLORS.warning} />
        <ClinicStatCard label="Refunded" value={formatPkr(totals.refunded)} icon={RotateCcw} color={CLINIC_COLORS.danger} />
      </div>

      <ClinicCard>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <ClinicSearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search payments…" />
          <ClinicSelect
            value={method}
            onChange={(v) => { setMethod(v); setPage(1); }}
            options={['All', 'Cash', 'Bank Transfer', 'Card', 'Online Payment', 'Other'].map((m) => ({
              value: m,
              label: m === 'All' ? 'All methods' : m,
            }))}
          />
        </div>
        <ClinicTable>
          <ClinicTableHeader columns={['Payment ID', 'Patient', 'Invoice', 'Date', 'Amount', 'Method', 'Reference', 'Received By', 'Status', 'Actions']} />
          <ClinicTableBody>
            {rows.map((p) => {
              const patient = store.patients.find((x) => x.id === p.patientId);
              const inv = store.invoices.find((i) => i.id === p.invoiceId);
              return (
                <ClinicTableRow key={p.id}>
                  <ClinicTableCell className="font-semibold">{p.id}</ClinicTableCell>
                  <ClinicTableCell>{fullPatientName(patient)}</ClinicTableCell>
                  <ClinicTableCell>{inv?.invoiceNumber || p.invoiceId}</ClinicTableCell>
                  <ClinicTableCell>{formatDate(p.date)}</ClinicTableCell>
                  <ClinicTableCell className="font-semibold">{formatPkr(p.amount)}</ClinicTableCell>
                  <ClinicTableCell>{p.method}</ClinicTableCell>
                  <ClinicTableCell>{p.reference || '—'}</ClinicTableCell>
                  <ClinicTableCell>{p.receivedBy}</ClinicTableCell>
                  <ClinicTableCell><ClinicStatusBadge status={p.status} /></ClinicTableCell>
                  <ClinicTableCell>
                    <div className="flex gap-1">
                      <button type="button" className="p-1.5 rounded-lg hover:bg-teal-50 text-teal-700" title="Receipt" onClick={() => setReceipt(p)}><Printer className="w-3.5 h-3.5" /></button>
                      {p.status === 'Completed' && (
                        <button type="button" className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-700" title="Refund" onClick={() => refund(p)}><RotateCcw className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  </ClinicTableCell>
                </ClinicTableRow>
              );
            })}
          </ClinicTableBody>
        </ClinicTable>
        <ClinicPagination currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={pageSize} onPageChange={setPage} />
      </ClinicCard>

      <ClinicModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Receive Payment"
        actions={
          <>
            <ClinicButton variant="secondary" onClick={() => setOpen(false)}>Cancel</ClinicButton>
            <ClinicButton onClick={savePayment}>Record Payment</ClinicButton>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ClinicField label="Patient">
            <select className={clinicInputClass()} value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
              {store.patients.map((p) => <option key={p.id} value={p.id}>{fullPatientName(p)}</option>)}
            </select>
          </ClinicField>
          <ClinicField label="Invoice">
            <select className={clinicInputClass()} value={form.invoiceId} onChange={(e) => {
              const inv = store.invoices.find((i) => i.id === e.target.value);
              setForm({
                ...form,
                invoiceId: e.target.value,
                patientId: inv?.patientId || form.patientId,
                amount: inv?.outstanding || form.amount,
              });
            }}>
              {store.invoices.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.invoiceNumber} · due {formatPkr(i.outstanding)}
                </option>
              ))}
            </select>
          </ClinicField>
          <ClinicField label="Amount (PKR)"><input type="number" className={clinicInputClass()} value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></ClinicField>
          <ClinicField label="Method">
            <select className={clinicInputClass()} value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value as PaymentMethod })}>
              {['Cash', 'Bank Transfer', 'Card', 'Online Payment', 'Other'].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </ClinicField>
          <ClinicField label="Date"><input type="date" className={clinicInputClass()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></ClinicField>
          <ClinicField label="Transaction reference"><input className={clinicInputClass()} value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></ClinicField>
          <ClinicField label="Received by"><input className={clinicInputClass()} value={form.receivedBy} onChange={(e) => setForm({ ...form, receivedBy: e.target.value })} /></ClinicField>
        </div>
      </ClinicModal>

      <ClinicModal
        isOpen={!!receipt}
        onClose={() => setReceipt(null)}
        title="Payment Receipt"
        actions={
          <>
            <ClinicButton variant="secondary" onClick={() => setReceipt(null)}>Close</ClinicButton>
            <ClinicButton onClick={() => window.print()}><Printer className="w-4 h-4" /> Print</ClinicButton>
          </>
        }
      >
        {receipt && (
          <div className="border border-teal-100 rounded-2xl p-6">
            <div className="flex justify-between mb-4">
              <div>
                <p className="font-extrabold text-teal-800 text-lg">{store.settings.clinicName}</p>
                <p className="text-xs text-slate-500">{store.settings.address}, {store.settings.city}</p>
              </div>
              <p className="text-xs font-bold text-slate-500">RECEIPT</p>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="text-slate-500">Receipt No:</span> <strong>{receipt.id}</strong></p>
              <p><span className="text-slate-500">Patient:</span> <strong>{fullPatientName(store.patients.find((p) => p.id === receipt.patientId))}</strong></p>
              <p><span className="text-slate-500">Invoice:</span> <strong>{store.invoices.find((i) => i.id === receipt.invoiceId)?.invoiceNumber || receipt.invoiceId}</strong></p>
              <p><span className="text-slate-500">Date:</span> <strong>{formatDate(receipt.date)}</strong></p>
              <p><span className="text-slate-500">Method:</span> <strong>{receipt.method}</strong></p>
              <p className="text-xl font-extrabold text-teal-800 pt-3 border-t border-teal-100">{formatPkr(receipt.amount)}</p>
              <p className="text-xs text-slate-500">Received by {receipt.receivedBy}</p>
            </div>
          </div>
        )}
      </ClinicModal>
    </ClinicPage>
  );
}
