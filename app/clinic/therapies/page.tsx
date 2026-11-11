'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from 'react';
import { Sparkles, Plus, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ClinicPage,
  ClinicMockBanner,
  ClinicPageHeader,
  ClinicCard,
  ClinicSearchInput,
  ClinicSelect,
  ClinicButton,
  ClinicModal,
  ClinicField,
  clinicInputClass,
  ClinicTable,
  ClinicTableHeader,
  ClinicTableBody,
  ClinicTableRow,
  ClinicTableCell,
  ClinicStatusBadge,
  ClinicPagination,
  ClinicEmptyState,
} from '../ui';
import { useClinicStore, nextId } from '../_lib/store';
import { formatPkr } from '../_lib/format';
import type { ClinicService } from '../_lib/types';

const PAGE_SIZE = 10;
const CATEGORIES = [
  'Physiotherapy',
  'Psychology',
  'Speech Therapy',
  'Occupational Therapy',
  'Consultation',
  'Rehabilitation',
  'Assessment',
  'Follow-up Consultation',
];

function emptyService(services: ClinicService[]): ClinicService {
  return {
    id: nextId('SRV', services),
    name: '',
    category: 'Physiotherapy',
    description: '',
    durationMinutes: 40,
    price: 2500,
    therapistIds: [],
    taxPercent: 5,
    status: 'Active',
  };
}

export default function TherapiesPage() {
  const { services, therapists, update } = useClinicStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClinicService | null>(null);
  const [form, setForm] = useState<ClinicService>(() => emptyService(services));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services
      .filter((s) => category === 'all' || s.category === category)
      .filter((s) => statusFilter === 'all' || s.status === statusFilter)
      .filter((s) => !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
      .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  }, [services, search, category, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyService(services));
    setModalOpen(true);
  };

  const openEdit = (s: ClinicService) => {
    setEditing(s);
    setForm({ ...s });
    setModalOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) {
      toast.error('Service name required');
      return;
    }
    update((st) => {
      if (editing) {
        return { ...st, services: st.services.map((s) => (s.id === editing.id ? form : s)) };
      }
      return { ...st, services: [...st.services, form] };
    });
    toast.success(editing ? 'Service updated' : 'Service added');
    setModalOpen(false);
  };

  const toggleStatus = (s: ClinicService) => {
    const next = s.status === 'Active' ? 'Inactive' : 'Active';
    update((st) => ({
      ...st,
      services: st.services.map((x) => (x.id === s.id ? { ...x, status: next } : x)),
    }));
    toast.success(`${s.name} is now ${next}`);
  };

  return (
    <ClinicPage>
      <ClinicMockBanner />
      <ClinicPageHeader
        title="Therapy & Services Catalog"
        subtitle="Pricing in PKR — link therapists, rooms, and equipment"
        icon={<Sparkles className="w-5 h-5 text-white" />}
        actions={<ClinicButton onClick={openAdd}><Plus className="w-3.5 h-3.5" /> Add Service</ClinicButton>}
      />

      <ClinicCard noPadding>
        <div className="p-5 flex flex-wrap gap-3">
          <ClinicSearchInput value={search} onChange={setSearch} placeholder="Search services…" />
          <ClinicSelect value={category} onChange={(v) => { setCategory(v); setPage(1); }} options={[{ value: 'all', label: 'All categories' }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]} />
          <ClinicSelect value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} options={[{ value: 'all', label: 'All status' }, { value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]} />
        </div>
        {paged.length === 0 ? (
          <ClinicEmptyState title="No services" action={<ClinicButton onClick={openAdd}>Add service</ClinicButton>} />
        ) : (
          <>
            <ClinicTable>
              <ClinicTableHeader columns={['Service', 'Category', 'Duration', 'Price (PKR)', 'Status', 'Actions']} />
              <ClinicTableBody>
                {paged.map((s) => (
                  <ClinicTableRow key={s.id}>
                    <ClinicTableCell>
                      <p className="font-semibold text-slate-900">{s.name}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{s.description}</p>
                    </ClinicTableCell>
                    <ClinicTableCell>{s.category}</ClinicTableCell>
                    <ClinicTableCell>{s.durationMinutes} min</ClinicTableCell>
                    <ClinicTableCell className="font-bold text-teal-800">{formatPkr(s.price)}</ClinicTableCell>
                    <ClinicTableCell><ClinicStatusBadge status={s.status} /></ClinicTableCell>
                    <ClinicTableCell>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-slate-100"><Pencil className="w-4 h-4" /></button>
                        <ClinicButton variant="ghost" onClick={() => toggleStatus(s)}>{s.status === 'Active' ? 'Deactivate' : 'Activate'}</ClinicButton>
                      </div>
                    </ClinicTableCell>
                  </ClinicTableRow>
                ))}
              </ClinicTableBody>
            </ClinicTable>
            <div className="px-4">
              <ClinicPagination currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
            </div>
          </>
        )}
      </ClinicCard>

      <ClinicModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit service' : 'New therapy service'}
        maxWidth="max-w-2xl"
        actions={
          <>
            <ClinicButton variant="secondary" onClick={() => setModalOpen(false)}>Cancel</ClinicButton>
            <ClinicButton onClick={save}>Save</ClinicButton>
          </>
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <ClinicField label="Service ID"><input className={clinicInputClass()} value={form.id} readOnly /></ClinicField>
          <ClinicField label="Status">
            <ClinicSelect value={form.status} onChange={(v) => setForm({ ...form, status: v as ClinicService['status'] })} options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]} className="w-full" />
          </ClinicField>
          <ClinicField label="Name" required>
            <input className={clinicInputClass()} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </ClinicField>
          <ClinicField label="Category">
            <ClinicSelect value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={CATEGORIES.map((c) => ({ value: c, label: c }))} className="w-full" />
          </ClinicField>
          <ClinicField label="Duration (minutes)">
            <input type="number" className={clinicInputClass()} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} />
          </ClinicField>
          <ClinicField label="Price PKR">
            <input type="number" className={clinicInputClass()} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </ClinicField>
          <ClinicField label="Tax %">
            <input type="number" className={clinicInputClass()} value={form.taxPercent} onChange={(e) => setForm({ ...form, taxPercent: Number(e.target.value) })} />
          </ClinicField>
          <ClinicField label="Room type">
            <input className={clinicInputClass()} value={form.requiredRoomType || ''} onChange={(e) => setForm({ ...form, requiredRoomType: e.target.value })} />
          </ClinicField>
          <div className="sm:col-span-2">
            <ClinicField label="Description">
              <textarea className={clinicInputClass() + ' min-h-[80px]'} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </ClinicField>
          </div>
          <div className="sm:col-span-2">
            <ClinicField label="Assigned therapists">
              <select
                multiple
                className={clinicInputClass() + ' min-h-[100px]'}
                value={form.therapistIds}
                onChange={(e) => {
                  const opts = Array.from(e.target.selectedOptions).map((o) => o.value);
                  setForm({ ...form, therapistIds: opts });
                }}
              >
                {therapists.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">Hold Ctrl to select multiple therapists.</p>
            </ClinicField>
          </div>
        </div>
      </ClinicModal>
    </ClinicPage>
  );
}
