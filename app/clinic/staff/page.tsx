'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from 'react';
import { UserCog, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ClinicPage,
  ClinicMockBanner,
  ClinicPageHeader,
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
  ClinicField,
  ClinicPagination,
  clinicInputClass,
} from '../ui';
import { useClinicStore, nextId } from '../_lib/store';
import { formatDate } from '../_lib/format';
import type { ClinicStaff, StaffStatus } from '../_lib/types';

const ROLES: ClinicStaff['role'][] = [
  'Clinic Administrator',
  'Receptionist',
  'Therapist',
  'Nurse',
  'Assistant',
  'Billing Staff',
];

export default function StaffPage() {
  const store = useClinicStore();
  const [q, setQ] = useState('');
  const [role, setRole] = useState('All');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClinicStaff | null>(null);
  const [form, setForm] = useState({
    name: '',
    role: 'Receptionist' as ClinicStaff['role'],
    phone: '',
    email: '',
    branch: 'Karachi PECHS',
    status: 'Active' as StaffStatus,
    joiningDate: new Date().toISOString().slice(0, 10),
    shift: '09:00–17:00',
  });
  const pageSize = 8;

  const filtered = useMemo(() => {
    return store.staff.filter((s) => {
      const hay = `${s.name} ${s.role} ${s.email} ${s.branch}`.toLowerCase();
      return (!q || hay.includes(q.toLowerCase())) && (role === 'All' || s.role === role);
    });
  }, [store.staff, q, role]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const save = () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    const payload: ClinicStaff = {
      id: editing?.id || nextId('ST', store.staff),
      ...form,
      name: form.name.trim(),
      avatarColor: editing?.avatarColor || '#0f766e',
    };
    store.update((prev) => ({
      ...prev,
      staff: editing
        ? prev.staff.map((s) => (s.id === editing.id ? payload : s))
        : [payload, ...prev.staff],
    }));
    toast.success(editing ? 'Staff updated' : 'Staff added');
    setOpen(false);
  };

  return (
    <ClinicPage>
      <ClinicMockBanner />
      <ClinicPageHeader
        title="Staff Management"
        subtitle="Clinic team directory, shifts and leave overview"
        icon={<UserCog className="w-5 h-5 text-white" />}
        actions={
          <ClinicButton onClick={() => {
            setEditing(null);
            setForm({
              name: '',
              role: 'Receptionist',
              phone: '',
              email: '',
              branch: 'Karachi PECHS',
              status: 'Active',
              joiningDate: new Date().toISOString().slice(0, 10),
              shift: '09:00–17:00',
            });
            setOpen(true);
          }}>
            <Plus className="w-4 h-4" /> Add Staff
          </ClinicButton>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {ROLES.map((r) => (
          <ClinicCard key={r} className="!rounded-xl">
            <p className="text-[11px] text-slate-500 font-semibold">{r}</p>
            <p className="text-2xl font-extrabold text-teal-800 mt-1">
              {store.staff.filter((s) => s.role === r).length}
            </p>
          </ClinicCard>
        ))}
      </div>

      <ClinicCard title="Staff Directory" subtitle="Attendance overview shown as demo percentages">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <ClinicSearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search staff…" />
          <ClinicSelect
            value={role}
            onChange={(v) => { setRole(v); setPage(1); }}
            options={[{ value: 'All', label: 'All roles' }, ...ROLES.map((r) => ({ value: r, label: r }))]}
          />
        </div>
        <ClinicTable>
          <ClinicTableHeader columns={['Staff', 'Role', 'Contact', 'Branch', 'Shift', 'Joined', 'Attendance', 'Status', 'Actions']} />
          <ClinicTableBody>
            {rows.map((s, idx) => (
              <ClinicTableRow key={s.id}>
                <ClinicTableCell>
                  <div className="flex items-center gap-2">
                    <ClinicAvatar name={s.name} color={s.avatarColor} size="sm" />
                    <div>
                      <p className="font-semibold text-slate-900">{s.name}</p>
                      <p className="text-[11px] text-slate-500">{s.id}</p>
                    </div>
                  </div>
                </ClinicTableCell>
                <ClinicTableCell>{s.role}</ClinicTableCell>
                <ClinicTableCell>
                  <div className="text-xs">
                    <p>{s.phone}</p>
                    <p className="text-slate-500">{s.email}</p>
                  </div>
                </ClinicTableCell>
                <ClinicTableCell>{s.branch}</ClinicTableCell>
                <ClinicTableCell>{s.shift}</ClinicTableCell>
                <ClinicTableCell>{formatDate(s.joiningDate)}</ClinicTableCell>
                <ClinicTableCell>{s.status === 'Active' ? `${92 - (idx % 7)}%` : '—'}</ClinicTableCell>
                <ClinicTableCell><ClinicStatusBadge status={s.status} /></ClinicTableCell>
                <ClinicTableCell>
                  <button type="button" className="text-xs font-bold text-teal-700" onClick={() => {
                    setEditing(s);
                    setForm({
                      name: s.name,
                      role: s.role,
                      phone: s.phone,
                      email: s.email,
                      branch: s.branch,
                      status: s.status,
                      joiningDate: s.joiningDate,
                      shift: s.shift,
                    });
                    setOpen(true);
                  }}>Edit</button>
                </ClinicTableCell>
              </ClinicTableRow>
            ))}
          </ClinicTableBody>
        </ClinicTable>
        <ClinicPagination currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={pageSize} onPageChange={setPage} />
      </ClinicCard>

      <ClinicCard title="Leave Records" subtitle="Recent leave activity">
        <div className="space-y-2">
          {store.staff.filter((s) => s.status === 'On Leave').length === 0 ? (
            <p className="text-sm text-slate-500">No staff currently on leave.</p>
          ) : (
            store.staff.filter((s) => s.status === 'On Leave').map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <ClinicAvatar name={s.name} color={s.avatarColor} size="sm" />
                  <div>
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.role} · {s.branch}</p>
                  </div>
                </div>
                <ClinicStatusBadge status="On Leave" />
              </div>
            ))
          )}
        </div>
      </ClinicCard>

      <ClinicModal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Edit Staff' : 'Add Staff'} actions={<><ClinicButton variant="secondary" onClick={() => setOpen(false)}>Cancel</ClinicButton><ClinicButton onClick={save}>Save</ClinicButton></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ClinicField label="Name" required><input className={clinicInputClass()} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></ClinicField>
          <ClinicField label="Role">
            <select className={clinicInputClass()} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as ClinicStaff['role'] })}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </ClinicField>
          <ClinicField label="Phone"><input className={clinicInputClass()} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></ClinicField>
          <ClinicField label="Email"><input className={clinicInputClass()} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></ClinicField>
          <ClinicField label="Branch"><input className={clinicInputClass()} value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} /></ClinicField>
          <ClinicField label="Shift"><input className={clinicInputClass()} value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })} /></ClinicField>
          <ClinicField label="Joining date"><input type="date" className={clinicInputClass()} value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} /></ClinicField>
          <ClinicField label="Status">
            <select className={clinicInputClass()} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as StaffStatus })}>
              {['Active', 'On Leave', 'Inactive'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </ClinicField>
        </div>
      </ClinicModal>
    </ClinicPage>
  );
}
