'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from 'react';
import { Pill, Plus, Printer, Eye, Pencil } from 'lucide-react';
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
  ClinicPagination,
  ClinicField,
  clinicInputClass,
} from '../ui';
import { useClinicStore, fullPatientName, nextId } from '../_lib/store';
import { formatDate } from '../_lib/format';
import type { Prescription, PrescriptionStatus } from '../_lib/types';

const emptyForm = {
  patientId: '',
  clinicianId: '',
  date: '',
  medication: '',
  dosage: '',
  frequency: '',
  duration: '',
  instructions: '',
  status: 'Active' as PrescriptionStatus,
};

export default function PrescriptionsPage() {
  const store = useClinicStore();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<Prescription | null>(null);
  const [editing, setEditing] = useState<Prescription | null>(null);
  const [form, setForm] = useState(emptyForm);
  const pageSize = 8;

  const filtered = useMemo(() => {
    return store.prescriptions.filter((rx) => {
      const patient = store.patients.find((p) => p.id === rx.patientId);
      const hay = `${rx.id} ${rx.medication} ${fullPatientName(patient)}`.toLowerCase();
      return (!q || hay.includes(q.toLowerCase())) && (status === 'All' || rx.status === status);
    });
  }, [store, q, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      patientId: store.patients[0]?.id || '',
      clinicianId: 'TH-008',
      date: new Date().toISOString().slice(0, 10),
    });
    setOpen(true);
  };

  const openEdit = (rx: Prescription) => {
    setEditing(rx);
    setForm({ ...rx });
    setOpen(true);
  };

  const save = () => {
    if (!form.medication.trim() || !form.patientId) {
      toast.error('Patient and medication are required');
      return;
    }
    const payload: Prescription = {
      id: editing?.id || nextId('RX', store.prescriptions),
      ...form,
      medication: form.medication.trim(),
    };
    store.update((prev) => ({
      ...prev,
      prescriptions: editing
        ? prev.prescriptions.map((p) => (p.id === editing.id ? payload : p))
        : [payload, ...prev.prescriptions],
    }));
    toast.success(editing ? 'Prescription updated' : 'Prescription created');
    setOpen(false);
  };

  const clinicianName = (id: string) =>
    store.therapists.find((t) => t.id === id)?.name ||
    store.staff.find((s) => s.id === id)?.name ||
    id;

  return (
    <ClinicPage>
      <ClinicMockBanner />
      <ClinicPageHeader
        title="Prescriptions"
        subtitle="Medication orders with printable clinic-branded previews"
        icon={<Pill className="w-5 h-5 text-white" />}
        actions={
          <ClinicButton onClick={openCreate}>
            <Plus className="w-4 h-4" /> New Prescription
          </ClinicButton>
        }
      />

      <ClinicCard>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <ClinicSearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search medication or patient…" />
          <ClinicSelect
            value={status}
            onChange={(v) => { setStatus(v); setPage(1); }}
            options={['All', 'Active', 'Completed', 'Cancelled'].map((s) => ({ value: s, label: s === 'All' ? 'All statuses' : s }))}
          />
        </div>
        <ClinicTable>
          <ClinicTableHeader columns={['RX ID', 'Patient', 'Clinician', 'Date', 'Medication', 'Dosage', 'Status', 'Actions']} />
          <ClinicTableBody>
            {rows.map((rx) => {
              const patient = store.patients.find((p) => p.id === rx.patientId);
              return (
                <ClinicTableRow key={rx.id}>
                  <ClinicTableCell className="font-semibold">{rx.id}</ClinicTableCell>
                  <ClinicTableCell>{fullPatientName(patient)}</ClinicTableCell>
                  <ClinicTableCell>{clinicianName(rx.clinicianId)}</ClinicTableCell>
                  <ClinicTableCell>{formatDate(rx.date)}</ClinicTableCell>
                  <ClinicTableCell>
                    <div className="font-medium">{rx.medication}</div>
                    <div className="text-[11px] text-slate-500">{rx.frequency} · {rx.duration}</div>
                  </ClinicTableCell>
                  <ClinicTableCell>{rx.dosage}</ClinicTableCell>
                  <ClinicTableCell><ClinicStatusBadge status={rx.status} /></ClinicTableCell>
                  <ClinicTableCell>
                    <div className="flex gap-1">
                      <button type="button" className="p-1.5 rounded-lg hover:bg-teal-50 text-teal-700" onClick={() => setPreview(rx)} title="Preview"><Eye className="w-3.5 h-3.5" /></button>
                      <button type="button" className="p-1.5 rounded-lg hover:bg-teal-50 text-teal-700" onClick={() => openEdit(rx)} title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                      <button type="button" className="p-1.5 rounded-lg hover:bg-teal-50 text-teal-700" onClick={() => { setPreview(rx); setTimeout(() => window.print(), 300); }} title="Print"><Printer className="w-3.5 h-3.5" /></button>
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
        title={editing ? 'Edit Prescription' : 'Create Prescription'}
        actions={
          <>
            <ClinicButton variant="secondary" onClick={() => setOpen(false)}>Cancel</ClinicButton>
            <ClinicButton onClick={save}>Save</ClinicButton>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ClinicField label="Patient" required>
            <select className={clinicInputClass()} value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
              {store.patients.map((p) => <option key={p.id} value={p.id}>{fullPatientName(p)}</option>)}
            </select>
          </ClinicField>
          <ClinicField label="Prescribing clinician">
            <select className={clinicInputClass()} value={form.clinicianId} onChange={(e) => setForm({ ...form, clinicianId: e.target.value })}>
              {store.therapists.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </ClinicField>
          <ClinicField label="Date"><input type="date" className={clinicInputClass()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></ClinicField>
          <ClinicField label="Status">
            <select className={clinicInputClass()} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PrescriptionStatus })}>
              {['Active', 'Completed', 'Cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </ClinicField>
          <ClinicField label="Medication" required><input className={clinicInputClass()} value={form.medication} onChange={(e) => setForm({ ...form, medication: e.target.value })} /></ClinicField>
          <ClinicField label="Dosage"><input className={clinicInputClass()} value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} /></ClinicField>
          <ClinicField label="Frequency"><input className={clinicInputClass()} value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} /></ClinicField>
          <ClinicField label="Duration"><input className={clinicInputClass()} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></ClinicField>
          <div className="sm:col-span-2">
            <ClinicField label="Instructions">
              <textarea className={clinicInputClass()} rows={2} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
            </ClinicField>
          </div>
        </div>
      </ClinicModal>

      <ClinicModal
        isOpen={!!preview}
        onClose={() => setPreview(null)}
        title="Prescription Preview"
        maxWidth="max-w-xl"
        actions={
          <>
            <ClinicButton variant="secondary" onClick={() => setPreview(null)}>Close</ClinicButton>
            <ClinicButton onClick={() => window.print()}><Printer className="w-4 h-4" /> Print</ClinicButton>
          </>
        }
      >
        {preview && (
          <div className="border border-teal-100 rounded-2xl p-6 bg-white print:border-0">
            <div className="flex items-start justify-between border-b border-teal-100 pb-4 mb-4">
              <div>
                <p className="text-lg font-extrabold text-teal-800">{store.settings.clinicName}</p>
                <p className="text-xs text-slate-500">{store.settings.tagline}</p>
                <p className="text-xs text-slate-500 mt-1">{store.settings.address}, {store.settings.city}</p>
                <p className="text-xs text-slate-500">{store.settings.phone} · {store.settings.email}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold">
                {store.settings.logoText}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div>
                <p className="text-slate-500">Patient</p>
                <p className="font-semibold">{fullPatientName(store.patients.find((p) => p.id === preview.patientId))}</p>
              </div>
              <div>
                <p className="text-slate-500">Date</p>
                <p className="font-semibold">{formatDate(preview.date)}</p>
              </div>
              <div>
                <p className="text-slate-500">Rx No.</p>
                <p className="font-semibold">{preview.id}</p>
              </div>
              <div>
                <p className="text-slate-500">Clinician</p>
                <p className="font-semibold">{clinicianName(preview.clinicianId)}</p>
              </div>
            </div>
            <div className="rounded-xl bg-teal-50/60 border border-teal-100 p-4">
              <p className="text-2xl font-serif text-teal-900 mb-2">℞</p>
              <p className="text-sm font-bold text-slate-900">{preview.medication} — {preview.dosage}</p>
              <p className="text-xs text-slate-600 mt-1">{preview.frequency} for {preview.duration}</p>
              <p className="text-xs text-slate-600 mt-2">Instructions: {preview.instructions}</p>
            </div>
            <p className="text-[11px] text-slate-400 mt-6">This is a frontend demo prescription preview.</p>
          </div>
        )}
      </ClinicModal>
    </ClinicPage>
  );
}
