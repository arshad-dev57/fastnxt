'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from 'react';
import { ClipboardList, Plus, Pause, CheckCircle2, Pencil } from 'lucide-react';
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
  ClinicProgress,
  clinicInputClass,
} from '../ui';
import { useClinicStore, fullPatientName, nextId } from '../_lib/store';
import { formatDate } from '../_lib/format';
import type { TreatmentPlan, TreatmentPlanStatus } from '../_lib/types';

const emptyForm = {
  patientId: '',
  therapistId: '',
  diagnosis: '',
  objectives: '',
  totalSessions: 10,
  completedSessions: 0,
  startDate: '',
  expectedEndDate: '',
  status: 'Active' as TreatmentPlanStatus,
  notes: '',
};

export default function TreatmentPlansPage() {
  const store = useClinicStore();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TreatmentPlan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const pageSize = 8;

  const filtered = useMemo(() => {
    return store.treatmentPlans.filter((p) => {
      const patient = store.patients.find((x) => x.id === p.patientId);
      const name = fullPatientName(patient).toLowerCase();
      const matchQ =
        !q ||
        name.includes(q.toLowerCase()) ||
        p.diagnosis.toLowerCase().includes(q.toLowerCase()) ||
        p.id.toLowerCase().includes(q.toLowerCase());
      const matchS = status === 'All' || p.status === status;
      return matchQ && matchS;
    });
  }, [store, q, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      patientId: store.patients[0]?.id || '',
      therapistId: store.therapists[0]?.id || '',
      startDate: new Date().toISOString().slice(0, 10),
      expectedEndDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    });
    setOpen(true);
  };

  const openEdit = (plan: TreatmentPlan) => {
    setEditing(plan);
    setForm({
      patientId: plan.patientId,
      therapistId: plan.therapistId,
      diagnosis: plan.diagnosis,
      objectives: plan.objectives.join('\n'),
      totalSessions: plan.totalSessions,
      completedSessions: plan.completedSessions,
      startDate: plan.startDate,
      expectedEndDate: plan.expectedEndDate,
      status: plan.status,
      notes: plan.notes || '',
    });
    setOpen(true);
  };

  const save = () => {
    if (!form.patientId || !form.diagnosis.trim()) {
      toast.error('Patient and diagnosis are required');
      return;
    }
    const progress = Math.round(
      (Number(form.completedSessions) / Math.max(1, Number(form.totalSessions))) * 100
    );
    const payload: TreatmentPlan = {
      id: editing?.id || nextId('TP', store.treatmentPlans),
      patientId: form.patientId,
      therapistId: form.therapistId,
      diagnosis: form.diagnosis.trim(),
      objectives: form.objectives
        .split('\n')
        .map((o) => o.trim())
        .filter(Boolean),
      recommendedTherapyIds: editing?.recommendedTherapyIds || ['SRV-002'],
      totalSessions: Number(form.totalSessions),
      completedSessions: Number(form.completedSessions),
      startDate: form.startDate,
      expectedEndDate: form.expectedEndDate,
      progressPercent: progress,
      status: form.status,
      notes: form.notes,
    };
    store.update((prev) => ({
      ...prev,
      treatmentPlans: editing
        ? prev.treatmentPlans.map((p) => (p.id === editing.id ? payload : p))
        : [payload, ...prev.treatmentPlans],
    }));
    toast.success(editing ? 'Treatment plan updated' : 'Treatment plan created');
    setOpen(false);
  };

  const setPlanStatus = (id: string, next: TreatmentPlanStatus) => {
    store.update((prev) => ({
      ...prev,
      treatmentPlans: prev.treatmentPlans.map((p) =>
        p.id === id
          ? {
              ...p,
              status: next,
              progressPercent:
                next === 'Completed' ? 100 : p.progressPercent,
              completedSessions:
                next === 'Completed' ? p.totalSessions : p.completedSessions,
            }
          : p
      ),
    }));
    toast.success(`Plan marked ${next}`);
  };

  return (
    <ClinicPage>
      <ClinicMockBanner />
      <ClinicPageHeader
        title="Treatment Plans"
        subtitle="Care pathways, session targets and recovery progress"
        icon={<ClipboardList className="w-5 h-5 text-white" />}
        actions={
          <ClinicButton onClick={openCreate}>
            <Plus className="w-4 h-4" /> Create Plan
          </ClinicButton>
        }
      />

      <ClinicCard>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <ClinicSearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search plans, patients, diagnosis…" />
          <ClinicSelect
            value={status}
            onChange={(v) => { setStatus(v); setPage(1); }}
            options={['All', 'Draft', 'Active', 'Paused', 'Completed', 'Cancelled'].map((s) => ({
              value: s,
              label: s === 'All' ? 'All statuses' : s,
            }))}
          />
        </div>

        <ClinicTable>
          <ClinicTableHeader
            columns={['Plan', 'Patient', 'Therapist', 'Diagnosis', 'Sessions', 'Progress', 'Dates', 'Status', 'Actions']}
          />
          <ClinicTableBody>
            {rows.map((plan) => {
              const patient = store.patients.find((p) => p.id === plan.patientId);
              const therapist = store.therapists.find((t) => t.id === plan.therapistId);
              return (
                <ClinicTableRow key={plan.id}>
                  <ClinicTableCell className="font-semibold text-slate-900">{plan.id}</ClinicTableCell>
                  <ClinicTableCell>{fullPatientName(patient)}</ClinicTableCell>
                  <ClinicTableCell>{therapist?.name || '—'}</ClinicTableCell>
                  <ClinicTableCell className="max-w-[180px] truncate">{plan.diagnosis}</ClinicTableCell>
                  <ClinicTableCell>
                    {plan.completedSessions}/{plan.totalSessions}
                    <span className="text-slate-400"> · {plan.totalSessions - plan.completedSessions} left</span>
                  </ClinicTableCell>
                  <ClinicTableCell className="min-w-[140px]">
                    <ClinicProgress value={plan.progressPercent} />
                  </ClinicTableCell>
                  <ClinicTableCell className="whitespace-nowrap text-xs">
                    {formatDate(plan.startDate)} → {formatDate(plan.expectedEndDate)}
                  </ClinicTableCell>
                  <ClinicTableCell>
                    <ClinicStatusBadge status={plan.status} />
                  </ClinicTableCell>
                  <ClinicTableCell>
                    <div className="flex items-center gap-1">
                      <button type="button" className="p-1.5 rounded-lg hover:bg-teal-50 text-teal-700" onClick={() => openEdit(plan)} title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {plan.status === 'Active' && (
                        <button type="button" className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-700" onClick={() => setPlanStatus(plan.id, 'Paused')} title="Pause">
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {plan.status !== 'Completed' && (
                        <button type="button" className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-700" onClick={() => setPlanStatus(plan.id, 'Completed')} title="Complete">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
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
        title={editing ? 'Edit Treatment Plan' : 'Create Treatment Plan'}
        actions={
          <>
            <ClinicButton variant="secondary" onClick={() => setOpen(false)}>Cancel</ClinicButton>
            <ClinicButton onClick={save}>Save Plan</ClinicButton>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ClinicField label="Patient" required>
            <select className={clinicInputClass()} value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
              {store.patients.map((p) => (
                <option key={p.id} value={p.id}>{fullPatientName(p)}</option>
              ))}
            </select>
          </ClinicField>
          <ClinicField label="Therapist" required>
            <select className={clinicInputClass()} value={form.therapistId} onChange={(e) => setForm({ ...form, therapistId: e.target.value })}>
              {store.therapists.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </ClinicField>
          <ClinicField label="Diagnosis / Condition" required>
            <input className={clinicInputClass()} value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
          </ClinicField>
          <ClinicField label="Status">
            <select className={clinicInputClass()} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TreatmentPlanStatus })}>
              {['Draft', 'Active', 'Paused', 'Completed', 'Cancelled'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </ClinicField>
          <ClinicField label="Total planned sessions">
            <input type="number" className={clinicInputClass()} value={form.totalSessions} onChange={(e) => setForm({ ...form, totalSessions: Number(e.target.value) })} />
          </ClinicField>
          <ClinicField label="Sessions completed">
            <input type="number" className={clinicInputClass()} value={form.completedSessions} onChange={(e) => setForm({ ...form, completedSessions: Number(e.target.value) })} />
          </ClinicField>
          <ClinicField label="Start date">
            <input type="date" className={clinicInputClass()} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </ClinicField>
          <ClinicField label="Expected end date">
            <input type="date" className={clinicInputClass()} value={form.expectedEndDate} onChange={(e) => setForm({ ...form, expectedEndDate: e.target.value })} />
          </ClinicField>
          <div className="sm:col-span-2">
            <ClinicField label="Objectives (one per line)">
              <textarea className={clinicInputClass()} rows={3} value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} />
            </ClinicField>
          </div>
          <div className="sm:col-span-2">
            <ClinicField label="Notes">
              <textarea className={clinicInputClass()} rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </ClinicField>
          </div>
        </div>
      </ClinicModal>
    </ClinicPage>
  );
}
