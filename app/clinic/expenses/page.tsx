'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from 'react';
import { CircleDollarSign, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  ClinicPage,
  ClinicMockBanner,
  ClinicPageHeader,
  ClinicCard,
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
  ClinicField,
  ClinicPagination,
  clinicInputClass,
} from '../ui';
import { useClinicStore, nextId } from '../_lib/store';
import { formatDate, formatPkr } from '../_lib/format';
import type { ClinicExpense, ExpenseStatus, PaymentMethod } from '../_lib/types';

export default function ExpensesPage() {
  const store = useClinicStore();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClinicExpense | null>(null);
  const [form, setForm] = useState({
    category: 'Supplies',
    description: '',
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'Cash' as PaymentMethod,
    reference: '',
    status: 'Pending' as ExpenseStatus,
  });
  const pageSize = 8;

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(store.expenses.map((e) => e.category)))],
    [store.expenses]
  );

  const filtered = useMemo(() => {
    return store.expenses.filter((e) => {
      const hay = `${e.id} ${e.description} ${e.category}`.toLowerCase();
      return (!q || hay.includes(q.toLowerCase())) && (category === 'All' || e.category === category);
    });
  }, [store.expenses, q, category]);

  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    store.expenses.forEach((e) => map.set(e.category, (map.get(e.category) || 0) + e.amount));
    return Array.from(map.entries()).map(([name, amount]) => ({ name, amount }));
  }, [store.expenses]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const save = () => {
    if (!form.description.trim() || form.amount <= 0) {
      toast.error('Description and amount are required');
      return;
    }
    const payload: ClinicExpense = {
      id: editing?.id || nextId('EXP', store.expenses),
      ...form,
      amount: Number(form.amount),
      description: form.description.trim(),
      reference: form.reference || undefined,
    };
    store.update((prev) => ({
      ...prev,
      expenses: editing
        ? prev.expenses.map((e) => (e.id === editing.id ? payload : e))
        : [payload, ...prev.expenses],
    }));
    toast.success(editing ? 'Expense updated' : 'Expense added');
    setOpen(false);
  };

  return (
    <ClinicPage>
      <ClinicMockBanner />
      <ClinicPageHeader
        title="Clinic Expenses"
        subtitle="Operational costs, category breakdown and approvals"
        icon={<CircleDollarSign className="w-5 h-5 text-white" />}
        actions={
          <ClinicButton onClick={() => {
            setEditing(null);
            setForm({
              category: 'Supplies',
              description: '',
              amount: 0,
              date: new Date().toISOString().slice(0, 10),
              paymentMethod: 'Cash',
              reference: '',
              status: 'Pending',
            });
            setOpen(true);
          }}>
            <Plus className="w-4 h-4" /> Add Expense
          </ClinicButton>
        }
      />

      <ClinicCard title="Monthly Expense Overview" subtitle="By category (PKR)">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatPkr(Number(v || 0))} />
              <Bar dataKey="amount" fill="#0f766e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ClinicCard>

      <ClinicCard>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <ClinicSearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search expenses…" />
          <ClinicSelect value={category} onChange={(v) => { setCategory(v); setPage(1); }} options={categories.map((c) => ({ value: c, label: c === 'All' ? 'All categories' : c }))} />
        </div>
        <ClinicTable>
          <ClinicTableHeader columns={['Expense ID', 'Category', 'Description', 'Amount', 'Date', 'Method', 'Reference', 'Status', 'Actions']} />
          <ClinicTableBody>
            {rows.map((e) => (
              <ClinicTableRow key={e.id}>
                <ClinicTableCell className="font-semibold">{e.id}</ClinicTableCell>
                <ClinicTableCell>{e.category}</ClinicTableCell>
                <ClinicTableCell className="max-w-[220px] truncate">{e.description}</ClinicTableCell>
                <ClinicTableCell className="font-semibold">{formatPkr(e.amount)}</ClinicTableCell>
                <ClinicTableCell>{formatDate(e.date)}</ClinicTableCell>
                <ClinicTableCell>{e.paymentMethod}</ClinicTableCell>
                <ClinicTableCell>{e.reference || '—'}</ClinicTableCell>
                <ClinicTableCell><ClinicStatusBadge status={e.status} /></ClinicTableCell>
                <ClinicTableCell>
                  <button
                    type="button"
                    className="text-xs font-bold text-teal-700"
                    onClick={() => {
                      setEditing(e);
                      setForm({
                        category: e.category,
                        description: e.description,
                        amount: e.amount,
                        date: e.date,
                        paymentMethod: e.paymentMethod,
                        reference: e.reference || '',
                        status: e.status,
                      });
                      setOpen(true);
                    }}
                  >
                    Edit
                  </button>
                </ClinicTableCell>
              </ClinicTableRow>
            ))}
          </ClinicTableBody>
        </ClinicTable>
        <ClinicPagination currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={pageSize} onPageChange={setPage} />
      </ClinicCard>

      <ClinicModal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Edit Expense' : 'Add Expense'} actions={<><ClinicButton variant="secondary" onClick={() => setOpen(false)}>Cancel</ClinicButton><ClinicButton onClick={save}>Save</ClinicButton></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ClinicField label="Category"><input className={clinicInputClass()} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></ClinicField>
          <ClinicField label="Amount (PKR)"><input type="number" className={clinicInputClass()} value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></ClinicField>
          <div className="sm:col-span-2"><ClinicField label="Description" required><textarea className={clinicInputClass()} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></ClinicField></div>
          <ClinicField label="Date"><input type="date" className={clinicInputClass()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></ClinicField>
          <ClinicField label="Payment method">
            <select className={clinicInputClass()} value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })}>
              {['Cash', 'Bank Transfer', 'Card', 'Online Payment', 'Other'].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </ClinicField>
          <ClinicField label="Reference"><input className={clinicInputClass()} value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></ClinicField>
          <ClinicField label="Status">
            <select className={clinicInputClass()} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ExpenseStatus })}>
              {['Pending', 'Approved', 'Paid', 'Rejected'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </ClinicField>
        </div>
      </ClinicModal>
    </ClinicPage>
  );
}
