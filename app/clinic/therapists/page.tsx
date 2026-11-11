'use client';

export const dynamic = 'force-dynamic';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  UserRound,
  Plus,
  LayoutGrid,
  Rows3,
  Phone,
  Mail,
  MapPin,
  BadgePercent,
  Eye,
} from 'lucide-react';
import {
  ClinicPage,
  ClinicMockBanner,
  ClinicPageHeader,
  ClinicCard,
  ClinicStatCard,
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
  ClinicProgress,
} from '../ui';
import { useClinicStore, nextId } from '../_lib/store';
import { formatPkr } from '../_lib/format';
import type { ClinicTherapist, StaffStatus } from '../_lib/types';

const AVATAR_COLORS = ['#0f766e', '#0d9488', '#115e59', '#14b8a6', '#059669', '#0284c7', '#7c3aed', '#d97706'];
const EMPLOYMENT_TYPES: ClinicTherapist['employmentType'][] = ['Full-time', 'Part-time', 'Consultant'];
const STATUSES: StaffStatus[] = ['Active', 'On Leave', 'Inactive'];

function emptyTherapist(): Omit<ClinicTherapist, 'id'> {
  return {
    name: '',
    qualification: '',
    specialization: '',
    experienceYears: 0,
    phone: '',
    email: '',
    employmentType: 'Full-time',
    joiningDate: new Date().toISOString().slice(0, 10),
    branch: 'Karachi PECHS',
    consultationFee: 3000,
    sessionFee: 2200,
    commissionPercent: 15,
    status: 'Active',
    avatarColor: AVATAR_COLORS[0],
    todayAppointments: 0,
    utilization: 0,
  };
}

export default function ClinicTherapistsPage() {
  const store = useClinicStore();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyTherapist());

  const branches = useMemo(() => {
    const set = new Set(store.therapists.map((t) => t.branch));
    store.staff.forEach((s) => set.add(s.branch));
    return Array.from(set).sort();
  }, [store.therapists, store.staff]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return store.therapists.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (branchFilter !== 'all' && t.branch !== branchFilter) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.specialization.toLowerCase().includes(q) ||
        t.qualification.toLowerCase().includes(q)
      );
    });
  }, [store.therapists, search, statusFilter, branchFilter]);

  const stats = useMemo(() => {
    const active = store.therapists.filter((t) => t.status === 'Active').length;
    const onLeave = store.therapists.filter((t) => t.status === 'On Leave').length;
    const avgUtil =
      store.therapists.length === 0
        ? 0
        : Math.round(
            store.therapists.reduce((s, t) => s + t.utilization, 0) / store.therapists.length
          );
    const todayAppts = store.therapists.reduce((s, t) => s + t.todayAppointments, 0);
    return { total: store.therapists.length, active, onLeave, avgUtil, todayAppts };
  }, [store.therapists]);

  const saveTherapist = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }
    const id = nextId('TH', store.therapists);
    const avatarColor = AVATAR_COLORS[store.therapists.length % AVATAR_COLORS.length];
    store.update((prev) => ({
      ...prev,
      therapists: [
        ...prev.therapists,
        {
          ...form,
          id,
          name: form.name.trim(),
          avatarColor,
          todayAppointments: 0,
          utilization: 0,
        },
      ],
    }));
    toast.success(`Therapist ${form.name} registered (${id})`);
    setModalOpen(false);
    setForm(emptyTherapist());
  };

  const openProfile = (id: string) => router.push(`/clinic/therapists/${id}`);

  return (
    <ClinicPage>
      <ClinicMockBanner />
      <ClinicPageHeader
        title="Therapist Directory"
        subtitle="Manage clinical staff, fees, utilization, and profiles"
        icon={<UserRound className="w-5 h-5 text-white" />}
        actions={
          <>
            <ClinicButton variant="secondary" onClick={() => setView(view === 'cards' ? 'table' : 'cards')}>
              {view === 'cards' ? <Rows3 className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
              {view === 'cards' ? 'Table view' : 'Card view'}
            </ClinicButton>
            <ClinicButton onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Add therapist
            </ClinicButton>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <ClinicStatCard label="Total therapists" value={stats.total} icon={UserRound} />
        <ClinicStatCard label="Active" value={stats.active} icon={UserRound} color="#059669" />
        <ClinicStatCard label="On leave" value={stats.onLeave} icon={UserRound} color="#d97706" />
        <ClinicStatCard label="Avg utilization" value={`${stats.avgUtil}%`} icon={BadgePercent} />
        <ClinicStatCard label="Today's appointments" value={stats.todayAppts} icon={UserRound} color="#0284c7" />
      </div>

      <ClinicCard
        title="Search & filter"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <ClinicSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search name, ID, specialization…"
            />
            <ClinicSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All statuses' },
                ...STATUSES.map((s) => ({ value: s, label: s })),
              ]}
            />
            <ClinicSelect
              value={branchFilter}
              onChange={setBranchFilter}
              options={[{ value: 'all', label: 'All branches' }, ...branches.map((b) => ({ value: b, label: b }))]}
            />
          </div>
        }
        noPadding
      >
        <div className="p-5">
          {filtered.length === 0 ? (
            <ClinicEmptyState
              title="No therapists found"
              description="Adjust filters or add a new therapist."
              action={
                <ClinicButton onClick={() => setModalOpen(true)}>
                  <Plus className="w-4 h-4" />
                  Add therapist
                </ClinicButton>
              }
            />
          ) : view === 'cards' ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border border-[#d1e7df] bg-gradient-to-br from-white to-teal-50/30 p-4 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => openProfile(t.id)}
                  onKeyDown={(e) => e.key === 'Enter' && openProfile(t.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-start gap-3">
                    <ClinicAvatar name={t.name} color={t.avatarColor} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono text-slate-500">{t.id}</span>
                        <ClinicStatusBadge status={t.status} />
                      </div>
                      <h3 className="font-bold text-slate-900 mt-1 truncate">{t.name}</h3>
                      <p className="text-xs text-teal-700 font-semibold">{t.specialization}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{t.qualification} · {t.experienceYears} yrs</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-teal-600" />
                      {t.phone}
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-teal-600" />
                      {t.email}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      {t.branch}
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-xl bg-white border border-[#d1e7df] py-2">
                      <p className="text-lg font-bold text-teal-800">{t.todayAppointments}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">Today</p>
                    </div>
                    <div className="rounded-xl bg-white border border-[#d1e7df] py-2 px-2">
                      <ClinicProgress value={t.utilization} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Session {formatPkr(t.sessionFee)}</span>
                    <Link
                      href={`/clinic/therapists/${t.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-teal-700 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ClinicTable>
              <ClinicTableHeader
                columns={[
                  'Therapist',
                  'ID',
                  'Specialization',
                  'Qualification',
                  'Exp.',
                  'Contact',
                  'Branch',
                  'Status',
                  'Today',
                  'Utilization',
                  '',
                ]}
              />
              <ClinicTableBody>
                {filtered.map((t) => (
                  <ClinicTableRow key={t.id} onClick={() => openProfile(t.id)}>
                    <ClinicTableCell>
                      <div className="flex items-center gap-2">
                        <ClinicAvatar name={t.name} color={t.avatarColor} size="sm" />
                        <span className="font-semibold text-slate-900">{t.name}</span>
                      </div>
                    </ClinicTableCell>
                    <ClinicTableCell className="font-mono text-xs">{t.id}</ClinicTableCell>
                    <ClinicTableCell>{t.specialization}</ClinicTableCell>
                    <ClinicTableCell>{t.qualification}</ClinicTableCell>
                    <ClinicTableCell>{t.experienceYears}y</ClinicTableCell>
                    <ClinicTableCell>
                      <div className="flex flex-col items-start gap-0.5">
                        <span>{t.phone}</span>
                        <span className="text-slate-400 text-[11px]">{t.email}</span>
                      </div>
                    </ClinicTableCell>
                    <ClinicTableCell>{t.branch}</ClinicTableCell>
                    <ClinicTableCell>
                      <ClinicStatusBadge status={t.status} />
                    </ClinicTableCell>
                    <ClinicTableCell className="font-bold text-teal-800">{t.todayAppointments}</ClinicTableCell>
                    <ClinicTableCell>
                      <div className="w-24">
                        <ClinicProgress value={t.utilization} />
                      </div>
                    </ClinicTableCell>
                    <ClinicTableCell>
                      <span
                        className="text-teal-700 font-bold text-xs cursor-pointer hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          openProfile(t.id);
                        }}
                      >
                        View
                      </span>
                    </ClinicTableCell>
                  </ClinicTableRow>
                ))}
              </ClinicTableBody>
            </ClinicTable>
          )}
        </div>
      </ClinicCard>

      <ClinicModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setForm(emptyTherapist());
        }}
        title="Register therapist"
        maxWidth="max-w-3xl"
        actions={
          <>
            <ClinicButton variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </ClinicButton>
            <ClinicButton onClick={saveTherapist}>Save therapist</ClinicButton>
          </>
        }
      >
        <p className="text-xs text-slate-500 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
          Therapist ID is assigned automatically on save.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <ClinicField label="Full name" required>
            <input
              className={clinicInputClass()}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Dr. Ayesha Khan"
            />
          </ClinicField>
          <ClinicField label="Qualification" required>
            <input
              className={clinicInputClass()}
              value={form.qualification}
              onChange={(e) => setForm({ ...form, qualification: e.target.value })}
            />
          </ClinicField>
          <ClinicField label="Specialization" required>
            <input
              className={clinicInputClass()}
              value={form.specialization}
              onChange={(e) => setForm({ ...form, specialization: e.target.value })}
            />
          </ClinicField>
          <ClinicField label="Experience (years)">
            <input
              type="number"
              min={0}
              className={clinicInputClass()}
              value={form.experienceYears}
              onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) || 0 })}
            />
          </ClinicField>
          <ClinicField label="Phone" required>
            <input
              className={clinicInputClass()}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </ClinicField>
          <ClinicField label="Email">
            <input
              type="email"
              className={clinicInputClass()}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </ClinicField>
          <ClinicField label="Employment type">
            <ClinicSelect
              value={form.employmentType}
              onChange={(v) => setForm({ ...form, employmentType: v as ClinicTherapist['employmentType'] })}
              options={EMPLOYMENT_TYPES.map((e) => ({ value: e, label: e }))}
              className="w-full"
            />
          </ClinicField>
          <ClinicField label="Joining date">
            <input
              type="date"
              className={clinicInputClass()}
              value={form.joiningDate}
              onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
            />
          </ClinicField>
          <ClinicField label="Branch">
            <ClinicSelect
              value={form.branch}
              onChange={(v) => setForm({ ...form, branch: v })}
              options={branches.map((b) => ({ value: b, label: b }))}
              className="w-full"
            />
          </ClinicField>
          <ClinicField label="Status">
            <ClinicSelect
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v as StaffStatus })}
              options={STATUSES.map((s) => ({ value: s, label: s }))}
              className="w-full"
            />
          </ClinicField>
          <ClinicField label="Consultation fee (PKR)">
            <input
              type="number"
              className={clinicInputClass()}
              value={form.consultationFee}
              onChange={(e) => setForm({ ...form, consultationFee: Number(e.target.value) || 0 })}
            />
          </ClinicField>
          <ClinicField label="Session fee (PKR)">
            <input
              type="number"
              className={clinicInputClass()}
              value={form.sessionFee}
              onChange={(e) => setForm({ ...form, sessionFee: Number(e.target.value) || 0 })}
            />
          </ClinicField>
          <ClinicField label="Commission %">
            <input
              type="number"
              min={0}
              max={100}
              className={clinicInputClass()}
              value={form.commissionPercent}
              onChange={(e) => setForm({ ...form, commissionPercent: Number(e.target.value) || 0 })}
            />
          </ClinicField>
        </div>
      </ClinicModal>
    </ClinicPage>
  );
}
