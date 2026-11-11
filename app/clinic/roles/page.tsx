'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from 'react';
import { Shield, Plus, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ClinicPage,
  ClinicMockBanner,
  ClinicPageHeader,
  ClinicCard,
  ClinicButton,
  ClinicModal,
  ClinicField,
  clinicInputClass,
} from '../ui';
import { useClinicStore, nextId } from '../_lib/store';
import type { ClinicRole } from '../_lib/types';

const CATS = [
  'Dashboard',
  'Patients',
  'Appointments',
  'Medical Records',
  'Sessions',
  'Treatment Plans',
  'Therapists',
  'Billing',
  'Payments',
  'Inventory',
  'Reports',
  'Settings',
] as const;

const TYPES = ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Export'] as const;

function emptyPerms(): ClinicRole['permissions'] {
  return Object.fromEntries(CATS.map((c) => [c, []])) as ClinicRole['permissions'];
}

export default function RolesPage() {
  const store = useClinicStore();
  const [selectedId, setSelectedId] = useState(store.roles[0]?.id || '');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const selected = useMemo(
    () => store.roles.find((r) => r.id === selectedId) || store.roles[0],
    [store.roles, selectedId]
  );

  const toggle = (cat: string, type: (typeof TYPES)[number]) => {
    if (!selected) return;
    store.update((prev) => ({
      ...prev,
      roles: prev.roles.map((r) => {
        if (r.id !== selected.id) return r;
        const current = new Set(r.permissions[cat] || []);
        if (current.has(type)) current.delete(type);
        else current.add(type);
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [cat]: Array.from(current) as ClinicRole['permissions'][string],
          },
        };
      }),
    }));
  };

  const createRole = () => {
    if (!name.trim()) {
      toast.error('Role name is required');
      return;
    }
    const role: ClinicRole = {
      id: nextId('ROLE', store.roles),
      name: name.trim(),
      description,
      permissions: emptyPerms(),
      usersCount: 0,
    };
    store.update((prev) => ({ ...prev, roles: [...prev.roles, role] }));
    setSelectedId(role.id);
    setOpen(false);
    toast.success('Role created');
  };

  const duplicate = () => {
    if (!selected) return;
    const role: ClinicRole = {
      ...selected,
      id: nextId('ROLE', store.roles),
      name: `${selected.name} Copy`,
      usersCount: 0,
      permissions: JSON.parse(JSON.stringify(selected.permissions)),
    };
    store.update((prev) => ({ ...prev, roles: [...prev.roles, role] }));
    setSelectedId(role.id);
    toast.success('Role duplicated');
  };

  return (
    <ClinicPage fullWidth>
      <ClinicMockBanner />
      <ClinicPageHeader
        title="Roles & Permissions"
        subtitle="Granular access control for clinic operations"
        icon={<Shield className="w-5 h-5 text-white" />}
        actions={
          <div className="flex gap-2">
            <ClinicButton variant="secondary" onClick={duplicate}>
              <Copy className="w-4 h-4" /> Duplicate
            </ClinicButton>
            <ClinicButton onClick={() => { setName(''); setDescription(''); setOpen(true); }}>
              <Plus className="w-4 h-4" /> Create Role
            </ClinicButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        <ClinicCard title="Roles" noPadding>
          <div className="p-2 space-y-1">
            {store.roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedId(r.id)}
                className={`w-full text-left rounded-xl px-3 py-3 transition-all ${
                  selected?.id === r.id ? 'bg-teal-700 text-white' : 'hover:bg-teal-50 text-slate-700'
                }`}
              >
                <p className="text-sm font-bold">{r.name}</p>
                <p className={`text-[11px] mt-0.5 ${selected?.id === r.id ? 'text-white/70' : 'text-slate-500'}`}>
                  {r.usersCount} users · {r.description}
                </p>
              </button>
            ))}
          </div>
        </ClinicCard>

        <ClinicCard title={selected ? `${selected.name} permissions` : 'Select a role'} subtitle="Toggle View / Create / Edit / Delete / Approve / Export">
          {selected && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-teal-50 text-teal-900">
                    <th className="text-left px-3 py-2 font-bold">Module</th>
                    {TYPES.map((t) => (
                      <th key={t} className="px-2 py-2 font-bold text-center">{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CATS.map((cat) => (
                    <tr key={cat} className="border-b border-teal-50">
                      <td className="px-3 py-2 font-semibold text-slate-800">{cat}</td>
                      {TYPES.map((t) => {
                        const on = (selected.permissions[cat] || []).includes(t);
                        return (
                          <td key={t} className="px-2 py-2 text-center">
                            <input type="checkbox" checked={on} onChange={() => toggle(cat, t)} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ClinicCard>
      </div>

      <ClinicModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create Role"
        actions={
          <>
            <ClinicButton variant="secondary" onClick={() => setOpen(false)}>Cancel</ClinicButton>
            <ClinicButton onClick={createRole}>Create</ClinicButton>
          </>
        }
      >
        <ClinicField label="Role name" required>
          <input className={clinicInputClass()} value={name} onChange={(e) => setName(e.target.value)} />
        </ClinicField>
        <ClinicField label="Description">
          <textarea className={clinicInputClass()} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </ClinicField>
      </ClinicModal>
    </ClinicPage>
  );
}
