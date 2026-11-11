'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from 'react';
import { PhoneCall, Plus, MessageCircle, Mail, Smartphone, CheckCircle2, CalendarClock } from 'lucide-react';
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
  ClinicButton,
  ClinicModal,
  ClinicTabs,
  ClinicField,
  ClinicPagination,
  clinicInputClass,
} from '../ui';
import { useClinicStore, fullPatientName, nextId } from '../_lib/store';
import { formatDate } from '../_lib/format';
import type { FollowUp, FollowUpStatus, Priority } from '../_lib/types';

const TABS = ['Upcoming', 'Missed Appointment', 'Post-treatment', 'Pending', 'Overdue', 'Completed'];

export default function FollowUpsPage() {
  const store = useClinicStore();
  const [tab, setTab] = useState('Upcoming');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FollowUp | null>(null);
  const [form, setForm] = useState({
    patientId: '',
    assignedStaffId: 'ST-002',
    date: '',
    type: 'Upcoming' as FollowUp['type'],
    contactMethod: 'WhatsApp' as FollowUp['contactMethod'],
    notes: '',
    priority: 'Medium' as Priority,
    status: 'Upcoming' as FollowUpStatus,
  });
  const pageSize = 8;

  const filtered = useMemo(() => {
    return store.followUps.filter((f) => {
      const patient = store.patients.find((p) => p.id === f.patientId);
      const matchTab =
        tab === 'Overdue'
          ? f.status === 'Overdue'
          : tab === 'Completed'
          ? f.status === 'Completed'
          : tab === 'Missed Appointment'
          ? f.type === 'Missed Appointment' || f.status === 'Missed'
          : f.type === tab || f.status === tab;
      const hay = `${fullPatientName(patient)} ${f.notes}`.toLowerCase();
      return matchTab && (!q || hay.includes(q.toLowerCase()));
    });
  }, [store, tab, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setEditing(null);
    setForm({
      patientId: store.patients[0]?.id || '',
      assignedStaffId: 'ST-002',
      date: new Date().toISOString().slice(0, 10),
      type: 'Upcoming',
      contactMethod: 'WhatsApp',
      notes: '',
      priority: 'Medium',
      status: 'Upcoming',
    });
    setOpen(true);
  };

  const save = () => {
    if (!form.patientId || !form.date) {
      toast.error('Patient and date are required');
      return;
    }
    const payload: FollowUp = {
      id: editing?.id || nextId('FU', store.followUps),
      ...form,
    };
    store.update((prev) => ({
      ...prev,
      followUps: editing
        ? prev.followUps.map((f) => (f.id === editing.id ? payload : f))
        : [payload, ...prev.followUps],
    }));
    toast.success(editing ? 'Follow-up updated' : 'Follow-up scheduled');
    setOpen(false);
  };

  const complete = (id: string) => {
    store.update((prev) => ({
      ...prev,
      followUps: prev.followUps.map((f) =>
        f.id === id ? { ...f, status: 'Completed' as FollowUpStatus } : f
      ),
    }));
    toast.success('Follow-up completed');
  };

  const remind = (channel: string, patientName: string) => {
    toast.success(`${channel} reminder queued for ${patientName}`);
  };

  return (
    <ClinicPage>
      <ClinicMockBanner />
      <ClinicPageHeader
        title="Follow-up Management"
        subtitle="Callbacks, missed visits and post-treatment check-ins"
        icon={<PhoneCall className="w-5 h-5 text-white" />}
        actions={
          <ClinicButton onClick={openCreate}>
            <Plus className="w-4 h-4" /> Schedule Follow-up
          </ClinicButton>
        }
      />

      <ClinicCard>
        <ClinicTabs tabs={TABS} active={tab} onChange={(t) => { setTab(t); setPage(1); }} />
        <div className="mt-4 mb-4">
          <ClinicSearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search follow-ups…" />
        </div>
        <ClinicTable>
          <ClinicTableHeader columns={['Patient', 'Assigned', 'Date', 'Type', 'Method', 'Priority', 'Status', 'Notes', 'Actions']} />
          <ClinicTableBody>
            {rows.map((f) => {
              const patient = store.patients.find((p) => p.id === f.patientId);
              const staff =
                store.staff.find((s) => s.id === f.assignedStaffId)?.name ||
                store.therapists.find((t) => t.id === f.assignedStaffId)?.name ||
                f.assignedStaffId;
              const name = fullPatientName(patient);
              return (
                <ClinicTableRow key={f.id}>
                  <ClinicTableCell className="font-medium">{name}</ClinicTableCell>
                  <ClinicTableCell>{staff}</ClinicTableCell>
                  <ClinicTableCell>{formatDate(f.date)}</ClinicTableCell>
                  <ClinicTableCell>{f.type}</ClinicTableCell>
                  <ClinicTableCell>{f.contactMethod}</ClinicTableCell>
                  <ClinicTableCell><ClinicStatusBadge status={f.priority} /></ClinicTableCell>
                  <ClinicTableCell><ClinicStatusBadge status={f.status} /></ClinicTableCell>
                  <ClinicTableCell className="max-w-[180px] truncate">{f.notes}</ClinicTableCell>
                  <ClinicTableCell>
                    <div className="flex gap-1">
                      <button type="button" title="WhatsApp" className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-700" onClick={() => remind('WhatsApp', name)}><MessageCircle className="w-3.5 h-3.5" /></button>
                      <button type="button" title="SMS" className="p-1.5 rounded-lg hover:bg-sky-50 text-sky-700" onClick={() => remind('SMS', name)}><Smartphone className="w-3.5 h-3.5" /></button>
                      <button type="button" title="Email" className="p-1.5 rounded-lg hover:bg-violet-50 text-violet-700" onClick={() => remind('Email', name)}><Mail className="w-3.5 h-3.5" /></button>
                      <button type="button" title="Reschedule" className="p-1.5 rounded-lg hover:bg-teal-50 text-teal-700" onClick={() => { setEditing(f); setForm({ ...f }); setOpen(true); }}><CalendarClock className="w-3.5 h-3.5" /></button>
                      {f.status !== 'Completed' && (
                        <button type="button" title="Complete" className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-700" onClick={() => complete(f.id)}><CheckCircle2 className="w-3.5 h-3.5" /></button>
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
        title={editing ? 'Reschedule Follow-up' : 'Schedule Follow-up'}
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
          <ClinicField label="Assigned staff">
            <select className={clinicInputClass()} value={form.assignedStaffId} onChange={(e) => setForm({ ...form, assignedStaffId: e.target.value })}>
              {store.staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </ClinicField>
          <ClinicField label="Follow-up date"><input type="date" className={clinicInputClass()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></ClinicField>
          <ClinicField label="Type">
            <select className={clinicInputClass()} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as FollowUp['type'] })}>
              {['Upcoming', 'Missed Appointment', 'Post-treatment', 'Pending', 'Overdue'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </ClinicField>
          <ClinicField label="Contact method">
            <select className={clinicInputClass()} value={form.contactMethod} onChange={(e) => setForm({ ...form, contactMethod: e.target.value as FollowUp['contactMethod'] })}>
              {['Phone', 'WhatsApp', 'SMS', 'Email', 'In Person'].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </ClinicField>
          <ClinicField label="Priority">
            <select className={clinicInputClass()} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
              {['Low', 'Medium', 'High', 'Urgent'].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </ClinicField>
          <div className="sm:col-span-2">
            <ClinicField label="Notes">
              <textarea className={clinicInputClass()} rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </ClinicField>
          </div>
        </div>
      </ClinicModal>
    </ClinicPage>
  );
}
