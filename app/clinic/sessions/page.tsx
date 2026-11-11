'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, Play, Pause, CheckCircle, Plus, Eye } from 'lucide-react';
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
import { useClinicStore, fullPatientName, therapistById, serviceById, nextId } from '../_lib/store';
import { formatDate, todayIso } from '../_lib/format';
import type { SessionStatus, TherapySession } from '../_lib/types';

const PAGE_SIZE = 10;

export default function SessionsPage() {
  const store = useClinicStore();
  const { sessions, patients, therapists, services, update } = store;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [therapistFilter, setTherapistFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<Partial<TherapySession>>({
    patientId: patients[0]?.id,
    therapistId: therapists[0]?.id,
    serviceId: services[0]?.id,
    date: todayIso(),
    startTime: '10:00',
    endTime: '10:40',
    durationMinutes: 40,
    status: 'Scheduled',
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sessions
      .filter((s) => statusFilter === 'all' || s.status === statusFilter)
      .filter((s) => therapistFilter === 'all' || s.therapistId === therapistFilter)
      .filter((s) => {
        if (!q) return true;
        const p = patients.find((x) => x.id === s.patientId);
        const name = p ? fullPatientName(p).toLowerCase() : '';
        return name.includes(q) || s.id.toLowerCase().includes(q);
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [sessions, search, statusFilter, therapistFilter, patients]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const setStatus = (id: string, status: SessionStatus) => {
    update((s) => ({
      ...s,
      sessions: s.sessions.map((x) => (x.id === id ? { ...x, status } : x)),
    }));
    toast.success(`Session ${status.toLowerCase()}`);
  };

  const createSession = () => {
    if (!form.patientId || !form.therapistId || !form.serviceId) {
      toast.error('Patient, therapist, and service required');
      return;
    }
    const session: TherapySession = {
      id: nextId('SES', sessions),
      patientId: form.patientId,
      therapistId: form.therapistId,
      serviceId: form.serviceId,
      date: form.date || todayIso(),
      startTime: form.startTime || '10:00',
      endTime: form.endTime || '10:40',
      durationMinutes: form.durationMinutes || 40,
      status: 'Scheduled',
    };
    update((s) => ({ ...s, sessions: [...s.sessions, session] }));
    toast.success('Session scheduled');
    setCreateOpen(false);
  };

  return (
    <ClinicPage>
      <ClinicMockBanner />
      <ClinicPageHeader
        title="Therapy Sessions"
        subtitle="Start, pause, and complete clinical session documentation"
        icon={<ClipboardList className="w-5 h-5 text-white" />}
        actions={<ClinicButton onClick={() => setCreateOpen(true)}><Plus className="w-3.5 h-3.5" /> New Session</ClinicButton>}
      />

      <ClinicCard noPadding>
        <div className="p-5 flex flex-wrap gap-3">
          <ClinicSearchInput value={search} onChange={setSearch} placeholder="Search patient or session ID…" />
          <ClinicSelect value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} options={[{ value: 'all', label: 'All status' }, 'Scheduled', 'In Progress', 'Paused', 'Completed', 'Cancelled'].map((x) => (typeof x === 'string' ? { value: x, label: x } : x))} />
          <ClinicSelect value={therapistFilter} onChange={(v) => { setTherapistFilter(v); setPage(1); }} options={[{ value: 'all', label: 'All therapists' }, ...therapists.map((t) => ({ value: t.id, label: t.name }))]} />
        </div>
        {paged.length === 0 ? (
          <ClinicEmptyState title="No sessions" action={<ClinicButton onClick={() => setCreateOpen(true)}>Schedule session</ClinicButton>} />
        ) : (
          <>
            <ClinicTable>
              <ClinicTableHeader columns={['ID', 'Date', 'Patient', 'Service', 'Therapist', 'Status', 'Actions']} />
              <ClinicTableBody>
                {paged.map((ses) => {
                  const patient = patients.find((p) => p.id === ses.patientId);
                  return (
                    <ClinicTableRow key={ses.id}>
                      <ClinicTableCell className="font-mono text-[11px]">{ses.id}</ClinicTableCell>
                      <ClinicTableCell>{formatDate(ses.date)}</ClinicTableCell>
                      <ClinicTableCell className="font-medium">{patient ? fullPatientName(patient) : ses.patientId}</ClinicTableCell>
                      <ClinicTableCell>{serviceById(ses.serviceId, services)?.name}</ClinicTableCell>
                      <ClinicTableCell>{therapistById(ses.therapistId, therapists)?.name}</ClinicTableCell>
                      <ClinicTableCell><ClinicStatusBadge status={ses.status} /></ClinicTableCell>
                      <ClinicTableCell>
                        <div className="flex flex-wrap gap-1 items-center">
                          <Link href={`/clinic/sessions/${ses.id}`} className="p-1.5 rounded-lg hover:bg-teal-50 text-teal-700" title="Open">
                            <Eye className="w-4 h-4" />
                          </Link>
                          {ses.status === 'Scheduled' && (
                            <button type="button" onClick={() => setStatus(ses.id, 'In Progress')} className="p-1.5 rounded-lg hover:bg-sky-50 text-sky-700" title="Start"><Play className="w-4 h-4" /></button>
                          )}
                          {ses.status === 'In Progress' && (
                            <>
                              <button type="button" onClick={() => setStatus(ses.id, 'Paused')} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-700" title="Pause"><Pause className="w-4 h-4" /></button>
                              <button type="button" onClick={() => setStatus(ses.id, 'Completed')} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-700" title="Complete"><CheckCircle className="w-4 h-4" /></button>
                            </>
                          )}
                          {ses.status === 'Paused' && (
                            <button type="button" onClick={() => setStatus(ses.id, 'In Progress')} className="p-1.5 rounded-lg hover:bg-sky-50 text-sky-700" title="Resume"><Play className="w-4 h-4" /></button>
                          )}
                        </div>
                      </ClinicTableCell>
                    </ClinicTableRow>
                  );
                })}
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
        title="Schedule therapy session"
        actions={
          <>
            <ClinicButton variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</ClinicButton>
            <ClinicButton onClick={createSession}>Create</ClinicButton>
          </>
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <ClinicField label="Patient">
            <ClinicSelect value={form.patientId || ''} onChange={(v) => setForm({ ...form, patientId: v })} options={patients.map((p) => ({ value: p.id, label: fullPatientName(p) }))} className="w-full" />
          </ClinicField>
          <ClinicField label="Therapist">
            <ClinicSelect value={form.therapistId || ''} onChange={(v) => setForm({ ...form, therapistId: v })} options={therapists.map((t) => ({ value: t.id, label: t.name }))} className="w-full" />
          </ClinicField>
          <ClinicField label="Service">
            <ClinicSelect value={form.serviceId || ''} onChange={(v) => setForm({ ...form, serviceId: v })} options={services.map((s) => ({ value: s.id, label: s.name }))} className="w-full" />
          </ClinicField>
          <ClinicField label="Date">
            <input type="date" className={clinicInputClass()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </ClinicField>
          <ClinicField label="Start">
            <input type="time" className={clinicInputClass()} value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
          </ClinicField>
          <ClinicField label="End">
            <input type="time" className={clinicInputClass()} value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          </ClinicField>
        </div>
      </ClinicModal>
    </ClinicPage>
  );
}
