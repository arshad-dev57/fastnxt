'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  User,
  AlertTriangle,
  FileText,
  FolderOpen,
  Phone,
  Pencil,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ClinicPage,
  ClinicMockBanner,
  ClinicPageHeader,
  ClinicCard,
  ClinicStatusBadge,
  ClinicAvatar,
  ClinicTabs,
  ClinicProgress,
  ClinicButton,
  ClinicModal,
  ClinicField,
  clinicInputClass,
  ClinicSelect,
  ClinicTable,
  ClinicTableHeader,
  ClinicTableBody,
  ClinicTableRow,
  ClinicTableCell,
  ClinicEmptyState,
} from '../../ui';
import {
  useClinicStore,
  fullPatientName,
  patientById,
  therapistById,
  serviceById,
} from '../../_lib/store';
import { formatDate, formatPkr, ageFromDob } from '../../_lib/format';
import type { ClinicPatient, PatientStatus } from '../../_lib/types';

const TAB_LIST = [
  'Overview',
  'Medical History',
  'Appointments',
  'Therapy Sessions',
  'Treatment Plans',
  'Prescriptions',
  'Documents',
  'Billing & Payments',
  'Follow-up History',
  'Notes & Communication',
];

export default function PatientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const store = useClinicStore();
  const { update, activityFeed } = store;
  const patient = patientById(id, store.patients);
  const [tab, setTab] = useState('Overview');
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<ClinicPatient | null>(null);

  const related = useMemo(() => {
    if (!patient) return null;
    return {
      appointments: store.appointments.filter((a) => a.patientId === id).sort((a, b) => b.date.localeCompare(a.date)),
      sessions: store.sessions.filter((s) => s.patientId === id).sort((a, b) => b.date.localeCompare(a.date)),
      plans: store.treatmentPlans.filter((t) => t.patientId === id),
      prescriptions: store.prescriptions.filter((p) => p.patientId === id),
      records: store.medicalRecords.filter((r) => r.patientId === id),
      invoices: store.invoices.filter((i) => i.patientId === id),
      payments: store.payments.filter((p) => p.patientId === id),
      followUps: store.followUps.filter((f) => f.patientId === id),
    };
  }, [patient, id, store]);

  const paymentSummary = useMemo(() => {
    if (!related) return { paid: 0, due: 0 };
    const due = related.invoices.reduce((s, i) => s + i.outstanding, 0);
    const paid = related.payments.filter((p) => p.status === 'Completed').reduce((s, p) => s + p.amount, 0);
    return { paid, due };
  }, [related]);

  if (!patient) {
    return (
      <ClinicPage>
        <ClinicEmptyState title="Patient not found" description={`No record for ${id}`} action={<ClinicButton onClick={() => router.push('/clinic/patients')}>Back to registry</ClinicButton>} />
      </ClinicPage>
    );
  }

  const therapist = therapistById(patient.assignedTherapistId || '', store.therapists);
  const upcoming = related!.appointments.filter((a) => a.date >= new Date().toISOString().slice(0, 10) && !['Cancelled', 'Completed'].includes(a.status)).slice(0, 3);
  const recentSessions = related!.sessions.slice(0, 4);
  const activePlans = related!.plans.filter((p) => p.status === 'Active');

  const openEdit = () => {
    setForm({ ...patient });
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!form) return;
    update((s) => ({
      ...s,
      patients: s.patients.map((p) => (p.id === id ? { ...form, age: ageFromDob(form.dateOfBirth) } : p)),
    }));
    toast.success('Patient profile updated');
    setEditOpen(false);
  };

  return (
    <ClinicPage fullWidth>
      <ClinicMockBanner />
      <ClinicPageHeader
        backHref="/clinic/patients"
        title={fullPatientName(patient)}
        subtitle={`${patient.id} · ${patient.city} · Registered ${formatDate(patient.registrationDate)}`}
        icon={<User className="w-5 h-5 text-white" />}
        actions={
          <>
            <ClinicStatusBadge status={patient.status} />
            <ClinicButton variant="secondary" onClick={openEdit}>
              <Pencil className="w-3.5 h-3.5" /> Edit
            </ClinicButton>
          </>
        }
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-72 flex-shrink-0">
          <ClinicCard className="text-center">
            <ClinicAvatar name={fullPatientName(patient)} color={patient.avatarColor} size="lg" />
            <h2 className="mt-3 text-lg font-bold text-slate-900">{fullPatientName(patient)}</h2>
            <p className="text-xs text-slate-500">{patient.gender} · {patient.age} years</p>
            <div className="mt-4 space-y-2 text-left text-xs text-slate-600">
              <p><Phone className="w-3 h-3 inline mr-1 text-teal-600" />{patient.phone}</p>
              <p>{patient.email}</p>
              <p>{patient.address}, {patient.city}</p>
              {therapist && <p className="text-teal-800 font-semibold">Therapist: {therapist.name}</p>}
            </div>
          </ClinicCard>
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          <ClinicTabs tabs={TAB_LIST} active={tab} onChange={setTab} />

          {tab === 'Overview' && (
            <div className="space-y-4">
              {(patient.allergies?.length || patient.conditions?.length) ? (
                <ClinicCard title="Medical alerts" subtitle="Review before every session">
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies?.map((a) => (
                      <span key={a} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200">
                        <AlertTriangle className="w-3 h-3" /> Allergy: {a}
                      </span>
                    ))}
                    {patient.conditions?.map((c) => (
                      <span key={c} className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-200">
                        {c}
                      </span>
                    ))}
                  </div>
                </ClinicCard>
              ) : null}

              <div className="grid md:grid-cols-2 gap-4">
                <ClinicCard title="Upcoming appointments">
                  {upcoming.length === 0 ? <p className="text-xs text-slate-500">No upcoming visits scheduled.</p> : (
                    <ul className="space-y-2 text-xs">
                      {upcoming.map((a) => (
                        <li key={a.id} className="flex justify-between border-b border-slate-100 pb-2">
                          <span>{formatDate(a.date)} {a.startTime}</span>
                          <ClinicStatusBadge status={a.status} />
                        </li>
                      ))}
                    </ul>
                  )}
                </ClinicCard>
                <ClinicCard title="Recent therapy sessions">
                  {recentSessions.length === 0 ? <p className="text-xs text-slate-500">No sessions yet.</p> : (
                    <ul className="space-y-2 text-xs">
                      {recentSessions.map((s) => (
                        <li key={s.id} className="flex justify-between">
                          <span>{formatDate(s.date)} — {serviceById(s.serviceId, store.services)?.name || s.serviceId}</span>
                          <ClinicStatusBadge status={s.status} />
                        </li>
                      ))}
                    </ul>
                  )}
                </ClinicCard>
              </div>

              <ClinicCard title="Active treatment plans">
                {activePlans.length === 0 ? <p className="text-xs text-slate-500">No active plans.</p> : (
                  <div className="space-y-3">
                    {activePlans.map((pl) => (
                      <div key={pl.id}>
                        <p className="text-xs font-semibold text-slate-800">{pl.diagnosis}</p>
                        <ClinicProgress value={pl.progressPercent} />
                        <p className="text-[11px] text-slate-500 mt-1">{pl.completedSessions}/{pl.totalSessions} sessions</p>
                      </div>
                    ))}
                  </div>
                )}
              </ClinicCard>

              <div className="grid md:grid-cols-2 gap-4">
                <ClinicCard title="Payment summary">
                  <p className="text-sm font-bold text-emerald-700">Received: {formatPkr(paymentSummary.paid)}</p>
                  <p className="text-sm font-bold text-rose-700 mt-1">Outstanding: {formatPkr(paymentSummary.due)}</p>
                </ClinicCard>
                <ClinicCard title="Recent activity">
                  <ul className="text-xs space-y-1.5 text-slate-600 max-h-32 overflow-y-auto">
                    {activityFeed.slice(0, 5).map((a) => (
                      <li key={a.id}><span className="text-teal-700 font-medium">{a.time}</span> — {a.message}</li>
                    ))}
                  </ul>
                </ClinicCard>
              </div>
            </div>
          )}

          {tab === 'Medical History' && (
            <ClinicCard title="Clinical records">
              {related!.records.length === 0 ? <ClinicEmptyState title="No records" /> : (
                <ClinicTable>
                  <ClinicTableHeader columns={['Type', 'Title', 'Date', 'Recorded by', 'Summary']} />
                  <ClinicTableBody>
                    {related!.records.map((r) => (
                      <ClinicTableRow key={r.id}>
                        <ClinicTableCell>{r.type}</ClinicTableCell>
                        <ClinicTableCell className="font-semibold">{r.title}</ClinicTableCell>
                        <ClinicTableCell>{formatDate(r.date)}</ClinicTableCell>
                        <ClinicTableCell>{r.recordedBy}</ClinicTableCell>
                        <ClinicTableCell className="max-w-xs truncate">{r.summary}</ClinicTableCell>
                      </ClinicTableRow>
                    ))}
                  </ClinicTableBody>
                </ClinicTable>
              )}
            </ClinicCard>
          )}

          {tab === 'Appointments' && (
            <ClinicCard title="Appointment history">
              <ClinicTable>
                <ClinicTableHeader columns={['Date', 'Time', 'Service', 'Therapist', 'Status']} />
                <ClinicTableBody>
                  {related!.appointments.map((a) => (
                    <ClinicTableRow key={a.id}>
                      <ClinicTableCell>{formatDate(a.date)}</ClinicTableCell>
                      <ClinicTableCell>{a.startTime}–{a.endTime}</ClinicTableCell>
                      <ClinicTableCell>{serviceById(a.serviceId, store.services)?.name}</ClinicTableCell>
                      <ClinicTableCell>{therapistById(a.therapistId, store.therapists)?.name}</ClinicTableCell>
                      <ClinicTableCell><ClinicStatusBadge status={a.status} /></ClinicTableCell>
                    </ClinicTableRow>
                  ))}
                </ClinicTableBody>
              </ClinicTable>
            </ClinicCard>
          )}

          {tab === 'Therapy Sessions' && (
            <ClinicCard title="Sessions">
              <ClinicTable>
                <ClinicTableHeader columns={['Date', 'Service', 'Therapist', 'Status', 'Feedback']} />
                <ClinicTableBody>
                  {related!.sessions.map((s) => (
                    <ClinicTableRow key={s.id} onClick={() => router.push(`/clinic/sessions/${s.id}`)}>
                      <ClinicTableCell>{formatDate(s.date)}</ClinicTableCell>
                      <ClinicTableCell>{serviceById(s.serviceId, store.services)?.name}</ClinicTableCell>
                      <ClinicTableCell>{therapistById(s.therapistId, store.therapists)?.name}</ClinicTableCell>
                      <ClinicTableCell><ClinicStatusBadge status={s.status} /></ClinicTableCell>
                      <ClinicTableCell>{s.patientFeedback ? `${s.patientFeedback}/5` : '—'}</ClinicTableCell>
                    </ClinicTableRow>
                  ))}
                </ClinicTableBody>
              </ClinicTable>
            </ClinicCard>
          )}

          {tab === 'Treatment Plans' && (
            <ClinicCard title="Care plans">
              <div className="space-y-4">
                {related!.plans.map((pl) => (
                  <div key={pl.id} className="p-4 rounded-xl border border-[#d1e7df]">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-bold text-sm text-slate-900">{pl.diagnosis}</p>
                        <p className="text-xs text-slate-500">{formatDate(pl.startDate)} → {formatDate(pl.expectedEndDate)}</p>
                      </div>
                      <ClinicStatusBadge status={pl.status} />
                    </div>
                    <ClinicProgress value={pl.progressPercent} />
                  </div>
                ))}
              </div>
            </ClinicCard>
          )}

          {tab === 'Prescriptions' && (
            <ClinicCard title="Prescriptions">
              <ClinicTable>
                <ClinicTableHeader columns={['Date', 'Medication', 'Dosage', 'Frequency', 'Status']} />
                <ClinicTableBody>
                  {related!.prescriptions.map((rx) => (
                    <ClinicTableRow key={rx.id}>
                      <ClinicTableCell>{formatDate(rx.date)}</ClinicTableCell>
                      <ClinicTableCell>{rx.medication}</ClinicTableCell>
                      <ClinicTableCell>{rx.dosage}</ClinicTableCell>
                      <ClinicTableCell>{rx.frequency}</ClinicTableCell>
                      <ClinicTableCell><ClinicStatusBadge status={rx.status} /></ClinicTableCell>
                    </ClinicTableRow>
                  ))}
                </ClinicTableBody>
              </ClinicTable>
            </ClinicCard>
          )}

          {tab === 'Documents' && (
            <ClinicCard title="Documents & attachments">
              {related!.records.filter((r) => r.type === 'Document').length === 0 ? (
                <ClinicEmptyState title="No documents" description="Upload scans from Medical Records module." />
              ) : (
                <ul className="space-y-2 text-sm">
                  {related!.records.filter((r) => r.type === 'Document').map((d) => (
                    <li key={d.id} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50">
                      <FolderOpen className="w-4 h-4 text-teal-600" />
                      <span className="font-medium">{d.title}</span>
                      <span className="text-xs text-slate-500 ml-auto">{formatDate(d.date)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </ClinicCard>
          )}

          {tab === 'Billing & Payments' && (
            <div className="grid gap-4">
              <ClinicCard title="Invoices">
                <ClinicTable>
                  <ClinicTableHeader columns={['Invoice', 'Date', 'Total', 'Outstanding', 'Status']} />
                  <ClinicTableBody>
                    {related!.invoices.map((inv) => (
                      <ClinicTableRow key={inv.id}>
                        <ClinicTableCell>{inv.invoiceNumber}</ClinicTableCell>
                        <ClinicTableCell>{formatDate(inv.date)}</ClinicTableCell>
                        <ClinicTableCell>{formatPkr(inv.total)}</ClinicTableCell>
                        <ClinicTableCell>{formatPkr(inv.outstanding)}</ClinicTableCell>
                        <ClinicTableCell><ClinicStatusBadge status={inv.status} /></ClinicTableCell>
                      </ClinicTableRow>
                    ))}
                  </ClinicTableBody>
                </ClinicTable>
              </ClinicCard>
              <ClinicCard title="Payments">
                <ClinicTable>
                  <ClinicTableHeader columns={['Date', 'Amount', 'Method', 'Status']} />
                  <ClinicTableBody>
                    {related!.payments.map((pay) => (
                      <ClinicTableRow key={pay.id}>
                        <ClinicTableCell>{formatDate(pay.date)}</ClinicTableCell>
                        <ClinicTableCell>{formatPkr(pay.amount)}</ClinicTableCell>
                        <ClinicTableCell>{pay.method}</ClinicTableCell>
                        <ClinicTableCell><ClinicStatusBadge status={pay.status} /></ClinicTableCell>
                      </ClinicTableRow>
                    ))}
                  </ClinicTableBody>
                </ClinicTable>
              </ClinicCard>
            </div>
          )}

          {tab === 'Follow-up History' && (
            <ClinicCard title="Follow-ups">
              <ClinicTable>
                <ClinicTableHeader columns={['Date', 'Type', 'Priority', 'Status', 'Notes']} />
                <ClinicTableBody>
                  {related!.followUps.map((f) => (
                    <ClinicTableRow key={f.id}>
                      <ClinicTableCell>{formatDate(f.date)}</ClinicTableCell>
                      <ClinicTableCell>{f.type}</ClinicTableCell>
                      <ClinicTableCell><ClinicStatusBadge status={f.priority} /></ClinicTableCell>
                      <ClinicTableCell><ClinicStatusBadge status={f.status} /></ClinicTableCell>
                      <ClinicTableCell className="max-w-xs truncate">{f.notes}</ClinicTableCell>
                    </ClinicTableRow>
                  ))}
                </ClinicTableBody>
              </ClinicTable>
            </ClinicCard>
          )}

          {tab === 'Notes & Communication' && (
            <ClinicCard title="Notes & communication log">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{patient.notes || 'No general notes on file. Reception can log preferences here.'}</p>
              <FeaturePlaceholder icon={FileText} label="SMS / WhatsApp threads appear when follow-up reminders are sent." />
            </ClinicCard>
          )}
        </div>
      </div>

      <ClinicModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit patient"
        actions={
          <>
            <ClinicButton variant="secondary" onClick={() => setEditOpen(false)}>Cancel</ClinicButton>
            <ClinicButton onClick={saveEdit}>Save</ClinicButton>
          </>
        }
      >
        {form && (
          <div className="grid sm:grid-cols-2 gap-4">
            <ClinicField label="First name">
              <input className={clinicInputClass()} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </ClinicField>
            <ClinicField label="Last name">
              <input className={clinicInputClass()} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </ClinicField>
            <ClinicField label="Status">
              <ClinicSelect value={form.status} onChange={(v) => setForm({ ...form, status: v as PatientStatus })} options={['Active', 'Inactive', 'Discharged', 'On Hold'].map((s) => ({ value: s, label: s }))} className="w-full" />
            </ClinicField>
            <ClinicField label="Phone">
              <input className={clinicInputClass()} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </ClinicField>
            <NotesField form={form} setForm={setForm} />
          </div>
        )}
      </ClinicModal>
    </ClinicPage>
  );
}

function FeaturePlaceholder({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <p className="mt-4 text-xs text-slate-500 flex items-center gap-2 p-3 rounded-xl bg-teal-50/50 border border-teal-100">
      <Icon className="w-4 h-4 text-teal-600 flex-shrink-0" />
      {label}
    </p>
  );
}

function NotesField({ form, setForm }: { form: ClinicPatient; setForm: (f: ClinicPatient) => void }) {
  return (
    <div className="sm:col-span-2">
      <ClinicField label="Notes">
        <textarea className={clinicInputClass() + ' min-h-[100px]'} value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </ClinicField>
    </div>
  );
}
