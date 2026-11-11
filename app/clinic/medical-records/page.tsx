'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from 'react';
import { Shield, FilePlus, Eye } from 'lucide-react';
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
  ClinicDrawer,
  ClinicField,
  clinicInputClass,
  ClinicTable,
  ClinicTableHeader,
  ClinicTableBody,
  ClinicTableRow,
  ClinicTableCell,
  ClinicPagination,
  ClinicEmptyState,
} from '../ui';
import { useClinicStore, fullPatientName as patientName, nextId } from '../_lib/store';
import { formatDate, todayIso } from '../_lib/format';
import type { MedicalRecord } from '../_lib/types';

const PAGE_SIZE = 10;
const RECORD_TYPES: MedicalRecord['type'][] = [
  'History',
  'Diagnosis',
  'Vital Signs',
  'Lab Report',
  'Assessment',
  'Document',
];

export default function MedicalRecordsPage() {
  const { patients, medicalRecords, therapists, update } = useClinicStore();
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState<MedicalRecord | null>(null);
  const [drawerTab, setDrawerTab] = useState('Summary');
  const [form, setForm] = useState<Partial<MedicalRecord>>({
    type: 'Assessment',
    title: '',
    date: todayIso(),
    recordedBy: therapists[0]?.name || 'Staff',
    summary: '',
    details: '',
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return medicalRecords
      .filter((r) => !patientId || r.patientId === patientId)
      .filter((r) => typeFilter === 'all' || r.type === typeFilter)
      .filter((r) => !q || r.title.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [medicalRecords, patientId, typeFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const saveRecord = () => {
    if (!patientId || !form.title?.trim() || !form.summary?.trim()) {
      toast.error('Patient, title, and summary required');
      return;
    }
    const record: MedicalRecord = {
      id: nextId('MR', medicalRecords),
      patientId,
      type: form.type || 'Assessment',
      title: form.title,
      date: form.date || todayIso(),
      recordedBy: form.recordedBy || 'Clinic staff',
      summary: form.summary,
      details: form.details,
    };
    update((s) => ({ ...s, medicalRecords: [...s.medicalRecords, record] }));
    toast.success('Medical record saved');
    setCreateOpen(false);
    setForm({ type: 'Assessment', title: '', date: todayIso(), recordedBy: therapists[0]?.name || 'Staff', summary: '', details: '' });
  };

  const selectedPatient = patients.find((p) => p.id === patientId);

  return (
    <ClinicPage>
      <ClinicMockBanner />
      <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex gap-3 items-start text-xs text-sky-950">
        <Shield className="w-5 h-5 text-sky-700 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Privacy-aware charting</p>
          <p className="mt-1 text-sky-800/90">Records are scoped to the selected patient. Access is logged in the demo audit trail.</p>
        </div>
      </div>

      <ClinicPageHeader
        title="Medical Records"
        subtitle="Structured history, vitals, labs, and clinical documents"
        icon={<Shield className="w-5 h-5 text-white" />}
        actions={
          <ClinicButton onClick={() => setCreateOpen(true)}>
            <FilePlus className="w-3.5 h-3.5" /> New Record
          </ClinicButton>
        }
      />

      <ClinicCard title="Patient context" noPadding>
        <div className="p-5 flex flex-col md:flex-row gap-4 md:items-end">
          <ClinicField label="Select patient">
            <ClinicSelect
              value={patientId}
              onChange={(v) => {
                setPatientId(v);
                setPage(1);
              }}
              options={patients.map((p) => ({ value: p.id, label: `${p.id} — ${patientName(p)}` }))}
              className="w-full md:w-96"
            />
          </ClinicField>
          {selectedPatient && (
            <p className="text-xs text-slate-600 pb-2">
              Viewing chart for <strong>{patientName(selectedPatient)}</strong> ({selectedPatient.city})
            </p>
          )}
        </div>
      </ClinicCard>

      <ClinicCard title="Records" noPadding>
        <div className="p-5 flex flex-wrap gap-3 justify-between">
          <ClinicSearchInput value={search} onChange={setSearch} placeholder="Search title or summary…" />
          <ClinicSelect
            value={typeFilter}
            onChange={(v) => {
              setTypeFilter(v);
              setPage(1);
            }}
            options={[{ value: 'all', label: 'All types' }, ...RECORD_TYPES.map((t) => ({ value: t, label: t }))]}
          />
        </div>
        {paged.length === 0 ? (
          <ClinicEmptyState title="No records" action={<ClinicButton onClick={() => setCreateOpen(true)}>Create record</ClinicButton>} />
        ) : (
          <>
            <ClinicTable>
              <ClinicTableHeader columns={['Type', 'Title', 'Date', 'Recorded by', 'Summary', '']} />
              <ClinicTableBody>
                {paged.map((r) => (
                  <ClinicTableRow key={r.id}>
                    <ClinicTableCell>{r.type}</ClinicTableCell>
                    <ClinicTableCell className="font-semibold">{r.title}</ClinicTableCell>
                    <ClinicTableCell>{formatDate(r.date)}</ClinicTableCell>
                    <ClinicTableCell>{r.recordedBy}</ClinicTableCell>
                    <ClinicTableCell className="max-w-md truncate">{r.summary}</ClinicTableCell>
                    <ClinicTableCell>
                      <button type="button" onClick={() => { setDetail(r); setDrawerTab('Summary'); }} className="p-1.5 rounded-lg hover:bg-teal-50 text-teal-700">
                        <Eye className="w-4 h-4" />
                      </button>
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
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create medical record"
        actions={
          <>
            <ClinicButton variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</ClinicButton>
            <ClinicButton onClick={saveRecord}>Save record</ClinicButton>
          </>
        }
      >
        <div className="grid gap-4">
          <ClinicField label="Type">
            <ClinicSelect value={form.type || 'Assessment'} onChange={(v) => setForm({ ...form, type: v as MedicalRecord['type'] })} options={RECORD_TYPES.map((t) => ({ value: t, label: t }))} className="w-full" />
          </ClinicField>
          <ClinicField label="Title" required>
            <input className={clinicInputClass()} value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </ClinicField>
          <ClinicField label="Date">
            <input type="date" className={clinicInputClass()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </ClinicField>
          <ClinicField label="Recorded by">
            <input className={clinicInputClass()} value={form.recordedBy || ''} onChange={(e) => setForm({ ...form, recordedBy: e.target.value })} />
          </ClinicField>
          <ClinicField label="Summary" required>
            <textarea className={clinicInputClass() + ' min-h-[80px]'} value={form.summary || ''} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          </ClinicField>
          <ClinicField label="Clinical details">
            <textarea className={clinicInputClass() + ' min-h-[120px]'} value={form.details || ''} onChange={(e) => setForm({ ...form, details: e.target.value })} />
          </ClinicField>
        </div>
      </ClinicModal>

      <ClinicDrawer
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.title || 'Record'}
        subtitle={detail ? `${detail.type} · ${formatDate(detail.date)}` : ''}
        tabs={['Summary', 'Full detail']}
        activeTab={drawerTab}
        onTabChange={setDrawerTab}
      >
        {detail && (
          <div className="space-y-4 text-sm text-slate-700">
            <p><strong>Patient:</strong> {patientName(patients.find((p) => p.id === detail.patientId))}</p>
            <p><strong>Recorded by:</strong> {detail.recordedBy}</p>
            {drawerTab === 'Summary' ? (
              <p className="leading-relaxed">{detail.summary}</p>
            ) : (
              detail.details && <div className="p-4 rounded-xl bg-slate-50 border text-xs whitespace-pre-wrap">{detail.details}</div>
            )}
            {drawerTab === 'Full detail' && !detail.details && (
              <p className="text-slate-500 text-xs">No extended clinical detail on file.</p>
            )}
          </div>
        )}
      </ClinicDrawer>
    </ClinicPage>
  );
}
