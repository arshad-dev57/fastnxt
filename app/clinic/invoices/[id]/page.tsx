'use client';

export const dynamic = 'force-dynamic';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Printer, Banknote, Undo2, Ban, Receipt } from 'lucide-react';
import {
  ClinicPage,
  ClinicMockBanner,
  ClinicPageHeader,
  ClinicCard,
  ClinicButton,
  ClinicModal,
  ClinicField,
  clinicInputClass,
  ClinicSelect,
  ClinicStatusBadge,
  ClinicTable,
  ClinicTableHeader,
  ClinicTableBody,
  ClinicTableRow,
  ClinicTableCell,
  ClinicEmptyState,
} from '../../ui';
import {
  useClinicStore,
  fullPatientName,
  patientById,
  nextId,
} from '../../_lib/store';
import { formatDate, formatPkr, todayIso } from '../../_lib/format';
import { deriveInvoiceStatus, makeAuditEntry } from '../../_lib/billing';
import type { PaymentMethod } from '../../_lib/types';

export default function ClinicInvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const store = useClinicStore();
  const invoice = store.invoices.find((i) => i.id === id);
  const patient = patientById(invoice?.patientId ?? '', store.patients);
  const payments = useMemo(
    () => store.payments.filter((p) => p.invoiceId === id),
    [store.payments, id]
  );

  const [payOpen, setPayOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Cash');
  const [refundAmount, setRefundAmount] = useState('');

  if (!invoice) {
    return (
      <ClinicPage>
        <ClinicMockBanner />
        <ClinicEmptyState title="Invoice not found" description={`No invoice with ID ${id}`} />
      </ClinicPage>
    );
  }

  const collectPayment = () => {
    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (amount > invoice.outstanding) {
      toast.error('Exceeds outstanding');
      return;
    }
    const paidAmount = invoice.paidAmount + amount;
    const outstanding = Math.max(0, invoice.total - paidAmount);
    const status = deriveInvoiceStatus(invoice.total, paidAmount, invoice.dueDate, invoice.status);
    const payId = nextId('PAY', store.payments);
    store.update((prev) => ({
      ...prev,
      invoices: prev.invoices.map((i) =>
        i.id === invoice.id ? { ...i, paidAmount, outstanding, status } : i
      ),
      payments: [
        {
          id: payId,
          patientId: invoice.patientId,
          invoiceId: invoice.id,
          date: todayIso(),
          amount,
          method: payMethod,
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
          description: `Payment on ${invoice.invoiceNumber}`,
        }),
        ...prev.auditLogs,
      ],
    }));
    toast.success('Payment collected');
    setPayOpen(false);
  };

  const issueRefund = () => {
    const amount = Number(refundAmount);
    if (!amount || amount <= 0 || amount > invoice.paidAmount) {
      toast.error('Invalid refund amount');
      return;
    }
    const paidAmount = invoice.paidAmount - amount;
    const outstanding = invoice.total - paidAmount;
    const status = deriveInvoiceStatus(invoice.total, paidAmount, invoice.dueDate, invoice.status);
    const payId = nextId('PAY', store.payments);
    store.update((prev) => ({
      ...prev,
      invoices: prev.invoices.map((i) =>
        i.id === invoice.id ? { ...i, paidAmount, outstanding, status } : i
      ),
      payments: [
        {
          id: payId,
          patientId: invoice.patientId,
          invoiceId: invoice.id,
          date: todayIso(),
          amount: -amount,
          method: 'Cash',
          receivedBy: 'Billing Desk',
          status: 'Refunded',
        },
        ...prev.payments,
      ],
    }));
    toast.success('Refund recorded');
    setRefundOpen(false);
  };

  const cancelInvoice = () => {
    store.update((prev) => ({
      ...prev,
      invoices: prev.invoices.map((i) =>
        i.id === invoice.id ? { ...i, status: 'Cancelled', outstanding: 0 } : i
      ),
      auditLogs: [
        makeAuditEntry(prev.auditLogs, {
          user: 'Billing Desk',
          action: 'Cancel',
          module: 'Billing',
          recordRef: invoice.id,
          description: `Cancelled ${invoice.invoiceNumber}`,
        }),
        ...prev.auditLogs,
      ],
    }));
    toast.success('Invoice cancelled');
  };

  return (
    <ClinicPage fullWidth>
      <ClinicMockBanner />
      <div className="no-print">
        <ClinicPageHeader
          title={invoice.invoiceNumber}
          subtitle={`Patient: ${fullPatientName(patient)}`}
          backHref="/clinic/invoices"
          icon={<Receipt className="w-5 h-5 text-white" />}
          actions={
            <>
              <ClinicStatusBadge status={invoice.status} />
              {invoice.outstanding > 0 && invoice.status !== 'Cancelled' && (
                <ClinicButton onClick={() => { setPayAmount(String(invoice.outstanding)); setPayOpen(true); }}>
                  <Banknote className="w-3.5 h-3.5" /> Collect
                </ClinicButton>
              )}
              {invoice.paidAmount > 0 && (
                <ClinicButton variant="secondary" onClick={() => { setRefundAmount(''); setRefundOpen(true); }}>
                  <Undo2 className="w-3.5 h-3.5" /> Refund
                </ClinicButton>
              )}
              {invoice.status !== 'Cancelled' && (
                <ClinicButton variant="danger" onClick={cancelInvoice}>
                  <Ban className="w-3.5 h-3.5" /> Cancel
                </ClinicButton>
              )}
              <ClinicButton variant="secondary" onClick={() => window.print()}>
                <Printer className="w-3.5 h-3.5" /> Print
              </ClinicButton>
            </>
          }
        />
      </div>

      <div id="invoice-print" className="bg-white rounded-2xl border border-[#d1e7df] p-8 shadow-sm max-w-3xl mx-auto">
        <div className="flex justify-between items-start border-b border-dashed border-slate-200 pb-6 mb-6">
          <div>
            <p className="text-2xl font-extrabold text-teal-800">{store.settings.clinicName}</p>
            <p className="text-xs text-slate-500 mt-1">{store.settings.tagline}</p>
            <p className="text-xs text-slate-500 mt-2">{store.settings.address}, {store.settings.city}</p>
            <p className="text-xs text-slate-500">{store.settings.phone} · {store.settings.email}</p>
          </div>
          <div className="text-right">
            <div className="w-14 h-14 rounded-xl bg-teal-700 text-white font-extrabold text-lg flex items-center justify-center ml-auto">
              {store.settings.logoText}
            </div>
            <p className="text-lg font-bold mt-3">TAX INVOICE</p>
            <p className="text-xs text-slate-500">{invoice.invoiceNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase">Bill to</p>
            <p className="font-bold">{fullPatientName(patient)}</p>
            <p className="text-slate-600">{patient?.phone}</p>
            <p className="text-slate-600">{patient?.email}</p>
          </div>
          <div className="space-y-1 text-right">
            <p><span className="text-slate-500">Date:</span> {formatDate(invoice.date)}</p>
            <p><span className="text-slate-500">Due:</span> {formatDate(invoice.dueDate)}</p>
            <p><span className="text-slate-500">Currency:</span> {store.settings.currency}</p>
          </div>
        </div>

        <table className="w-full text-sm mb-6">
          <thead className="bg-teal-50 text-teal-900 text-xs uppercase">
            <tr>
              <th className="text-left p-2">Description</th>
              <th className="text-right p-2">Qty</th>
              <th className="text-right p-2">Unit</th>
              <th className="text-right p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="p-2">{item.description}</td>
                <td className="p-2 text-right">{item.qty}</td>
                <td className="p-2 text-right">{formatPkr(item.unitPrice)}</td>
                <td className="p-2 text-right font-medium">{formatPkr(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatPkr(invoice.subtotal)}</span></div>
          <div className="flex justify-between"><span>Discount</span><span>-{formatPkr(invoice.discount)}</span></div>
          <div className="flex justify-between"><span>Tax ({store.settings.taxPercent}%)</span><span>{formatPkr(invoice.tax)}</span></div>
          <div className="flex justify-between font-extrabold text-teal-800 text-base pt-2 border-t"><span>Total</span><span>{formatPkr(invoice.total)}</span></div>
          <div className="flex justify-between text-emerald-700"><span>Paid</span><span>{formatPkr(invoice.paidAmount)}</span></div>
          <div className="flex justify-between text-amber-700 font-semibold"><span>Outstanding</span><span>{formatPkr(invoice.outstanding)}</span></div>
        </div>

        {invoice.notes && <p className="text-xs text-slate-500 mt-6">Notes: {invoice.notes}</p>}
        <p className="text-[10px] text-slate-400 mt-8 text-center">Thank you for choosing {store.settings.clinicName}. All amounts in PKR.</p>
      </div>

      <div className="no-print mt-6">
        <ClinicCard title="Payment history">
          <ClinicTable>
            <ClinicTableHeader columns={['Date', 'Amount', 'Method', 'Received by', 'Status']} />
            <ClinicTableBody>
              {payments.map((p) => (
                <ClinicTableRow key={p.id}>
                  <ClinicTableCell>{formatDate(p.date)}</ClinicTableCell>
                  <ClinicTableCell className="font-semibold">{formatPkr(p.amount)}</ClinicTableCell>
                  <ClinicTableCell>{p.method}</ClinicTableCell>
                  <ClinicTableCell>{p.receivedBy}</ClinicTableCell>
                  <ClinicTableCell><ClinicStatusBadge status={p.status} /></ClinicTableCell>
                </ClinicTableRow>
              ))}
            </ClinicTableBody>
          </ClinicTable>
        </ClinicCard>
      </div>

      <ClinicModal
        isOpen={payOpen}
        onClose={() => setPayOpen(false)}
        title="Collect payment"
        actions={<><ClinicButton variant="secondary" onClick={() => setPayOpen(false)}>Cancel</ClinicButton><ClinicButton onClick={collectPayment}>Confirm</ClinicButton></>}
      >
        <ClinicField label="Amount (PKR)"><input className={clinicInputClass()} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} /></ClinicField>
        <ClinicField label="Method">
          <ClinicSelect value={payMethod} onChange={(v) => setPayMethod(v as PaymentMethod)} options={[
            { value: 'Cash', label: 'Cash' }, { value: 'Bank Transfer', label: 'Bank Transfer' }, { value: 'Card', label: 'Card' }, { value: 'Online Payment', label: 'Online' }, { value: 'Other', label: 'Other' },
          ]} className="w-full" />
        </ClinicField>
      </ClinicModal>

      <ClinicModal
        isOpen={refundOpen}
        onClose={() => setRefundOpen(false)}
        title="Issue refund"
        actions={<><ClinicButton variant="secondary" onClick={() => setRefundOpen(false)}>Cancel</ClinicButton><ClinicButton onClick={issueRefund}>Refund</ClinicButton></>}
      >
        <p className="text-xs text-slate-500">Max refundable: {formatPkr(invoice.paidAmount)}</p>
        <ClinicField label="Refund amount (PKR)"><input className={clinicInputClass()} value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} /></ClinicField>
      </ClinicModal>

      <style dangerouslySetInnerHTML={{ __html: `@media print{.no-print{display:none!important}body{background:white}#invoice-print{border:none;box-shadow:none;max-width:100%}}` }} />
    </ClinicPage>
  );
}
