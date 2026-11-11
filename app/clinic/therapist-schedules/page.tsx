'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from 'react';
import { CalendarClock, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ClinicPage,
  ClinicMockBanner,
  ClinicPageHeader,
  ClinicCard,
  ClinicStatusBadge,
  ClinicSelect,
  ClinicButton,
  ClinicModal,
  ClinicField,
  clinicInputClass,
} from '../ui';
import { useClinicStore } from '../_lib/store';
import type { TherapistSchedule } from '../_lib/types';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TherapistSchedulesPage() {
  const store = useClinicStore();
  const [therapistId, setTherapistId] = useState(store.therapists[0]?.id || '');
  const [editing, setEditing] = useState<TherapistSchedule | null>(null);
  const [form, setForm] = useState({
    startTime: '09:00',
    endTime: '17:00',
    breakStart: '13:00',
    breakEnd: '14:00',
    isOff: false,
    maxSessions: 8,
    roomId: '',
  });

  const rows = useMemo(
    () =>
      store.schedules
        .filter((s) => s.therapistId === therapistId)
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek),
    [store.schedules, therapistId]
  );

  const openEdit = (sch: TherapistSchedule) => {
    setEditing(sch);
    setForm({
      startTime: sch.startTime,
      endTime: sch.endTime,
      breakStart: sch.breakStart || '',
      breakEnd: sch.breakEnd || '',
      isOff: sch.isOff,
      maxSessions: sch.maxSessions,
      roomId: sch.roomId || '',
    });
  };

  const save = () => {
    if (!editing) return;
    store.update((prev) => ({
      ...prev,
      schedules: prev.schedules.map((s) =>
        s.id === editing.id
          ? {
              ...s,
              startTime: form.startTime,
              endTime: form.endTime,
              breakStart: form.breakStart || undefined,
              breakEnd: form.breakEnd || undefined,
              isOff: form.isOff,
              maxSessions: Number(form.maxSessions),
              roomId: form.roomId || undefined,
            }
          : s
      ),
    }));
    toast.success('Schedule updated');
    setEditing(null);
  };

  const applyTemplate = () => {
    store.update((prev) => ({
      ...prev,
      schedules: prev.schedules.map((s) =>
        s.therapistId === therapistId
          ? {
              ...s,
              startTime: s.dayOfWeek === 6 ? '10:00' : '09:00',
              endTime: s.dayOfWeek === 6 ? '14:00' : '17:00',
              breakStart: s.dayOfWeek === 6 ? undefined : '13:00',
              breakEnd: s.dayOfWeek === 6 ? undefined : '14:00',
              isOff: false,
              maxSessions: s.dayOfWeek === 6 ? 4 : 8,
            }
          : s
      ),
    }));
    toast.success('Standard weekly template applied');
  };

  return (
    <ClinicPage>
      <ClinicMockBanner />
      <ClinicPageHeader
        title="Therapist Schedules"
        subtitle="Weekly working hours, breaks, offs and room assignments"
        icon={<CalendarClock className="w-5 h-5 text-white" />}
        actions={
          <ClinicButton variant="secondary" onClick={applyTemplate}>
            <Copy className="w-4 h-4" /> Apply Template
          </ClinicButton>
        }
      />

      <ClinicCard
        title="Weekly Timetable"
        action={
          <ClinicSelect
            value={therapistId}
            onChange={setTherapistId}
            options={store.therapists.map((t) => ({ value: t.id, label: t.name }))}
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {rows.map((sch) => {
            const room = store.rooms.find((r) => r.id === sch.roomId);
            return (
              <button
                key={sch.id}
                type="button"
                onClick={() => openEdit(sch)}
                className={`text-left rounded-2xl border p-4 transition-all hover:shadow-md ${
                  sch.isOff ? 'border-rose-200 bg-rose-50/50' : 'border-teal-100 bg-teal-50/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-slate-900">{DAYS[sch.dayOfWeek - 1]}</p>
                  <ClinicStatusBadge status={sch.isOff ? 'Weekly Off' : 'Available'} />
                </div>
                {sch.isOff ? (
                  <p className="text-xs text-slate-500">Marked as off / leave</p>
                ) : (
                  <div className="space-y-1 text-xs text-slate-600">
                    <p>Shift: <strong>{sch.startTime}–{sch.endTime}</strong></p>
                    <p>Break: {sch.breakStart ? `${sch.breakStart}–${sch.breakEnd}` : '—'}</p>
                    <p>Max sessions: {sch.maxSessions}</p>
                    <p>Room: {room?.name || 'Unassigned'}</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </ClinicCard>

      <ClinicModal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        title={`Edit ${editing ? DAYS[editing.dayOfWeek - 1] : ''} Schedule`}
        actions={
          <>
            <ClinicButton variant="secondary" onClick={() => setEditing(null)}>Cancel</ClinicButton>
            <ClinicButton onClick={save}>Save</ClinicButton>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ClinicField label="Start time"><input type="time" className={clinicInputClass()} value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></ClinicField>
          <ClinicField label="End time"><input type="time" className={clinicInputClass()} value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></ClinicField>
          <ClinicField label="Break start"><input type="time" className={clinicInputClass()} value={form.breakStart} onChange={(e) => setForm({ ...form, breakStart: e.target.value })} /></ClinicField>
          <ClinicField label="Break end"><input type="time" className={clinicInputClass()} value={form.breakEnd} onChange={(e) => setForm({ ...form, breakEnd: e.target.value })} /></ClinicField>
          <ClinicField label="Max daily sessions"><input type="number" className={clinicInputClass()} value={form.maxSessions} onChange={(e) => setForm({ ...form, maxSessions: Number(e.target.value) })} /></ClinicField>
          <ClinicField label="Assigned room">
            <select className={clinicInputClass()} value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })}>
              <option value="">Unassigned</option>
              {store.rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </ClinicField>
          <div className="sm:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.isOff} onChange={(e) => setForm({ ...form, isOff: e.target.checked })} />
              Weekly off / unavailable
            </label>
          </div>
        </div>
      </ClinicModal>
    </ClinicPage>
  );
}
