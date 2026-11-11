'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from 'react';
import { DoorOpen, Plus, Wrench } from 'lucide-react';
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
  ClinicSelect,
  clinicInputClass,
} from '../ui';
import { useClinicStore, fullPatientName, nextId } from '../_lib/store';
import { formatDate, todayIso } from '../_lib/format';
import type { ClinicRoom, RoomStatus } from '../_lib/types';

export default function RoomsPage() {
  const store = useClinicStore();
  const [selected, setSelected] = useState(store.rooms[0]?.id || '');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClinicRoom | null>(null);
  const [form, setForm] = useState({
    name: '',
    type: 'Therapy',
    capacity: 1,
    equipment: '',
    branch: 'Karachi PECHS',
    status: 'Available' as RoomStatus,
    maintenanceNote: '',
  });
  const today = todayIso();

  const roomAppts = useMemo(
    () =>
      store.appointments
        .filter((a) => a.roomId === selected && a.date === today)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [store.appointments, selected, today]
  );

  const save = () => {
    if (!form.name.trim()) {
      toast.error('Room name is required');
      return;
    }
    const payload: ClinicRoom = {
      id: editing?.id || nextId('RM', store.rooms),
      name: form.name.trim(),
      type: form.type,
      capacity: Number(form.capacity),
      equipment: form.equipment.split(',').map((x) => x.trim()).filter(Boolean),
      branch: form.branch,
      status: form.status,
      maintenanceNote: form.maintenanceNote || undefined,
    };
    store.update((prev) => ({
      ...prev,
      rooms: editing
        ? prev.rooms.map((r) => (r.id === editing.id ? payload : r))
        : [payload, ...prev.rooms],
    }));
    toast.success(editing ? 'Room updated' : 'Room added');
    setOpen(false);
  };

  const setMaintenance = (id: string) => {
    store.update((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r) =>
        r.id === id
          ? { ...r, status: 'Maintenance' as RoomStatus, maintenanceNote: 'Marked for maintenance' }
          : r
      ),
    }));
    toast.success('Room marked for maintenance');
  };

  return (
    <ClinicPage>
      <ClinicMockBanner />
      <ClinicPageHeader
        title="Rooms & Facilities"
        subtitle="Room availability, bookings and maintenance"
        icon={<DoorOpen className="w-5 h-5 text-white" />}
        actions={
          <ClinicButton onClick={() => {
            setEditing(null);
            setForm({ name: '', type: 'Therapy', capacity: 1, equipment: '', branch: 'Karachi PECHS', status: 'Available', maintenanceNote: '' });
            setOpen(true);
          }}>
            <Plus className="w-4 h-4" /> Add Room
          </ClinicButton>
        }
      />

      <ClinicCard>
        <ClinicTable>
          <ClinicTableHeader columns={['Room ID', 'Name', 'Type', 'Capacity', 'Equipment', 'Branch', 'Status', 'Actions']} />
          <ClinicTableBody>
            {store.rooms.map((r) => (
              <ClinicTableRow key={r.id} onClick={() => setSelected(r.id)} className={selected === r.id ? 'bg-teal-50/50' : ''}>
                <ClinicTableCell className="font-semibold">{r.id}</ClinicTableCell>
                <ClinicTableCell>{r.name}</ClinicTableCell>
                <ClinicTableCell>{r.type}</ClinicTableCell>
                <ClinicTableCell>{r.capacity}</ClinicTableCell>
                <ClinicTableCell className="max-w-[180px] truncate">{r.equipment.join(', ') || '—'}</ClinicTableCell>
                <ClinicTableCell>{r.branch}</ClinicTableCell>
                <ClinicTableCell><ClinicStatusBadge status={r.status} /></ClinicTableCell>
                <ClinicTableCell>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="text-xs font-bold text-teal-700" onClick={() => {
                      setEditing(r);
                      setForm({
                        name: r.name,
                        type: r.type,
                        capacity: r.capacity,
                        equipment: r.equipment.join(', '),
                        branch: r.branch,
                        status: r.status,
                        maintenanceNote: r.maintenanceNote || '',
                      });
                      setOpen(true);
                    }}>Edit</button>
                    <button type="button" className="text-xs font-bold text-amber-700 inline-flex items-center gap-1" onClick={() => setMaintenance(r.id)}>
                      <Wrench className="w-3 h-3" /> Maintain
                    </button>
                  </div>
                </ClinicTableCell>
              </ClinicTableRow>
            ))}
          </ClinicTableBody>
        </ClinicTable>
      </ClinicCard>

      <ClinicCard
        title="Room Calendar"
        subtitle={`Today's bookings · ${store.rooms.find((r) => r.id === selected)?.name || 'Select a room'}`}
        action={
          <ClinicSelect
            value={selected}
            onChange={setSelected}
            options={store.rooms.map((r) => ({ value: r.id, label: r.name }))}
          />
        }
      >
        {roomAppts.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No bookings in this room for {formatDate(today)}</p>
        ) : (
          <div className="space-y-2">
            {roomAppts.map((a) => {
              const patient = store.patients.find((p) => p.id === a.patientId);
              const service = store.services.find((s) => s.id === a.serviceId);
              return (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-teal-100 bg-teal-50/40 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{a.startTime}–{a.endTime} · {fullPatientName(patient)}</p>
                    <p className="text-xs text-slate-500">{service?.name}</p>
                  </div>
                  <ClinicStatusBadge status={a.status} />
                </div>
              );
            })}
          </div>
        )}
      </ClinicCard>

      <ClinicModal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Edit Room' : 'Add Room'} actions={<><ClinicButton variant="secondary" onClick={() => setOpen(false)}>Cancel</ClinicButton><ClinicButton onClick={save}>Save</ClinicButton></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ClinicField label="Room name" required><input className={clinicInputClass()} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></ClinicField>
          <ClinicField label="Type">
            <select className={clinicInputClass()} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {['Assessment', 'Therapy', 'Consultation', 'Gym', 'Pediatric'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </ClinicField>
          <ClinicField label="Capacity"><input type="number" className={clinicInputClass()} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></ClinicField>
          <ClinicField label="Branch"><input className={clinicInputClass()} value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} /></ClinicField>
          <div className="sm:col-span-2"><ClinicField label="Equipment (comma separated)"><input className={clinicInputClass()} value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })} /></ClinicField></div>
          <ClinicField label="Status">
            <select className={clinicInputClass()} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as RoomStatus })}>
              {['Available', 'Occupied', 'Maintenance', 'Reserved'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </ClinicField>
          <ClinicField label="Maintenance note"><input className={clinicInputClass()} value={form.maintenanceNote} onChange={(e) => setForm({ ...form, maintenanceNote: e.target.value })} /></ClinicField>
        </div>
      </ClinicModal>
    </ClinicPage>
  );
}
