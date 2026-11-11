'use client';

export const dynamic = 'force-dynamic';

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Clock,
  ListOrdered,
  Phone,
  Plus,
  UserPlus,
  CalendarCheck,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  ClinicPage,
  ClinicMockBanner,
  ClinicPageHeader,
  ClinicCard,
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
  clinicInputClass,
  ClinicStatusBadge,
  ClinicAvatar,
  ClinicEmptyState,
} from '../ui';
import {
  useClinicStore,
  fullPatientName,
  patientById,
  therapistById,
  serviceById,
  nextId,
} from '../_lib/store';
import { formatDate, waitingDuration, todayIso } from '../_lib/format';
import type { ClinicAppointment, Priority, WaitingListItem, WaitingStatus } from '../_lib/types';

const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];
const STATUSES: WaitingStatus[] = ['Waiting', 'Contacted', 'Booked', 'Expired', 'Cancelled'];

function emptyForm(): Omit<WaitingListItem, 'id'> {
  return {
    patientId: '',
    serviceId: '',
    preferredTherapistId: '',
    preferredDate: todayIso(),
    preferredTime: '10:00',
    priority: 'Medium',
    requestedAt: new Date().toISOString(),
    contactPhone: '',
    status: 'Waiting',
    notes: '',
  };
}

export default function ClinicWaitingListPage() {
  const store = useClinicStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return store.waitingList.filter((w) => {
      if (statusFilter !== 'all' && w.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && w.priority !== priorityFilter) return false;
      const p = patientById(w.patientId, store.patients);
      const name = fullPatientName(p).toLowerCase();
      const svc = serviceById(w.serviceId, store.services)?.name.toLowerCase() ?? '';
      if (!q) return true;
      return name.includes(q) || svc.includes(q) || w.contactPhone.includes(q);
    });
  }, [store.waitingList, store.patients, store.services, search, statusFilter, priorityFilter]);

  const openEdit = (item: WaitingListItem) => {
    setActiveId(item.id);
    setForm({
      patientId: item.patientId,
      serviceId: item.serviceId,
      preferredTherapistId: item.preferredTherapistId ?? '',
      preferredDate: item.preferredDate,
      preferredTime: item.preferredTime,
      priority: item.priority,
      requestedAt: item.requestedAt,
      contactPhone: item.contactPhone,
      status: item.status,
      notes: item.notes ?? '',
    });
    setEditOpen(true);
  };

  const saveWaiting = (isNew: boolean) => {
    if (!form.patientId || !form.serviceId) {
      toast.error('Patient and service are required');
      return;
    }
    const p = patientById(form.patientId, store.patients);
    const phone = form.contactPhone || p?.phone || '';
    store.update((prev) => {
      const waitingList = [...prev.waitingList];
      if (isNew) {
        waitingList.push({
          ...form,
          id: nextId('WL', prev.waitingList),
          contactPhone: phone,
          preferredTherapistId: form.preferredTherapistId || undefined,
        });
      } else if (activeId) {
        const idx = waitingList.findIndex((w) => w.id === activeId);
        if (idx >= 0) {
          waitingList[idx] = {
            ...waitingList[idx],
            ...form,
            contactPhone: phone,
            preferredTherapistId: form.preferredTherapistId || undefined,
          };
        }
      }
      return { ...prev, waitingList };
    });
    toast.success(isNew ? 'Added to waiting list' : 'Waiting list entry updated');
    setAddOpen(false);
    setEditOpen(false);
    setForm(emptyForm());
    setActiveId(null);
  };

  const removeItem = (id: string) => {
    store.update((prev) => ({
      ...prev,
      waitingList: prev.waitingList.filter((w) => w.id !== id),
    }));
    toast.success('Removed from waiting list');
  };

  const contactPatient = (item: WaitingListItem) => {
    const p = patientById(item.patientId, store.patients);
    toast.success(`Calling ${fullPatientName(p)} at ${item.contactPhone}`);
    if (item.status === 'Waiting') {
      store.update((prev) => ({
        ...prev,
        waitingList: prev.waitingList.map((w) =>
          w.id === item.id ? { ...w, status: 'Contacted' as const } : w
        ),
      }));
    }
  };

  const openBook = (item: WaitingListItem) => {
    setActiveId(item.id);
    const svc = serviceById(item.serviceId, store.services);
    const dur = svc?.durationMinutes ?? 40;
    const [h, m] = item.preferredTime.split(':').map(Number);
    const endM = h * 60 + m + dur;
    const endTime = `${String(Math.floor(endM / 60)).padStart(2, '0')}:${String(endM % 60).padStart(2, '0')}`;
    setForm({
      ...form,
      patientId: item.patientId,
      serviceId: item.serviceId,
      preferredTherapistId: item.preferredTherapistId ?? '',
      preferredDate: item.preferredDate,
      preferredTime: item.preferredTime,
    });
    setBookOpen(true);
  };

  const confirmBook = () => {
    const item = store.waitingList.find((w) => w.id === activeId);
    if (!item) return;
    const svc = serviceById(item.serviceId, store.services);
    const therapistId = item.preferredTherapistId || svc?.therapistIds[0] || store.therapists[0]?.id;
    if (!therapistId) {
      toast.error('No therapist available');
      return;
    }
    const dur = svc?.durationMinutes ?? 40;
    const [h, m] = item.preferredTime.split(':').map(Number);
    const endM = h * 60 + m + dur;
    const endTime = `${String(Math.floor(endM / 60)).padStart(2, '0')}:${String(endM % 60).padStart(2, '0')}`;

    const newApt: ClinicAppointment = {
      id: nextId('APT', store.appointments),
      patientId: item.patientId,
      therapistId,
      serviceId: item.serviceId,
      date: item.preferredDate,
      startTime: item.preferredTime,
      endTime,
      durationMinutes: dur,
      type: 'Therapy',
      status: 'Scheduled',
      notes: item.notes ? `From waiting list: ${item.notes}` : 'Booked from waiting list',
    };

    store.update((prev) => ({
      ...prev,
      appointments: [...prev.appointments, newApt],
      waitingList: prev.waitingList.map((w) =>
        w.id === item.id ? { ...w, status: 'Booked' as const } : w
      ),
    }));
    toast.success('Appointment created — waiting list marked as Booked');
    setBookOpen(false);
    setActiveId(null);
  };

  const formFields = (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        <ClinicField label="Patient" required>
          <select
            className={clinicInputClass()}
            value={form.patientId}
            onChange={(e) => {
              const pid = e.target.value;
              const p = patientById(pid, store.patients);
              setForm((f) => ({
                ...f,
                patientId: pid,
                contactPhone: p?.phone ?? f.contactPhone,
              }));
            }}
          >
            <option value="">Select patient</option>
            {store.patients.map((p) => (
              <option key={p.id} value={p.id}>
                {fullPatientName(p)}
              </option>
            ))}
          </select>
        </ClinicField>
        <ClinicField label="Service" required>
          <select
            className={clinicInputClass()}
            value={form.serviceId}
            onChange={(e) => setForm((f) => ({ ...f, serviceId: e.target.value }))}
          >
            <option value="">Select service</option>
            {store.services.filter((s) => s.status === 'Active').map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </ClinicField>
        <ClinicField label="Preferred therapist">
          <select
            className={clinicInputClass()}
            value={form.preferredTherapistId}
            onChange={(e) => setForm((f) => ({ ...f, preferredTherapistId: e.target.value }))}
          >
            <option value="">Any available</option>
            {store.therapists
              .filter((t) => t.status === 'Active')
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </select>
        </ClinicField>
        <ClinicField label="Contact phone" required>
          <input
            className={clinicInputClass()}
            value={form.contactPhone}
            onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
          />
        </ClinicField>
        <ClinicField label="Preferred date" required>
          <input
            type="date"
            className={clinicInputClass()}
            value={form.preferredDate}
            onChange={(e) => setForm((f) => ({ ...f, preferredDate: e.target.value }))}
          />
        </ClinicField>
        <ClinicField label="Preferred time" required>
          <input
            type="time"
            className={clinicInputClass()}
            value={form.preferredTime}
            onChange={(e) => setForm((f) => ({ ...f, preferredTime: e.target.value }))}
          />
        </ClinicField>
        <ClinicField label="Priority" required>
          <select
            className={clinicInputClass()}
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </ClinicField>
        {editOpen && (
          <ClinicField label="Status">
            <select
              className={clinicInputClass()}
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as WaitingStatus }))}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </ClinicField>
        )}
      </div>
      <ClinicField label="Notes">
        <textarea
          className={`${clinicInputClass()} min-h-[80px]`}
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
      </ClinicField>
    </>
  );

  const waitingCount = store.waitingList.filter((w) => w.status === 'Waiting').length;

  return (
    <ClinicPage>
      <ClinicMockBanner />
      <ClinicPageHeader
        title="Waiting List"
        subtitle={`${waitingCount} patients waiting for slots · prioritize urgent cases first`}
        icon={<ListOrdered className="w-5 h-5" />}
        actions={
          <ClinicButton onClick={() => { setForm(emptyForm()); setAddOpen(true); }}>
            <Plus className="w-4 h-4" />
            Add to list
          </ClinicButton>
        }
      />

      <ClinicCard
        title="Queue"
        subtitle="Search, filter, and book appointments from the waiting list"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <ClinicSearchInput value={search} onChange={setSearch} placeholder="Search patient or service…" />
            <ClinicSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All statuses' },
                ...STATUSES.map((s) => ({ value: s, label: s })),
              ]}
            />
            <ClinicSelect
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={[
                { value: 'all', label: 'All priorities' },
                ...PRIORITIES.map((p) => ({ value: p, label: p })),
              ]}
            />
          </div>
        }
        noPadding
      >
        {filtered.length === 0 ? (
          <ClinicEmptyState
            title="No waiting list entries"
            description="Add patients who need a callback when a slot opens."
            action={
              <ClinicButton onClick={() => { setForm(emptyForm()); setAddOpen(true); }}>
                <UserPlus className="w-4 h-4" />
                Add patient
              </ClinicButton>
            }
          />
        ) : (
          <ClinicTable>
            <ClinicTableHeader
              columns={[
                'Patient',
                'Service',
                'Preferred therapist',
                'Preferred slot',
                'Priority',
                'Waiting',
                'Contact',
                'Status',
                'Actions',
              ]}
            />
            <ClinicTableBody>
              {filtered.map((w) => {
                const p = patientById(w.patientId, store.patients);
                const th = w.preferredTherapistId
                  ? therapistById(w.preferredTherapistId, store.therapists)
                  : null;
                const svc = serviceById(w.serviceId, store.services);
                return (
                  <ClinicTableRow key={w.id}>
                    <ClinicTableCell>
                      <div className="flex items-center gap-2">
                        <ClinicAvatar name={fullPatientName(p)} color={p?.avatarColor} size="sm" />
                        <span className="font-semibold text-slate-900">{fullPatientName(p)}</span>
                      </div>
                    </ClinicTableCell>
                    <ClinicTableCell>{svc?.name ?? '—'}</ClinicTableCell>
                    <ClinicTableCell>{th?.name ?? 'Any'}</ClinicTableCell>
                    <ClinicTableCell>
                      <span className="font-medium">{formatDate(w.preferredDate)}</span>
                      <span className="text-slate-500 ml-1">{w.preferredTime}</span>
                    </ClinicTableCell>
                    <ClinicTableCell>
                      <ClinicStatusBadge status={w.priority} />
                    </ClinicTableCell>
                    <ClinicTableCell>
                      <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {waitingDuration(w.requestedAt)}
                      </span>
                    </ClinicTableCell>
                    <ClinicTableCell className="text-slate-600">{w.contactPhone}</ClinicTableCell>
                    <ClinicTableCell>
                      <ClinicStatusBadge status={w.status} />
                    </ClinicTableCell>
                    <ClinicTableCell>
                      <div className="flex flex-wrap gap-1">
                        <ClinicButton
                          variant="primary"
                          className="!px-2 !py-1.5"
                          disabled={w.status === 'Booked'}
                          onClick={() => openBook(w)}
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          Book
                        </ClinicButton>
                        <ClinicButton variant="secondary" className="!px-2 !py-1.5" onClick={() => contactPatient(w)}>
                          <Phone className="w-3.5 h-3.5" />
                        </ClinicButton>
                        <ClinicButton variant="ghost" className="!px-2 !py-1.5" onClick={() => openEdit(w)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </ClinicButton>
                        <ClinicButton variant="ghost" className="!px-2 !py-1.5" onClick={() => removeItem(w.id)}>
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        </ClinicButton>
                      </div>
                    </ClinicTableCell>
                  </ClinicTableRow>
                );
              })}
            </ClinicTableBody>
          </ClinicTable>
        )}
      </ClinicCard>

      <ClinicModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add to waiting list"
        actions={
          <>
            <ClinicButton variant="secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </ClinicButton>
            <ClinicButton onClick={() => saveWaiting(true)}>Save</ClinicButton>
          </>
        }
      >
        {formFields}
      </ClinicModal>

      <ClinicModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit waiting list entry"
        actions={
          <>
            <ClinicButton variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </ClinicButton>
            <ClinicButton onClick={() => saveWaiting(false)}>Update</ClinicButton>
          </>
        }
      >
        {formFields}
      </ClinicModal>

      <ClinicModal
        isOpen={bookOpen}
        onClose={() => setBookOpen(false)}
        title="Book appointment from waiting list"
        actions={
          <>
            <ClinicButton variant="secondary" onClick={() => setBookOpen(false)}>
              Cancel
            </ClinicButton>
            <ClinicButton onClick={confirmBook}>Create appointment</ClinicButton>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          This will create a scheduled appointment using the patient&apos;s preferred date, time, and service, then
          mark this waiting list entry as <strong>Booked</strong>.
        </p>
      </ClinicModal>
    </ClinicPage>
  );
}
