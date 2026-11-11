'use client';

export const dynamic = 'force-dynamic';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  UserRound,
  Calendar,
  Users,
  Activity,
  TrendingUp,
  Wallet,
  Palmtree,
  Phone,
  Mail,
  MapPin,
  Pencil,
} from 'lucide-react';
import {
  ClinicPage,
  ClinicMockBanner,
  ClinicPageHeader,
  ClinicCard,
  ClinicStatCard,
  ClinicTabs,
  ClinicTable,
  ClinicTableHeader,
  ClinicTableBody,
  ClinicTableRow,
  ClinicTableCell,
  ClinicStatusBadge,
  ClinicAvatar,
  ClinicButton,
  ClinicModal,
  ClinicField,
  clinicInputClass,
  ClinicSelect,
  ClinicEmptyState,
  ClinicProgress,
} from '../../ui';
import {
  useClinicStore,
  fullPatientName,
  patientById,
  therapistById,
  roomById,
  serviceById,
} from '../../_lib/store';
import { formatDate, formatPkr, todayIso } from '../../_lib/format';
import type { StaffStatus } from '../../_lib/types';

const DAY_NAMES = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TABS = [
  'Overview',
  'Schedule',
  'Appointments',
  'Patients',
  'Sessions',
  'Performance',
  'Earnings',
  'Leave History',
] as const;

type TabId = (typeof TABS)[number];

const STATUSES: StaffStatus[] = ['Active', 'On Leave', 'Inactive'];

export default function ClinicTherapistDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? '');
  const store = useClinicStore();
  const therapist = therapistById(id, store.therapists);
  const [tab, setTab] = useState<TabId>('Overview');
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(therapist);

  const schedules = useMemo(
    () => store.schedules.filter((s) => s.therapistId === id).sort((a, b) => a.dayOfWeek - b.dayOfWeek),
    [store.schedules, id]
  );

  const appointments = useMemo(
    () =>
      store.appointments
        .filter((a) => a.therapistId === id)
        .sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`)),
    [store.appointments, id]
  );

  const sessions = useMemo(
    () =>
      store.sessions
        .filter((s) => s.therapistId === id)
        .sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`)),
    [store.sessions, id]
  );

  const patients = useMemo(() => {
    const ids = new Set<string>();
    store.patients
      .filter((p) => p.assignedTherapistId === id)
      .forEach((p) => ids.add(p.id));
    appointments.forEach((a) => ids.add(a.patientId));
    sessions.forEach((s) => ids.add(s.patientId));
    return store.patients.filter((p) => ids.has(p.id));
  }, [store.patients, appointments, sessions, id]);

  const performance = useMemo(() => {
    const total = sessions.length;
    const completed = sessions.filter((s) => s.status === 'Completed').length;
    const cancelled = sessions.filter((s) => s.status === 'Cancelled').length;
    const retention = patients.length === 0 ? 0 : Math.min(98, 72 + (completed % 20));
    const revenue = completed * (therapist?.sessionFee ?? 0);
    const daysSpan = Math.max(1, new Set(sessions.map((s) => s.date)).size);
    const avgPerDay = Number((completed / daysSpan).toFixed(1));
    const utilization = therapist?.utilization ?? 0;
    return { total, completed, cancelled, retention, revenue, avgPerDay, utilization };
  }, [sessions, patients.length, therapist]);

  const leaveHistory = useMemo(() => {
    if (!therapist) return [];
    const entries = [
      {
        id: 'LV-001',
        from: '2025-08-10',
        to: '2025-08-17',
        type: 'Annual leave',
        status: 'Approved',
      },
    ];
    if (therapist.status === 'On Leave') {
      entries.unshift({
        id: 'LV-002',
        from: todayIso(),
        to: todayIso(),
        type: 'Current leave',
        status: 'Active',
      });
    }
    return entries;
  }, [therapist]);

  if (!therapist) {
    return (
      <ClinicPage>
        <ClinicMockBanner />
        <ClinicEmptyState
          title="Therapist not found"
          description={`No profile for ID ${id}`}
        />
      </ClinicPage>
    );
  }

  const openEdit = () => {
    setEditForm({ ...therapist });
    setEditOpen(true);
  };

  const saveProfile = () => {
    if (!editForm) return;
    store.update((prev) => ({
      ...prev,
      therapists: prev.therapists.map((t) => (t.id === id ? { ...editForm } : t)),
    }));
    toast.success('Therapist profile updated');
    setEditOpen(false);
  };

  const todayAppts = appointments.filter((a) => a.date === todayIso());

  return (
    <ClinicPage>
      <ClinicMockBanner />
      <ClinicPageHeader
        title={therapist.name}
        subtitle={`${therapist.specialization} · ${therapist.id}`}
        backHref="/clinic/therapists"
        icon={<UserRound className="w-5 h-5 text-white" />}
        actions={
          <ClinicButton variant="secondary" onClick={openEdit}>
            <Pencil className="w-4 h-4" />
            Edit profile
          </ClinicButton>
        }
      />

      <div className="flex flex-col lg:flex-row gap-4">
        <ClinicCard className="lg:w-72 flex-shrink-0">
          <div className="flex flex-col items-center text-center">
            <ClinicAvatar name={therapist.name} color={therapist.avatarColor} size="lg" />
            <h2 className="font-bold text-lg mt-3">{therapist.name}</h2>
            <p className="text-xs text-teal-700 font-semibold">{therapist.specialization}</p>
            <div className="mt-2">
              <ClinicStatusBadge status={therapist.status} />
            </div>
          </div>
          <dl className="mt-5 space-y-2 text-xs text-slate-600">
            <ContactLine icon={Phone} text={therapist.phone} />
            <ContactLine icon={Mail} text={therapist.email} />
            <ContactLine icon={MapPin} text={therapist.branch} />
          </dl>
          <span className="block mt-4 text-xs text-slate-500">
            {therapist.qualification} · {therapist.experienceYears} years ·{' '}
            {therapist.employmentType}
          </span>
          <span className="block mt-1 text-xs text-slate-500">Joined {formatDate(therapist.joiningDate)}</span>
        </ClinicCard>

        <div className="flex-1 min-w-0 space-y-4">
          <ClinicTabs tabs={[...TABS]} active={tab} onChange={(t) => setTab(t as TabId)} />

          {tab === 'Overview' && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <ClinicStatCard label="Today's appointments" value={todayAppts.length} icon={Calendar} />
                <ClinicStatCard label="Assigned patients" value={patients.length} icon={Users} color="#0284c7" />
                <ClinicStatCard label="Utilization" value={`${therapist.utilization}%`} icon={TrendingUp} />
                <ClinicStatCard label="Session fee" value={formatPkr(therapist.sessionFee)} icon={Wallet} />
              </div>
              <ClinicCard title="Fee structure">
                <KeyValueGrid
                  items={[
                    ['Consultation', formatPkr(therapist.consultationFee)],
                    ['Per session', formatPkr(therapist.sessionFee)],
                    ['Commission', `${therapist.commissionPercent}%`],
                  ]}
                />
              </ClinicCard>
            </div>
          )}

          {tab === 'Schedule' && (
            <ClinicCard title="Weekly timetable" subtitle="From clinic schedule records">
              <ClinicTable>
                <ClinicTableHeader
                  columns={['Day', 'Hours', 'Break', 'Room', 'Max sessions', 'Status']}
                />
                <ClinicTableBody>
                  {schedules.map((s) => (
                    <ClinicTableRow key={s.id}>
                      <ClinicTableCell className="font-semibold">
                        {DAY_NAMES[s.dayOfWeek] ?? `Day ${s.dayOfWeek}`}
                      </ClinicTableCell>
                      <ClinicTableCell>
                        {s.isOff ? '—' : `${s.startTime} – ${s.endTime}`}
                      </ClinicTableCell>
                      <ClinicTableCell>
                        {s.breakStart && s.breakEnd ? `${s.breakStart} – ${s.breakEnd}` : '—'}
                      </ClinicTableCell>
                      <ClinicTableCell>
                        {s.roomId ? roomById(s.roomId, store.rooms)?.name ?? s.roomId : '—'}
                      </ClinicTableCell>
                      <ClinicTableCell>{s.maxSessions}</ClinicTableCell>
                      <ClinicTableCell>
                        <ClinicStatusBadge status={s.isOff ? 'Off day' : 'Scheduled'} />
                      </ClinicTableCell>
                    </ClinicTableRow>
                  ))}
                </ClinicTableBody>
              </ClinicTable>
            </ClinicCard>
          )}

          {tab === 'Appointments' && (
            <ClinicCard title="Appointments">
              {appointments.length === 0 ? (
                <ClinicEmptyState title="No appointments" />
              ) : (
                <ClinicTable>
                  <ClinicTableHeader columns={['Date', 'Time', 'Patient', 'Service', 'Status']} />
                  <ClinicTableBody>
                    {appointments.slice(0, 50).map((a) => (
                      <ClinicTableRow key={a.id}>
                        <ClinicTableCell>{formatDate(a.date)}</ClinicTableCell>
                        <ClinicTableCell>
                          {a.startTime} – {a.endTime}
                        </ClinicTableCell>
                        <ClinicTableCell>
                          {fullPatientName(patientById(a.patientId, store.patients))}
                        </ClinicTableCell>
                        <ClinicTableCell>
                          {serviceById(a.serviceId, store.services)?.name ?? a.serviceId}
                        </ClinicTableCell>
                        <ClinicTableCell>
                          <ClinicStatusBadge status={a.status} />
                        </ClinicTableCell>
                      </ClinicTableRow>
                    ))}
                  </ClinicTableBody>
                </ClinicTable>
              )}
            </ClinicCard>
          )}

          {tab === 'Patients' && (
            <ClinicCard title="Patient panel">
              {patients.length === 0 ? (
                <ClinicEmptyState title="No linked patients" />
              ) : (
                <ClinicTable>
                  <ClinicTableHeader columns={['Patient', 'Status', 'Last visit', 'Next appt']} />
                  <ClinicTableBody>
                    {patients.map((p) => (
                      <ClinicTableRow key={p.id}>
                        <ClinicTableCell className="font-semibold">{fullPatientName(p)}</ClinicTableCell>
                        <ClinicTableCell>
                          <ClinicStatusBadge status={p.status} />
                        </ClinicTableCell>
                        <ClinicTableCell>{formatDate(p.lastVisit ?? '')}</ClinicTableCell>
                        <ClinicTableCell>{formatDate(p.nextAppointment ?? '')}</ClinicTableCell>
                      </ClinicTableRow>
                    ))}
                  </ClinicTableBody>
                </ClinicTable>
              )}
            </ClinicCard>
          )}

          {tab === 'Sessions' && (
            <ClinicCard title="Therapy sessions">
              {sessions.length === 0 ? (
                <ClinicEmptyState title="No sessions recorded" />
              ) : (
                <ClinicTable>
                  <ClinicTableHeader columns={['Date', 'Patient', 'Duration', 'Status', 'Feedback']} />
                  <ClinicTableBody>
                    {sessions.slice(0, 40).map((s) => (
                      <ClinicTableRow key={s.id}>
                        <ClinicTableCell>{formatDate(s.date)}</ClinicTableCell>
                        <ClinicTableCell>
                          {fullPatientName(patientById(s.patientId, store.patients))}
                        </ClinicTableCell>
                        <ClinicTableCell>{s.durationMinutes} min</ClinicTableCell>
                        <ClinicTableCell>
                          <ClinicStatusBadge status={s.status} />
                        </ClinicTableCell>
                        <ClinicTableCell>{s.patientFeedback ?? '—'}/5</ClinicTableCell>
                      </ClinicTableRow>
                    ))}
                  </ClinicTableBody>
                </ClinicTable>
              )}
            </ClinicCard>
          )}

          {tab === 'Performance' && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <ClinicStatCard label="Total sessions" value={performance.total} icon={Activity} />
                <ClinicStatCard
                  label="Completed"
                  value={performance.completed}
                  icon={Activity}
                  color="#059669"
                />
                <ClinicStatCard
                  label="Cancelled"
                  value={performance.cancelled}
                  icon={Activity}
                  color="#dc2626"
                />
                <ClinicStatCard
                  label="Retention (mock)"
                  value={`${performance.retention}%`}
                  icon={TrendingUp}
                />
                <ClinicStatCard label="Revenue (sessions)" value={formatPkr(performance.revenue)} icon={Wallet} />
                <ClinicStatCard label="Avg sessions / day" value={performance.avgPerDay} icon={Calendar} />
              </div>
              <ClinicCard title="Utilization">
                <ClinicProgress value={performance.utilization} />
              </ClinicCard>
            </div>
          )}

          {tab === 'Earnings' && (
            <ClinicCard title="Earnings summary (mock)">
              <KeyValueGrid
                items={[
                  ['Gross session revenue', formatPkr(performance.revenue)],
                  [
                    'Commission',
                    formatPkr((performance.revenue * therapist.commissionPercent) / 100),
                  ],
                  [
                    'Consultation estimate',
                    formatPkr(appointments.filter((a) => a.type === 'Consultation').length * therapist.consultationFee),
                  ],
                  [
                    'Net to therapist (mock)',
                    formatPkr(
                      (performance.revenue * therapist.commissionPercent) / 100 +
                        appointments.filter((a) => a.type === 'Consultation').length * therapist.consultationFee
                    ),
                  ],
                ]}
              />
            </ClinicCard>
          )}

          {tab === 'Leave History' && (
            <ClinicCard title="Leave records" subtitle="Synced with HR mock">
              <ClinicTable>
                <ClinicTableHeader columns={['From', 'To', 'Type', 'Status']} />
                <ClinicTableBody>
                  {leaveHistory.map((l) => (
                    <ClinicTableRow key={l.id}>
                      <ClinicTableCell>{formatDate(l.from)}</ClinicTableCell>
                      <ClinicTableCell>{formatDate(l.to)}</ClinicTableCell>
                      <ClinicTableCell>{l.type}</ClinicTableCell>
                      <ClinicTableCell>
                        <ClinicStatusBadge status={l.status} />
                      </ClinicTableCell>
                    </ClinicTableRow>
                  ))}
                </ClinicTableBody>
              </ClinicTable>
              {therapist.status === 'On Leave' && (
                <p className="text-xs text-amber-700 mt-4 flex items-center gap-1.5">
                  <Palmtree className="w-4 h-4" />
                  Currently marked on leave in therapist profile.
                </p>
              )}
            </ClinicCard>
          )}
        </div>
      </div>

      <ClinicModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit therapist"
        actions={
          <>
            <ClinicButton variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </ClinicButton>
            <ClinicButton onClick={saveProfile}>Save</ClinicButton>
          </>
        }
      >
        {editForm && (
          <div className="grid sm:grid-cols-2 gap-4">
            <ClinicField label="Status">
              <ClinicSelect
                value={editForm.status}
                onChange={(v) => setEditForm({ ...editForm, status: v as StaffStatus })}
                options={STATUSES.map((s) => ({ value: s, label: s }))}
                className="w-full"
              />
            </ClinicField>
            <ClinicField label="Phone">
              <input
                className={clinicInputClass()}
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </ClinicField>
            <ClinicField label="Session fee">
              <input
                type="number"
                className={clinicInputClass()}
                value={editForm.sessionFee}
                onChange={(e) => setEditForm({ ...editForm, sessionFee: Number(e.target.value) || 0 })}
              />
            </ClinicField>
            <ClinicField label="Utilization %">
              <input
                type="number"
                min={0}
                max={100}
                className={clinicInputClass()}
                value={editForm.utilization}
                onChange={(e) => setEditForm({ ...editForm, utilization: Number(e.target.value) || 0 })}
              />
            </ClinicField>
          </div>
        )}
      </ClinicModal>
    </ClinicPage>
  );
}

function ContactLine({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
      <span className="truncate">{text}</span>
    </div>
  );
}

function KeyValueGrid({ items }: { items: [string, string][] }) {
  return (
    <dl className="grid sm:grid-cols-2 gap-3">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-xl border border-[#d1e7df] p-3 bg-teal-50/30">
          <dt className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">{label}</dt>
          <dd className="text-sm font-bold text-slate-900 mt-1">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
