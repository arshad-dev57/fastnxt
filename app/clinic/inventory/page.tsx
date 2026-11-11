'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from 'react';
import { Package, Plus, AlertTriangle, ArrowDownUp } from 'lucide-react';
import toast from 'react-hot-toast';
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
import { formatDate } from '../_lib/format';
import type { InventoryItem, InventoryStatus } from '../_lib/types';

function deriveStatus(qty: number, reorder: number, expiry?: string): InventoryStatus {
  if (expiry && expiry < new Date().toISOString().slice(0, 10)) return 'Expired';
  if (qty <= 0) return 'Out of Stock';
  if (qty <= reorder) return 'Low Stock';
  return 'In Stock';
}

export default function InventoryPage() {
  const store = useClinicStore();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState<InventoryItem | null>(null);
  const [stockDelta, setStockDelta] = useState(0);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: 'Consumables',
    quantity: 0,
    unit: 'pcs',
    reorderLevel: 5,
    expiryDate: '',
    supplier: '',
  });
  const pageSize = 8;

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(store.inventory.map((i) => i.category)))],
    [store.inventory]
  );

  const lowStock = store.inventory.filter((i) => i.status === 'Low Stock' || i.status === 'Out of Stock');

  const filtered = useMemo(() => {
    return store.inventory.filter((i) => {
      const hay = `${i.name} ${i.sku} ${i.supplier}`.toLowerCase();
      return (
        (!q || hay.includes(q.toLowerCase())) &&
        (category === 'All' || i.category === category) &&
        (status === 'All' || i.status === status)
      );
    });
  }, [store.inventory, q, category, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const save = () => {
    if (!form.name.trim() || !form.sku.trim()) {
      toast.error('Name and SKU are required');
      return;
    }
    const qty = Number(form.quantity);
    const payload: InventoryItem = {
      id: editing?.id || nextId('INVY', store.inventory),
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category,
      quantity: qty,
      unit: form.unit,
      reorderLevel: Number(form.reorderLevel),
      expiryDate: form.expiryDate || undefined,
      supplier: form.supplier,
      status: deriveStatus(qty, Number(form.reorderLevel), form.expiryDate || undefined),
      assignedRoomId: editing?.assignedRoomId,
    };
    store.update((prev) => ({
      ...prev,
      inventory: editing
        ? prev.inventory.map((i) => (i.id === editing.id ? payload : i))
        : [payload, ...prev.inventory],
    }));
    toast.success(editing ? 'Item updated' : 'Item added');
    setOpen(false);
  };

  const applyStock = () => {
    if (!stockOpen) return;
    store.update((prev) => ({
      ...prev,
      inventory: prev.inventory.map((i) => {
        if (i.id !== stockOpen.id) return i;
        const quantity = Math.max(0, i.quantity + Number(stockDelta));
        return {
          ...i,
          quantity,
          status: deriveStatus(quantity, i.reorderLevel, i.expiryDate),
        };
      }),
    }));
    toast.success(stockDelta >= 0 ? 'Stock in recorded' : 'Stock out recorded');
    setStockOpen(null);
  };

  return (
    <ClinicPage>
      <ClinicMockBanner />
      <ClinicPageHeader
        title="Inventory & Equipment"
        subtitle="Medical supplies, therapy equipment and stock alerts"
        icon={<Package className="w-5 h-5 text-white" />}
        actions={
          <div className="flex gap-2">
            <ClinicButton variant="secondary" onClick={() => toast.success('Purchase request drafted (demo)')}>
              Purchase Request
            </ClinicButton>
            <ClinicButton onClick={() => {
              setEditing(null);
              setForm({ name: '', sku: '', category: 'Consumables', quantity: 0, unit: 'pcs', reorderLevel: 5, expiryDate: '', supplier: '' });
              setOpen(true);
            }}>
              <Plus className="w-4 h-4" /> Add Item
            </ClinicButton>
          </div>
        }
      />

      {lowStock.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900">Low stock alerts</p>
            <p className="text-xs text-amber-800 mt-0.5">
              {lowStock.map((i) => i.name).join(', ')} — reorder recommended.
            </p>
          </div>
        </div>
      )}

      <ClinicCard>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <ClinicSearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search inventory…" />
          <ClinicSelect value={category} onChange={(v) => { setCategory(v); setPage(1); }} options={categories.map((c) => ({ value: c, label: c === 'All' ? 'All categories' : c }))} />
          <ClinicSelect value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={['All', 'In Stock', 'Low Stock', 'Out of Stock', 'Expired'].map((s) => ({ value: s, label: s === 'All' ? 'All statuses' : s }))} />
        </div>
        <ClinicTable>
          <ClinicTableHeader columns={['Product', 'SKU', 'Category', 'Qty', 'Unit', 'Reorder', 'Expiry', 'Supplier', 'Status', 'Actions']} />
          <ClinicTableBody>
            {rows.map((i) => (
              <ClinicTableRow key={i.id}>
                <ClinicTableCell className="font-semibold">{i.name}</ClinicTableCell>
                <ClinicTableCell>{i.sku}</ClinicTableCell>
                <ClinicTableCell>{i.category}</ClinicTableCell>
                <ClinicTableCell className="font-semibold">{i.quantity}</ClinicTableCell>
                <ClinicTableCell>{i.unit}</ClinicTableCell>
                <ClinicTableCell>{i.reorderLevel}</ClinicTableCell>
                <ClinicTableCell>{i.expiryDate ? formatDate(i.expiryDate) : '—'}</ClinicTableCell>
                <ClinicTableCell>{i.supplier}</ClinicTableCell>
                <ClinicTableCell><ClinicStatusBadge status={i.status} /></ClinicTableCell>
                <ClinicTableCell>
                  <div className="flex gap-2">
                    <button type="button" className="text-xs font-bold text-teal-700 inline-flex items-center gap-1" onClick={() => { setStockOpen(i); setStockDelta(0); }}>
                      <ArrowDownUp className="w-3 h-3" /> Stock
                    </button>
                    <button type="button" className="text-xs font-bold text-slate-600" onClick={() => {
                      setEditing(i);
                      setForm({
                        name: i.name,
                        sku: i.sku,
                        category: i.category,
                        quantity: i.quantity,
                        unit: i.unit,
                        reorderLevel: i.reorderLevel,
                        expiryDate: i.expiryDate || '',
                        supplier: i.supplier,
                      });
                      setOpen(true);
                    }}>Edit</button>
                  </div>
                </ClinicTableCell>
              </ClinicTableRow>
            ))}
          </ClinicTableBody>
        </ClinicTable>
        <ClinicPagination currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={pageSize} onPageChange={setPage} />
      </ClinicCard>

      <ClinicModal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Edit Item' : 'Add Item'} actions={<><ClinicButton variant="secondary" onClick={() => setOpen(false)}>Cancel</ClinicButton><ClinicButton onClick={save}>Save</ClinicButton></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ClinicField label="Product name" required><input className={clinicInputClass()} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></ClinicField>
          <ClinicField label="SKU" required><input className={clinicInputClass()} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></ClinicField>
          <ClinicField label="Category"><input className={clinicInputClass()} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></ClinicField>
          <ClinicField label="Supplier"><input className={clinicInputClass()} value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></ClinicField>
          <ClinicField label="Quantity"><input type="number" className={clinicInputClass()} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></ClinicField>
          <ClinicField label="Unit"><input className={clinicInputClass()} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></ClinicField>
          <ClinicField label="Reorder level"><input type="number" className={clinicInputClass()} value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: Number(e.target.value) })} /></ClinicField>
          <ClinicField label="Expiry date"><input type="date" className={clinicInputClass()} value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></ClinicField>
        </div>
      </ClinicModal>

      <ClinicModal isOpen={!!stockOpen} onClose={() => setStockOpen(null)} title={`Stock In/Out · ${stockOpen?.name || ''}`} actions={<><ClinicButton variant="secondary" onClick={() => setStockOpen(null)}>Cancel</ClinicButton><ClinicButton onClick={applyStock}>Apply</ClinicButton></>}>
        <ClinicField label="Quantity change (+ in / − out)">
          <input type="number" className={clinicInputClass()} value={stockDelta} onChange={(e) => setStockDelta(Number(e.target.value))} />
        </ClinicField>
        <p className="text-xs text-slate-500">Current quantity: {stockOpen?.quantity}</p>
      </ClinicModal>
    </ClinicPage>
  );
}
