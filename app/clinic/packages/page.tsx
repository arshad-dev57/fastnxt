'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from 'react';
import { Boxes, Plus, RefreshCw } from 'lucide-react';
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
  ClinicButton,
  ClinicModal,
  ClinicField,
  ClinicProgress,
  clinicInputClass,
} from '../ui';
import { useClinicStore, fullPatientName, nextId } from '../_lib/store';
import { formatDate, formatPkr } from '../_lib/format';
import type { TherapyPackage } from '../_lib/types';

export default function PackagesPage() {
  const store = useClinicStore();
  const [open, setOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [editing, setEditing] = useState<TherapyPackage | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    sessions: 5,
    price: 10000,
    validityDays: 60,
    discountPercent: 10,
    status: 'Active' as TherapyPackage['status'],
  });
  const [assign, setAssign] = useState({ patientId: '', packageId: '' });

  const patientPackages = useMemo(() => store.patientPackages, [store.patientPackages]);

  const savePackage = () => {
    if (!form.name.trim()) {
      toast.error('Package name is required');
      return;
    }
    const payload: TherapyPackage = {
      id: editing?.id || nextId('PKG', store.packages),
      name: form.name.trim(),
      description: form.description,
      serviceIds: editing?.serviceIds || ['SRV-002'],
      sessions: Number(form.sessions),
      price: Number(form.price),
      validityDays: Number(form.validityDays),
      discountPercent: Number(form.discountPercent),
      status: form.status,
    };
    store.update((prev) => ({
      ...prev,
      packages: editing
        ? prev.packages.map((p) => (p.id === editing.id ? payload : p))
        : [payload, ...prev.packages],
    }));
    toast.success(editing ? 'Package updated' : 'Package created');
    setOpen(false);
  };

  const assignPackage = () => {
    const pkg = store.packages.find((p) => p.id === assign.packageId);
    if (!pkg || !assign.patientId) {
      toast.error('Select patient and package');
      return;
    }
    const purchaseDate = new Date().toISOString().slice(0, 10);
    const expiry = new Date(Date.now() + pkg.validityDays * 86400000).toISOString().slice(0, 10);
    store.update((prev) => ({
      ...prev,
      patientPackages: [
        {
          id: nextId('PP', prev.patientPackages),
          patientId: assign.patientId,
          packageId: pkg.id,
          purchasedSessions: pkg.sessions,
          usedSessions: 0,
          purchaseDate,
          expiryDate: expiry,
          status: 'Active',
        },
        ...prev.patientPackages,
      ],
    }));
    toast.success('Package assigned to patient');
    setAssignOpen(false);
  };

  const renew = (id: string) => {
    store.update((prev) => ({
      ...prev,
      patientPackages: prev.patientPackages.map((pp) => {
        if (pp.id !== id) return pp;
        const pkg = prev.packages.find((p) => p.id === pp.packageId);
        return {
          ...pp,
          purchasedSessions: pkg?.sessions || pp.purchasedSessions,
          usedSessions: 0,
          purchaseDate: new Date().toISOString().slice(0, 10),
          expiryDate: new Date(Date.now() + (pkg?.validityDays || 60) * 86400000)
            .toISOString()
            .slice(0, 10),
          status: 'Renewed' as const,
        };
      }),
    }));
    toast.success('Package renewed');
  };

  return (
    <ClinicPage>
      <ClinicMockBanner />
      <ClinicPageHeader
        title="Therapy Packages"
        subtitle="Session bundles, pricing and patient package balances"
        icon={<Boxes className="w-5 h-5 text-white" />}
        actions={
          <div className="flex gap-2">
            <ClinicButton variant="secondary" onClick={() => {
              setAssign({ patientId: store.patients[0]?.id || '', packageId: store.packages[0]?.id || '' });
              setAssignOpen(true);
            }}>
              Assign to Patient
            </ClinicButton>
            <ClinicButton onClick={() => {
              setEditing(null);
              setForm({ name: '', description: '', sessions: 5, price: 10000, validityDays: 60, discountPercent: 10, status: 'Active' });
              setOpen(true);
            }}>
              <Plus className="w-4 h-4" /> New Package
            </ClinicButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {store.packages.map((pkg) => (
          <ClinicCard
            key={pkg.id}
            title={pkg.name}
            subtitle={pkg.description}
            action={<ClinicStatusBadge status={pkg.status} />}
          >
            <div className="space-y-2 text-sm">
              <p><span className="text-slate-500">Sessions:</span> <strong>{pkg.sessions}</strong></p>
              <p><span className="text-slate-500">Price:</span> <strong className="text-teal-800">{formatPkr(pkg.price)}</strong></p>
              <p><span className="text-slate-500">Validity:</span> {pkg.validityDays} days</p>
              <p><span className="text-slate-500">Discount:</span> {pkg.discountPercent}%</p>
              <ClinicButton
                variant="secondary"
                className="mt-2 w-full"
                onClick={() => {
                  setEditing(pkg);
                  setForm({
                    name: pkg.name,
                    description: pkg.description,
                    sessions: pkg.sessions,
                    price: pkg.price,
                    validityDays: pkg.validityDays,
                    discountPercent: pkg.discountPercent,
                    status: pkg.status,
                  });
                  setOpen(true);
                }}
              >
                Edit Package
              </ClinicButton>
            </div>
          </ClinicCard>
        ))}
      </div>

      <ClinicCard title="Patient Package Tracking" subtitle="Purchased, used and remaining sessions">
        <ClinicTable>
          <ClinicTableHeader columns={['Patient', 'Package', 'Purchased', 'Used', 'Remaining', 'Purchased On', 'Expiry', 'Usage', 'Status', 'Actions']} />
          <ClinicTableBody>
            {patientPackages.map((pp) => {
              const patient = store.patients.find((p) => p.id === pp.patientId);
              const pkg = store.packages.find((p) => p.id === pp.packageId);
              const remaining = pp.purchasedSessions - pp.usedSessions;
              const usage = Math.round((pp.usedSessions / Math.max(1, pp.purchasedSessions)) * 100);
              return (
                <ClinicTableRow key={pp.id}>
                  <ClinicTableCell className="font-medium">{fullPatientName(patient)}</ClinicTableCell>
                  <ClinicTableCell>{pkg?.name || pp.packageId}</ClinicTableCell>
                  <ClinicTableCell>{pp.purchasedSessions}</ClinicTableCell>
                  <ClinicTableCell>{pp.usedSessions}</ClinicTableCell>
                  <ClinicTableCell className="font-semibold text-teal-700">{remaining}</ClinicTableCell>
                  <ClinicTableCell>{formatDate(pp.purchaseDate)}</ClinicTableCell>
                  <ClinicTableCell>{formatDate(pp.expiryDate)}</ClinicTableCell>
                  <ClinicTableCell className="min-w-[120px]"><ClinicProgress value={usage} /></ClinicTableCell>
                  <ClinicTableCell><ClinicStatusBadge status={pp.status} /></ClinicTableCell>
                  <ClinicTableCell>
                    <button type="button" className="inline-flex items-center gap-1 text-xs font-bold text-teal-700" onClick={() => renew(pp.id)}>
                      <RefreshCw className="w-3.5 h-3.5" /> Renew
                    </button>
                  </ClinicTableCell>
                </ClinicTableRow>
              );
            })}
          </ClinicTableBody>
        </ClinicTable>
      </ClinicCard>

      <ClinicModal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Edit Package' : 'New Package'} actions={<><ClinicButton variant="secondary" onClick={() => setOpen(false)}>Cancel</ClinicButton><ClinicButton onClick={savePackage}>Save</ClinicButton></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ClinicField label="Package name" required><input className={clinicInputClass()} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></ClinicField>
          <ClinicField label="Status">
            <select className={clinicInputClass()} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TherapyPackage['status'] })}>
              {['Active', 'Inactive', 'Expired'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </ClinicField>
          <div className="sm:col-span-2"><ClinicField label="Description"><textarea className={clinicInputClass()} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></ClinicField></div>
          <ClinicField label="Sessions"><input type="number" className={clinicInputClass()} value={form.sessions} onChange={(e) => setForm({ ...form, sessions: Number(e.target.value) })} /></ClinicField>
          <ClinicField label="Price (PKR)"><input type="number" className={clinicInputClass()} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></ClinicField>
          <ClinicField label="Validity (days)"><input type="number" className={clinicInputClass()} value={form.validityDays} onChange={(e) => setForm({ ...form, validityDays: Number(e.target.value) })} /></ClinicField>
          <ClinicField label="Discount %"><input type="number" className={clinicInputClass()} value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })} /></ClinicField>
        </div>
      </ClinicModal>

      <ClinicModal isOpen={assignOpen} onClose={() => setAssignOpen(false)} title="Assign Package to Patient" actions={<><ClinicButton variant="secondary" onClick={() => setAssignOpen(false)}>Cancel</ClinicButton><ClinicButton onClick={assignPackage}>Assign</ClinicButton></>}>
        <div className="grid grid-cols-1 gap-3">
          <ClinicField label="Patient">
            <select className={clinicInputClass()} value={assign.patientId} onChange={(e) => setAssign({ ...assign, patientId: e.target.value })}>
              {store.patients.map((p) => <option key={p.id} value={p.id}>{fullPatientName(p)}</option>)}
            </select>
          </ClinicField>
          <ClinicField label="Package">
            <select className={clinicInputClass()} value={assign.packageId} onChange={(e) => setAssign({ ...assign, packageId: e.target.value })}>
              {store.packages.map((p) => <option key={p.id} value={p.id}>{p.name} · {formatPkr(p.price)}</option>)}
            </select>
          </ClinicField>
        </div>
      </ClinicModal>
    </ClinicPage>
  );
}
