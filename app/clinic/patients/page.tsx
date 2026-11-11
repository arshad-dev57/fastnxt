'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Download,
  Upload,
  Eye,
  Pencil,
  Trash2,
  ArrowUpDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ClinicPage,
  ClinicMockBanner,
  ClinicPageHeader,
  ClinicStatCard,
  ClinicCard,
  ClinicStatusBadge,
  ClinicAvatar,
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
  ClinicEmptyState,
  ClinicField,
  clinicInputClass,
  CLINIC_COLORS,
} from '../ui';
import {
  useClinicStore,
  fullPatientName,
  therapistById,
  nextId,
} from '../_lib/store';
import { formatDate, ageFromDob, todayIso } from '../_lib/format';
import type { ClinicPatient, PatientStatus } from '../_lib/types';

const PAGE_SIZE = 10;
const STATUSES: PatientStatus[] = ['Active', 'Inactive', 'Discharged', 'On Hold'];
const AVATAR_COLORS = ['#0f766e', '#0891b2', '#059669', '#0284c7', '#7c3aed', '#db2777'];

type SortKey = 'name' | 'registrationDate' | 'lastVisit' | 'status';
type SortDir = 'asc' | 'desc';

function emptyPatient(patients: ClinicPatient[]): ClinicPatient {
  return {
    id: nextId('PAT', patients),
    firstName: '',
    lastName: '',
    gender: 'Male',
    dateOfBirth: '1990-01-01',
    age: ageFromDob('1990-01-01'),
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: 'Karachi',
    emergencyContact: '',
    emergencyPhone: '',
    cnic: '',
    bloodGroup: 'O+',
    referralSource: 'Self',
    registrationDate: todayIso(),
    assignedTherapistId: '',
    status: 'Active',
    notes: '',
    allergies: [],
    conditions: [],
    avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
  };
}

export default function PatientsPage() {
  const { patients, therapists, update } = useClinicStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [therapistFilter, setTherapistFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClinicPatient | null>(null);
  const [form, setForm] = useState<ClinicPatient>(() => emptyPatient(patients));

  const stats = useMemo(() => {
    const active = patients.filter((p) => p.status === 'Active').length;
    const onHold = patients.filter((p) => p.status === 'On Hold').length;
    return { total: patients.length, active, onHold };
  }, [patients]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = patients.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (genderFilter !== 'all' && p.gender !== genderFilter) return false;
      if (therapistFilter !== 'all' && p.assignedTherapistId !== therapistFilter) return false;
      if (!q) return true;
      const name = fullPatientName(p).toLowerCase();
      return (
        name.includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.email.toLowerCase().includes(q)
      );
    });
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = fullPatientName(a).localeCompare(fullPatientName(b));
      else if (sortKey === 'registrationDate') cmp = a.registrationDate.localeCompare(b.registrationDate);
      else if (sortKey === 'lastVisit') cmp = (a.lastVisit || '').localeCompare(b.lastVisit || '');
      else cmp = a.status.localeCompare(b.status);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [patients, search, statusFilter, genderFilter, therapistFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyPatient(patients));
    setModalOpen(true);
  };

  const openEdit = (p: ClinicPatient) => {
    setEditing(p);
    setForm({ ...p, allergies: p.allergies || [], conditions: p.conditions || [] });
    setModalOpen(true);
  };

  const savePatient = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error('First and last name are required');
      return;
    }
    const payload: ClinicPatient = {
      ...form,
      age: ageFromDob(form.dateOfBirth),
      assignedTherapistId: form.assignedTherapistId || undefined,
    };
    update((s) => {
      if (editing) {
        return { ...s, patients: s.patients.map((p) => (p.id === editing.id ? payload : p)) };
      }
      return { ...s, patients: [...s.patients, payload] };
    });
    toast.success(editing ? 'Patient updated' : 'Patient registered');
    setModalOpen(false);
  };

  const deletePatient = (id: string) => {
    if (!confirm('Remove this patient from the registry?')) return;
    update((s) => ({ ...s, patients: s.patients.filter((p) => p.id !== id) }));
    toast.success('Patient removed');
    setSelected((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  };

  const bulkSetStatus = (status: PatientStatus) => {
    if (selected.size === 0) {
      toast.error('Select patients first');
      return;
    }
    update((s) => ({
      ...s,
      patients: s.patients.map((p) => (selected.has(p.id) ? { ...p, status } : p)),
    }));
    toast.success(`Updated ${selected.size} patients to ${status}`);
  };

  const toggleAllPage = () => {
    const ids = paged.map((p) => p.id);
    const allOn = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const n = new Set(prev);
      ids.forEach((id) => (allOn ? n.delete(id) : n.add(id)));
      return n;
    });
  };

  return (
    <ClinicPage>
      <ClinicMockBanner />
      <ClinicPageHeader
        title="Patient Registry"
        subtitle="Manage demographics, assigned therapists, and care status across branches"
        icon={<Users className="w-5 h-5 text-white" />}
        actions={
          <>
            <ClinicButton variant="secondary" onClick={() => toast.success('Export queued — CSV download simulated')}>
              <Download className="w-3.5 h-3.5" /> Export
            </ClinicButton>
            <ClinicButton variant="secondary" onClick={() => toast.success('Import wizard opened (demo)')}>
              <Upload className="w-3.5 h-3.5" /> Import
            </ClinicButton>
            <ClinicButton onClick={openAdd}>
              <UserPlus className="w-3.5 h-3.5" /> Add Patient
            </ClinicButton>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ClinicStatCard label="Total Patients" value={stats.total} icon={Users} color={CLINIC_COLORS.primary} />
        <ClinicStatCard label="Active" value={stats.active} icon={Users} color={CLINIC_COLORS.success} hint="Currently in care" />
        <ClinicStatCard label="On Hold" value={stats.onHold} icon={Users} color={CLINIC_COLORS.warning} />
      </div>

      <ClinicCard title="Filters & search" noPadding>
        <div className="p-5 space-y-4">
          <div className="flex flex-col lg:flex-row flex-wrap gap-3 items-start lg:items-center justify-between">
            <ClinicSearchInput value={search} onChange={setSearch} placeholder="Search name, ID, phone, email…" />
            <div className="flex flex-wrap gap-2">
              <ClinicSelect
                value={statusFilter}
                onChange={(v) => {
                  setStatusFilter(v);
                  setPage(1);
                }}
                options={[{ value: 'all', label: 'All statuses' }, ...STATUSES.map((s) => ({ value: s, label: s }))]}
              />
              <ClinicSelect
                value={genderFilter}
                onChange={(v) => {
                  setGenderFilter(v);
                  setPage(1);
                }}
                options={[
                  { value: 'all', label: 'All genders' },
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
              <ClinicSelect
                value={therapistFilter}
                onChange={(v) => {
                  setTherapistFilter(v);
                  setPage(1);
                }}
                options={[
                  { value: 'all', label: 'All therapists' },
                  ...therapists.map((t) => ({ value: t.id, label: t.name })),
                ]}
              />
            </div>
          </div>
          {selected.size > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-teal-50 border border-teal-100 text-xs">
              <span className="font-semibold text-teal-900">{selected.size} selected</span>
              {STATUSES.map((st) => (
                <ClinicButton key={st} variant="secondary" onClick={() => bulkSetStatus(st)}>
                  Mark {st}
                </ClinicButton>
              ))}
            </div>
          )}
        </div>
        {filtered.length === 0 ? (
          <ClinicEmptyState title="No patients match" description="Adjust filters or register a new patient." action={<ClinicButton onClick={openAdd}>Add Patient</ClinicButton>} />
        ) : (
          <>
            <ClinicTable>
              <ClinicTableHeader
                columns={[
                  '',
                  'ID',
                  'Patient',
                  'Gender',
                  'Age',
                  'Phone',
                  'Email',
                  'Registered',
                  'Therapist',
                  'Last visit',
                  'Next appt',
                  'Status',
                  'Actions',
                ]}
              />
              <ClinicTableBody>
                {paged.map((p) => {
                  const th = therapistById(p.assignedTherapistId || '', therapists);
                  return (
                    <ClinicTableRow key={p.id}>
                      <ClinicTableCell className="w-10">
                        <input
                          type="checkbox"
                          checked={selected.has(p.id)}
                          onChange={() =>
                            setSelected((prev) => {
                              const n = new Set(prev);
                              if (n.has(p.id)) n.delete(p.id);
                              else n.add(p.id);
                              return n;
                            })
                          }
                          className="rounded border-slate-300"
                        />
                      </ClinicTableCell>
                      <ClinicTableCell className="font-mono text-[11px] text-teal-800">{p.id}</ClinicTableCell>
                      <ClinicTableCell>
                        <div className="flex items-center gap-2">
                          <ClinicAvatar name={fullPatientName(p)} color={p.avatarColor} size="sm" />
                          <span className="font-semibold text-slate-900">{fullPatientName(p)}</span>
                        </div>
                      </ClinicTableCell>
                      <ClinicTableCell>{p.gender}</ClinicTableCell>
                      <ClinicTableCell>{p.age}</ClinicTableCell>
                      <ClinicTableCell className="whitespace-nowrap">{p.phone}</ClinicTableCell>
                      <ClinicTableCell className="max-w-[140px] truncate">{p.email}</ClinicTableCell>
                      <ClinicTableCell>{formatDate(p.registrationDate)}</ClinicTableCell>
                      <ClinicTableCell className="max-w-[120px] truncate">{th?.name || '—'}</ClinicTableCell>
                      <ClinicTableCell>{formatDate(p.lastVisit || '')}</ClinicTableCell>
                      <ClinicTableCell>{formatDate(p.nextAppointment || '')}</ClinicTableCell>
                      <ClinicTableCell>
                        <ClinicStatusBadge status={p.status} />
                      </ClinicTableCell>
                      <ClinicTableCell>
                        <div className="flex items-center gap-1">
                          <Link href={`/clinic/patients/${p.id}`} className="p-1.5 rounded-lg hover:bg-teal-50 text-teal-700" title="View">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button type="button" onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => deletePatient(p.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </ClinicTableCell>
                    </ClinicTableRow>
                  );
                })}
              </ClinicTableBody>
            </ClinicTable>
            <div className="px-4 flex items-center justify-between border-t border-[#d1e7df]">
              <label className="flex items-center gap-2 text-xs text-slate-600 py-2">
                <input type="checkbox" checked={paged.length > 0 && paged.every((p) => selected.has(p.id))} onChange={toggleAllPage} />
                Select page
              </label>
              <div className="flex gap-2 text-xs">
                <button type="button" className="flex items-center gap-1 text-teal-700 font-semibold" onClick={() => toggleSort('name')}>
                  Name <ArrowUpDown className="w-3 h-3" />
                </button>
                <button type="button" className="flex items-center gap-1 text-teal-700 font-semibold" onClick={() => toggleSort('registrationDate')}>
                  Registered <ArrowUpDown className="w-3 h-3" />
                </button>
              </div>
              <ClinicPagination currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
            </div>
          </>
        )}
      </ClinicCard>

      <ClinicModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${fullPatientName(editing)}` : 'Register New Patient'}
        maxWidth="max-w-3xl"
        actions={
          <>
            <ClinicButton variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </ClinicButton>
            <ClinicButton onClick={savePatient}>{editing ? 'Save changes' : 'Register'}</ClinicButton>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ClinicField label="Patient ID">
            <input className={clinicInputClass()} value={form.id} readOnly />
          </ClinicField>
          <ClinicField label="Status" required>
            <ClinicSelect value={form.status} onChange={(v) => setForm({ ...form, status: v as PatientStatus })} options={STATUSES.map((s) => ({ value: s, label: s }))} className="w-full" />
          </ClinicField>
          <ClinicField label="First name" required>
            <input className={clinicInputClass()} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </ClinicField>
          <ClinicField label="Last name" required>
            <input className={clinicInputClass()} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </ClinicField>
          <ClinicField label="Gender">
            <ClinicSelect value={form.gender} onChange={(v) => setForm({ ...form, gender: v as ClinicPatient['gender'] })} options={['Male', 'Female', 'Other'].map((g) => ({ value: g, label: g }))} className="w-full" />
          </ClinicField>
          <ClinicField label="Date of birth">
            <input
              type="date"
              className={clinicInputClass()}
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value, age: ageFromDob(e.target.value) })}
            />
          </ClinicField>
          <ClinicField label="Age (auto)">
            <input className={clinicInputClass()} value={form.age} readOnly />
          </ClinicField>
          <ClinicField label="Blood group">
            <ClinicSelect
              value={form.bloodGroup || 'O+'}
              onChange={(v) => setForm({ ...form, bloodGroup: v })}
              options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => ({ value: b, label: b }))}
              className="w-full"
            />
          </ClinicField>
          <ClinicField label="Phone" required>
            <input className={clinicInputClass()} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+92 3xx …" />
          </ClinicField>
          <ClinicField label="WhatsApp">
            <input className={clinicInputClass()} value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
          </ClinicField>
          <ClinicField label="Email">
            <input type="email" className={clinicInputClass()} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </ClinicField>
          <ClinicField label="CNIC">
            <input className={clinicInputClass()} value={form.cnic || ''} onChange={(e) => setForm({ ...form, cnic: e.target.value })} placeholder="42101-…" />
          </ClinicField>
          <ClinicField label="Address">
            <input className={clinicInputClass()} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </ClinicField>
          <ClinicField label="City">
            <input className={clinicInputClass()} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </ClinicField>
          <ClinicField label="Emergency contact">
            <input className={clinicInputClass()} value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />
          </ClinicField>
          <ClinicField label="Emergency phone">
            <input className={clinicInputClass()} value={form.emergencyPhone} onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })} />
          </ClinicField>
          <ClinicField label="Referral source">
            <input className={clinicInputClass()} value={form.referralSource} onChange={(e) => setForm({ ...form, referralSource: e.target.value })} />
          </ClinicField>
          <ClinicField label="Registration date">
            <input type="date" className={clinicInputClass()} value={form.registrationDate} onChange={(e) => setForm({ ...form, registrationDate: e.target.value })} />
          </ClinicField>
          <ClinicField label="Assigned therapist">
            <ClinicSelect
              value={form.assignedTherapistId || ''}
              onChange={(v) => setForm({ ...form, assignedTherapistId: v })}
              options={[{ value: '', label: 'Unassigned' }, ...therapists.map((t) => ({ value: t.id, label: t.name }))]}
              className="w-full"
            />
          </ClinicField>
          <div className="sm:col-span-2">
            <ClinicField label="Clinical notes">
              <textarea className={clinicInputClass() + ' min-h-[80px]'} value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </ClinicField>
          </div>
        </div>
      </ClinicModal>
    </ClinicPage>
  );
}
