'use client';

export const dynamic = 'force-dynamic';

import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Plus,
  AlertCircle,
  Bell,
  Repeat,
  UserRound,
} from 'lucide-react';
import {
  ClinicPage,
  ClinicMockBanner,
  ClinicPageHeader,
  ClinicCard,
  ClinicTabs,
  ClinicButton,
  ClinicModal,
  ClinicDrawer,
  ClinicField,
  clinicInputClass,
  ClinicStatusBadge,
  ClinicSelect,
  ClinicTable,
  ClinicTableHeader,
  ClinicTableBody,
  ClinicTableRow,
  ClinicTableCell,
} from '../ui';
import {
  useClinicStore,
  fullPatientName,
  patientById,
  therapistById,
  serviceById,
  roomById,
  nextId,
} from '../_lib/store';
import { formatDate, todayIso, addDaysIso } from '../_lib/format';
import type { AppointmentStatus, ClinicAppointment } from '../_lib/types';

type CalView = 'Day' | 'Week' | 'Month' | 'Therapist-wise' | 'Room-wise' | 'List';

const VIEWS: CalView[] = ['Day', 'Week', 'Month', 'Therapist-wise', 'Room-wise', 'List'];
const SLOT_START = 8;
const SLOT_END = 20;
const SLOT_MINUTES = 30;

const STATUS_COLORS: Record<string, string> = {
  Scheduled: 'bg-sky-100 border-sky-300 text-sky-900',
  Confirmed: 'bg-teal-100 border-teal-300 text-teal-900',
  'Checked In': 'bg-emerald-100 border-emerald-300 text-emerald-900',
  'In Progress': 'bg-amber-100 border-amber-300 text-amber-900',
  Completed: 'bg-slate-100 border-slate-300 text-slate-700',
  Cancelled: 'bg-rose-50 border-rose-200 text-rose-700 line-through opacity-70',
  'No Show': 'bg-rose-200 border-rose-400 text-rose-900',
  Rescheduled: 'bg-violet-100 border-violet-300 text-violet-900',
};

const APT_TYPES: ClinicAppointment['type'][] = [
  'Consultation',
  'Therapy',
  'Follow-up',
  'Assessment',
  'Walk-in',
];

const APT_STATUSES: AppointmentStatus[] = [
  'Scheduled',
  'Confirmed',
  'Checked In',
  'In Progress',
  'Completed',
  'Cancelled',
  'No Show',
  'Rescheduled',
];

function timeToMin(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minToTime(m: number) {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

function addMinutesToTime(start: string, minutes: number) {
  return minToTime(timeToMin(start) + minutes);
}

function parseIso(d: string) {
  return new Date(`${d}T12:00:00`);
}

function weekDays(base: string) {
  const start = parseIso(base);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function monthGrid(base: string) {
  const d = parseIso(base);
  const y = d.getFullYear();
  const m = d.getMonth();
  const first = new Date(y, m, 1);
  const startPad = first.getDay() === 0 ? 6 : first.getDay() - 1;
  const cells: string[] = [];
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - startPad);
  for (let i = 0; i < 42; i++) {
    const c = new Date(gridStart);
    c.setDate(gridStart.getDate() + i);
    cells.push(c.toISOString().slice(0, 10));
  }
  return { cells, month: m, year: y };
}

function hasConflict(appointments: ClinicAppointment[], candidate: ClinicAppointment, excludeId?: string) {
  const inactive = ['Cancelled', 'No Show', 'Rescheduled'];
  return appointments.some((a) => {
    if (a.id === excludeId || a.id === candidate.id) return false;
    if (a.therapistId !== candidate.therapistId || a.date !== candidate.date) return false;
    if (inactive.includes(a.status) || inactive.includes(candidate.status)) return false;
    return a.startTime < candidate.endTime && candidate.startTime < a.endTime;
  });
}

function emptyApt(date: string): Omit<ClinicAppointment, 'id'> & { sendReminder: boolean } {
  return {
    patientId: '',
    therapistId: '',
    serviceId: '',
    roomId: '',
    date,
    startTime: '09:00',
    endTime: '09:40',
    durationMinutes: 40,
    type: 'Therapy',
    status: 'Scheduled',
    notes: '',
    recurring: false,
    sendReminder: true,
  };
}

export default function ClinicCalendarPage() {
  const store = useClinicStore();
  const [view, setView] = useState<CalView>('Week');
  const [focusDate, setFocusDate] = useState(todayIso());
  const [createOpen, setCreateOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyApt(todayIso()));
  const [moveDate, setMoveDate] = useState('');
  const [moveTime, setMoveTime] = useState('');
  const [drawerTab, setDrawerTab] = useState('Details');

  const selected = useMemo(
    () => store.appointments.find((a) => a.id === selectedId) ?? null,
    [store.appointments, selectedId]
  );

  const visibleApts = useMemo(() => {
    if (view === 'Day' || view === 'Therapist-wise' || view === 'Room-wise') {
      return store.appointments.filter((a) => a.date === focusDate);
    }
    if (view === 'Week') {
      const days = weekDays(focusDate);
      return store.appointments.filter((a) => days.includes(a.date));
    }
    if (view === 'Month') {
      const { cells } = monthGrid(focusDate);
      return store.appointments.filter((a) => cells.includes(a.date));
    }
    return [...store.appointments].sort((a, b) =>
      (a.date + a.startTime).localeCompare(b.date + b.startTime)
    );
  }, [store.appointments, view, focusDate]);

  const slots = useMemo(() => {
    const list: string[] = [];
    for (let h = SLOT_START; h < SLOT_END; h++) {
      for (let m = 0; m < 60; m += SLOT_MINUTES) {
        list.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    return list;
  }, []);

  const therapistHint = useCallback(
    (therapistId: string, date: string) => {
      const dow = parseIso(date).getDay();
      const sch = store.schedules.find((s) => s.therapistId === therapistId && s.dayOfWeek === dow);
      if (!sch || sch.isOff) return 'Off day — limited availability';
      const br = sch.breakStart && sch.breakEnd ? ` (break ${sch.breakStart}–${sch.breakEnd})` : '';
      return `Available ${sch.startTime}–${sch.endTime}${br} · max ${sch.maxSessions} sessions`;
    },
    [store.schedules]
  );

  const openCreate = (preset?: Partial<typeof form>) => {
    setForm({ ...emptyApt(focusDate), ...preset });
    setCreateOpen(true);
  };

  const onServiceChange = (serviceId: string) => {
    const svc = serviceById(serviceId, store.services);
    const dur = svc?.durationMinutes ?? 40;
    setForm((f) => ({
      ...f,
      serviceId,
      durationMinutes: dur,
      endTime: addMinutesToTime(f.startTime, dur),
      therapistId: f.therapistId || svc?.therapistIds[0] || '',
    }));
  };

  const saveNew = () => {
    if (!form.patientId || !form.therapistId || !form.serviceId) {
      toast.error('Patient, therapist, and service are required');
      return;
    }
    const apt: ClinicAppointment = {
      id: nextId('APT', store.appointments),
      patientId: form.patientId,
      therapistId: form.therapistId,
      serviceId: form.serviceId,
      roomId: form.roomId || undefined,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      durationMinutes: form.durationMinutes,
      type: form.type,
      status: form.status,
      notes: form.notes,
      recurring: form.recurring,
    };
    if (hasConflict(store.appointments, apt)) {
      toast.error('Conflict: therapist already booked for this time');
      return;
    }
    store.update((prev) => ({ ...prev, appointments: [...prev.appointments, apt] }));
    toast.success(form.sendReminder ? 'Appointment saved — reminder enabled' : 'Appointment saved');
    setCreateOpen(false);
  };

  const openDrawer = (id: string) => {
    setSelectedId(id);
    setDrawerTab('Details');
    const a = store.appointments.find((x) => x.id === id);
    if (a) {
      setMoveDate(a.date);
      setMoveTime(a.startTime);
    }
    setDrawerOpen(true);
  };

  const updateSelected = (patch: Partial<ClinicAppointment>) => {
    if (!selectedId) return;
    store.update((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) => (a.id === selectedId ? { ...a, ...patch } : a)),
    }));
    toast.success('Appointment updated');
  };

  const cancelSelected = () => {
    updateSelected({ status: 'Cancelled' });
    setDrawerOpen(false);
  };

  const reschedule = () => {
    if (!selected) return;
    const end = addMinutesToTime(moveTime, selected.durationMinutes);
    const next = { ...selected, date: moveDate, startTime: moveTime, endTime: end, status: 'Rescheduled' as const };
    if (hasConflict(store.appointments, next, selected.id)) {
      toast.error('Reschedule blocked — therapist conflict');
      return;
    }
    store.update((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) =>
        a.id === selected.id
          ? { ...a, date: moveDate, startTime: moveTime, endTime: end, status: 'Scheduled' }
          : a
      ),
    }));
    toast.success('Appointment rescheduled');
    setDrawerOpen(false);
  };

  const dropOnSlot = (date: string, time: string) => {
    if (!dragId) return;
    const apt = store.appointments.find((a) => a.id === dragId);
    if (!apt) return;
    const end = addMinutesToTime(time, apt.durationMinutes);
    const candidate = { ...apt, date, startTime: time, endTime: end };
    if (hasConflict(store.appointments, candidate, apt.id)) {
      toast.error('Cannot move — time conflict');
      setDragId(null);
      return;
    }
    store.update((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) =>
        a.id === dragId ? { ...a, date, startTime: time, endTime: end } : a
      ),
    }));
    toast.success('Appointment moved');
    setDragId(null);
  };

  const AptBlock = ({ apt, compact }: { apt: ClinicAppointment; compact?: boolean }) => {
    const p = patientById(apt.patientId, store.patients);
    const cls = STATUS_COLORS[apt.status] ?? 'bg-slate-100 border-slate-200';
    return (
      <button
        type="button"
        draggable
        onDragStart={() => setDragId(apt.id)}
        onDragEnd={() => setDragId(null)}
        onClick={() => openDrawer(apt.id)}
        className={`w-full text-left border rounded-lg px-2 py-1 mb-1 text-[10px] sm:text-xs font-semibold shadow-sm hover:shadow ${cls}`}
      >
        <span className="flex items-center gap-0.5">
          <GripVertical className="w-3 h-3 opacity-50 shrink-0" />
          {!compact && <span>{apt.startTime}</span>}
        </span>
        <span className="block truncate">{fullPatientName(p)}</span>
      </button>
    );
  };

  const dayColumn = (date: string, apts: ClinicAppointment[]) => (
    <div key={date} className="min-w-[120px] flex-1 border-r border-slate-200 last:border-r-0">
      <div
        className={`text-center py-2 text-xs font-bold border-b ${date === todayIso() ? 'bg-teal-50 text-teal-800' : 'bg-slate-50'}`}
      >
        {formatDate(date)}
      </div>
      <div className="relative">
        {slots.map((time) => {
          const cellApts = apts.filter(
            (a) => a.date === date && a.startTime <= time && a.endTime > time && a.startTime === time
          );
          return (
            <div
              key={time}
              className="h-10 border-b border-slate-100 px-0.5 relative"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => dropOnSlot(date, time)}
            >
              <span className="absolute left-0 top-0 text-[9px] text-slate-400 -translate-x-full pr-1 hidden lg:block">
                {time}
              </span>
              {cellApts.map((a) => (
                <AptBlock key={a.id} apt={a} compact />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );

  const navDate = (delta: number) => {
    if (view === 'Month') {
      const d = parseIso(focusDate);
      d.setMonth(d.getMonth() + delta);
      setFocusDate(d.toISOString().slice(0, 10));
    } else if (view === 'Week') {
      setFocusDate(addDaysIso(focusDate, delta * 7));
    } else {
      setFocusDate(addDaysIso(focusDate, delta));
    }
  };

  const calendarBody = () => {
    if (view === 'List') {
      return (
        <ClinicTable>
          <ClinicTableHeader columns={['Date', 'Time', 'Patient', 'Therapist', 'Service', 'Room', 'Status']} />
          <ClinicTableBody>
            {visibleApts.map((a) => {
              const p = patientById(a.patientId, store.patients);
              const th = therapistById(a.therapistId, store.therapists);
              const svc = serviceById(a.serviceId, store.services);
              const room = a.roomId ? roomById(a.roomId, store.rooms) : null;
              return (
                <ClinicTableRow key={a.id} onClick={() => openDrawer(a.id)}>
                  <ClinicTableCell>{formatDate(a.date)}</ClinicTableCell>
                  <ClinicTableCell>
                    {a.startTime}–{a.endTime}
                  </ClinicTableCell>
                  <ClinicTableCell className="font-medium">{fullPatientName(p)}</ClinicTableCell>
                  <ClinicTableCell>{th?.name}</ClinicTableCell>
                  <ClinicTableCell>{svc?.name}</ClinicTableCell>
                  <ClinicTableCell>{room?.name ?? '—'}</ClinicTableCell>
                  <ClinicTableCell>
                    <ClinicStatusBadge status={a.status} />
                  </ClinicTableCell>
                </ClinicTableRow>
              );
            })}
          </ClinicTableBody>
        </ClinicTable>
      );
    }

    if (view === 'Therapist-wise') {
      const therapists = store.therapists.filter((t) => t.status === 'Active');
      return (
        <div className="overflow-x-auto">
          <div className="flex min-w-[800px]">
            {therapists.map((th) => {
              const apts = visibleApts.filter((a) => a.therapistId === th.id);
              return (
                <div key={th.id} className="flex-1 min-w-[140px] border-r border-slate-200">
                  <div className="p-2 bg-teal-50 border-b text-xs font-bold text-teal-900">
                    {th.name.split(' ').slice(-1)[0]}
                    <p className="text-[10px] font-normal text-teal-700 mt-0.5">{therapistHint(th.id, focusDate)}</p>
                  </div>
                  <div className="p-1 space-y-1 min-h-[200px]">
                    {apts.length === 0 ? (
                      <p className="text-[10px] text-slate-400 p-2">No appointments</p>
                    ) : (
                      apts.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((a) => <AptBlock key={a.id} apt={a} />)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (view === 'Room-wise') {
      return (
        <div className="overflow-x-auto">
          <div className="flex min-w-[700px]">
            {store.rooms.map((room) => {
              const apts = visibleApts.filter((a) => a.roomId === room.id);
              return (
                <div key={room.id} className="flex-1 min-w-[130px] border-r border-slate-200">
                  <div className="p-2 bg-slate-50 border-b text-xs font-bold">
                    {room.name}
                    <ClinicStatusBadge status={room.status} />
                  </div>
                  <div className="p-1 space-y-1">
                    {apts.map((a) => (
                      <AptBlock key={a.id} apt={a} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (view === 'Month') {
      const { cells, month, year } = monthGrid(focusDate);
      return (
        <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="bg-teal-800 text-white text-center text-[10px] font-bold py-1">
              {d}
            </div>
          ))}
          {cells.map((date) => {
            const inMonth = parseIso(date).getMonth() === month;
            const dayApts = store.appointments.filter((a) => a.date === date).slice(0, 3);
            return (
              <div
                key={date}
                className={`bg-white min-h-[88px] p-1 ${!inMonth ? 'opacity-40' : ''} ${date === todayIso() ? 'ring-2 ring-teal-500 ring-inset' : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => dropOnSlot(date, '09:00')}
                onClick={() => {
                  setFocusDate(date);
                  setView('Day');
                }}
              >
                <p className="text-[10px] font-bold text-slate-600">{date.slice(8)}</p>
                {dayApts.map((a) => (
                  <AptBlock key={a.id} apt={a} compact />
                ))}
              </div>
            );
          })}
          <p className="col-span-7 text-center text-xs text-slate-500 py-1 bg-white">
            {new Date(year, month).toLocaleString('en', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      );
    }

    const days =
      view === 'Day' ? [focusDate] : weekDays(focusDate);

    return (
      <div className="overflow-x-auto">
        <div className="flex min-w-[600px]">{days.map((d) => dayColumn(d, visibleApts))}</div>
      </div>
    );
  };

  const formFields = (
    <div className="grid sm:grid-cols-2 gap-4">
      <ClinicField label="Patient" required>
        <select
          className={clinicInputClass()}
          value={form.patientId}
          onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value }))}
        >
          <option value="">Select</option>
          {store.patients.map((p) => (
            <option key={p.id} value={p.id}>
              {fullPatientName(p)}
            </option>
          ))}
        </select>
      </ClinicField>
      <ClinicField label="Therapist" required>
        <select
          className={clinicInputClass()}
          value={form.therapistId}
          onChange={(e) => setForm((f) => ({ ...f, therapistId: e.target.value }))}
        >
          <option value="">Select</option>
          {store.therapists
            .filter((t) => t.status === 'Active')
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
        </select>
        {form.therapistId && (
          <p className="text-[10px] text-teal-700 mt-1">{therapistHint(form.therapistId, form.date)}</p>
        )}
      </ClinicField>
      <ClinicField label="Service" required>
        <select className={clinicInputClass()} value={form.serviceId} onChange={(e) => onServiceChange(e.target.value)}>
          <option value="">Select</option>
          {store.services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </ClinicField>
      <ClinicField label="Room">
        <select
          className={clinicInputClass()}
          value={form.roomId}
          onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))}
        >
          <option value="">—</option>
          {store.rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </ClinicField>
      <ClinicField label="Date" required>
        <input
          type="date"
          className={clinicInputClass()}
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
        />
      </ClinicField>
      <ClinicField label="Start time" required>
        <input
          type="time"
          className={clinicInputClass()}
          value={form.startTime}
          onChange={(e) => {
            const start = e.target.value;
            setForm((f) => ({
              ...f,
              startTime: start,
              endTime: addMinutesToTime(start, f.durationMinutes),
            }));
          }}
        />
      </ClinicField>
      <ClinicField label="End time">
        <input type="time" className={clinicInputClass()} value={form.endTime} readOnly />
      </ClinicField>
      <ClinicField label="Duration (min)">
        <input
          type="number"
          className={clinicInputClass()}
          value={form.durationMinutes}
          onChange={(e) => {
            const dur = Number(e.target.value) || 30;
            setForm((f) => ({ ...f, durationMinutes: dur, endTime: addMinutesToTime(f.startTime, dur) }));
          }}
        />
      </ClinicField>
      <ClinicField label="Type">
        <select
          className={clinicInputClass()}
          value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ClinicAppointment['type'] }))}
        >
          {APT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </ClinicField>
      <ClinicField label="Status">
        <select
          className={clinicInputClass()}
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AppointmentStatus }))}
        >
          {APT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </ClinicField>
      <ClinicField label="Patient note">
        <textarea
          className={`${clinicInputClass()} min-h-[60px] sm:col-span-2`}
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Quick note for front desk…"
        />
      </ClinicField>
      <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
        <input type="checkbox" checked={form.recurring} onChange={(e) => setForm((f) => ({ ...f, recurring: e.target.checked }))} />
        <Repeat className="w-4 h-4 text-teal-700" />
        Recurring series (mock flag)
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
        <input
          type="checkbox"
          checked={form.sendReminder}
          onChange={(e) => setForm((f) => ({ ...f, sendReminder: e.target.checked }))}
        />
        <Bell className="w-4 h-4 text-teal-700" />
        Send SMS / WhatsApp reminder
      </label>
    </div>
  );

  const conflictPreview = useMemo(() => {
    if (!form.therapistId || !form.date || !form.startTime) return false;
    const candidate: ClinicAppointment = {
      id: 'new',
      patientId: form.patientId || 'x',
      therapistId: form.therapistId,
      serviceId: form.serviceId || 'x',
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      durationMinutes: form.durationMinutes,
      type: form.type,
      status: form.status,
    };
    return hasConflict(store.appointments, candidate);
  }, [form, store.appointments]);

  return (
    <ClinicPage fullWidth>
      <ClinicMockBanner />
      <ClinicPageHeader
        title="Appointment Calendar"
        subtitle={`${visibleApts.length} appointments in view · drag blocks to reschedule`}
        icon={<Calendar className="w-5 h-5" />}
        actions={
          <div className="flex flex-wrap gap-2">
            <ClinicButton variant="secondary" onClick={() => openCreate({ type: 'Walk-in' })}>
              <UserRound className="w-4 h-4" />
              Walk-in
            </ClinicButton>
            <ClinicButton onClick={() => openCreate()}>
              <Plus className="w-4 h-4" />
              New appointment
            </ClinicButton>
          </div>
        }
      />

      <ClinicCard noPadding>
        <div className="px-4 pt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <ClinicTabs tabs={VIEWS} active={view} onChange={(v) => setView(v as CalView)} />
          <div className="flex items-center gap-2 pb-3 lg:pb-0">
            <ClinicButton variant="ghost" className="!p-2" onClick={() => navDate(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </ClinicButton>
            <ClinicSelect
              value={focusDate}
              onChange={setFocusDate}
              options={store.appointments
                .map((a) => a.date)
                .filter((d, i, arr) => arr.indexOf(d) === i)
                .sort()
                .slice(-14)
                .map((d) => ({ value: d, label: formatDate(d) }))}
              className="min-w-[140px]"
            />
            <ClinicButton variant="secondary" onClick={() => setFocusDate(todayIso())}>
              Today
            </ClinicButton>
            <ClinicButton variant="ghost" className="!p-2" onClick={() => navDate(1)}>
              <ChevronRight className="w-4 h-4" />
            </ClinicButton>
          </div>
        </div>
        <div className="p-4 border-t border-slate-100">{calendarBody()}</div>
        <div className="px-4 pb-4 flex flex-wrap gap-2 text-[10px]">
          {Object.entries(STATUS_COLORS).map(([st, cls]) => (
            <span key={st} className={`px-2 py-0.5 rounded border ${cls}`}>
              {st}
            </span>
          ))}
        </div>
      </ClinicCard>

      <ClinicModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create appointment"
        maxWidth="max-w-3xl"
        actions={
          <>
            <ClinicButton variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </ClinicButton>
            <ClinicButton onClick={saveNew} disabled={conflictPreview}>
              Save
            </ClinicButton>
          </>
        }
      >
        {conflictPreview && (
          <p className="flex items-center gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
            <AlertCircle className="w-4 h-4" />
            Therapist has an overlapping appointment on this date.
          </p>
        )}
        {formFields}
      </ClinicModal>

      <ClinicDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ? `Appointment ${selected.id}` : 'Appointment'}
        subtitle={selected ? formatDate(selected.date) : undefined}
        tabs={['Details', 'Reschedule', 'Actions']}
        activeTab={drawerTab}
        onTabChange={setDrawerTab}
        actions={
          <>
            <ClinicButton variant="danger" onClick={cancelSelected}>
              Cancel appt
            </ClinicButton>
            <ClinicButton variant="secondary" onClick={() => setDrawerOpen(false)}>
              Close
            </ClinicButton>
          </>
        }
      >
        {selected && drawerTab === 'Details' && (
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500 text-xs">Patient</dt>
              <dd className="font-semibold">{fullPatientName(patientById(selected.patientId, store.patients))}</dd>
            </div>
            <div>
              <dt className="text-slate-500 text-xs">Therapist</dt>
              <dd>{therapistById(selected.therapistId, store.therapists)?.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500 text-xs">Service</dt>
              <dd>{serviceById(selected.serviceId, store.services)?.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500 text-xs">Status</dt>
              <dd>
                <ClinicStatusBadge status={selected.status} />
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-slate-500 text-xs mb-1">Update status</dt>
              <ClinicSelect
                value={selected.status}
                onChange={(v) => updateSelected({ status: v as AppointmentStatus })}
                options={APT_STATUSES.map((s) => ({ value: s, label: s }))}
              />
            </div>
            <div className="col-span-2">
              <dt className="text-slate-500 text-xs mb-1">Notes</dt>
              <textarea
                className={clinicInputClass()}
                defaultValue={selected.notes}
                onBlur={(e) => updateSelected({ notes: e.target.value })}
              />
            </div>
          </dl>
        )}
        {selected && drawerTab === 'Reschedule' && (
          <>
            <div className="grid sm:grid-cols-2 gap-3">
              <ClinicField label="New date">
                <input
                  type="date"
                  className={clinicInputClass()}
                  value={moveDate}
                  onChange={(e) => setMoveDate(e.target.value)}
                />
              </ClinicField>
              <ClinicField label="New start">
                <input
                  type="time"
                  className={clinicInputClass()}
                  value={moveTime}
                  onChange={(e) => setMoveTime(e.target.value)}
                />
              </ClinicField>
            </div>
            <p className="text-[10px] text-teal-700 mt-2">{therapistHint(selected.therapistId, moveDate)}</p>
            <ClinicButton className="mt-3" onClick={reschedule}>
              Apply reschedule
            </ClinicButton>
          </>
        )}
        {selected && drawerTab === 'Actions' && (
          <QuickActions
            onConfirm={() => updateSelected({ status: 'Confirmed' })}
            onCheckIn={() => updateSelected({ status: 'Checked In' })}
            onComplete={() => updateSelected({ status: 'Completed' })}
          />
        )}
      </ClinicDrawer>
    </ClinicPage>
  );
}

function QuickActions({
  onConfirm,
  onCheckIn,
  onComplete,
}: {
  onConfirm: () => void;
  onCheckIn: () => void;
  onComplete: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <ClinicButton variant="secondary" onClick={onConfirm}>
        Confirm
      </ClinicButton>
      <ClinicButton variant="secondary" onClick={onCheckIn}>
        Check in
      </ClinicButton>
      <ClinicButton onClick={onComplete}>
        Mark completed
      </ClinicButton>
    </div>
  );
}
