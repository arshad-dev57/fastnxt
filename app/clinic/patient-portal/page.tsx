'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from 'react';
import { Globe, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ClinicPage,
  ClinicMockBanner,
  ClinicPageHeader,
  ClinicCard,
  ClinicStatusBadge,
  ClinicAvatar,
  ClinicProgress,
  ClinicSelect,
  ClinicButton,
  ClinicTable,
  ClinicTableHeader,
  ClinicTableBody,
  ClinicTableRow,
  ClinicTableCell,
  ClinicField,
  clinicInputClass,
} from '../ui';
import { useClinicStore, fullPatientName } from '../_lib/store';
import { formatDate, formatPkr, todayIso } from '../_lib/format';

export default function PatientPortalPage() {
  const store = useClinicStore();
  const [previewPatientId, setPreviewPatientId] = useState(store.patients[0]?.id || '');
  const [access, setAccess] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(store.patients.slice(0, 12).map((p) => [p.id, p.status === 'Active']))
  );
  const [visibility, setVisibility] = useState({
    appointments: true,
    history: true,
    billing: true,
    progress: true,
  });
  const [branding, setBranding] = useState({
    portalName: `${store.settings.clinicName} Patient Portal`,
    primaryColor: '#0f766e',
    welcome: 'Track your care journey anytime.',
  });

  const patient = store.patients.find((p) => p.id === previewPatientId);
  const today = todayIso();

  const preview = useMemo(() => {
    if (!patient) return null;
    const appointments = store.appointments
      .filter((a) => a.patientId === patient.id && a.date >= today)
      .slice(0, 4);
    const plans = store.treatmentPlans.filter((t) => t.patientId === patient.id);
    const packages = store.patientPackages.filter((p) => p.patientId === patient.id);
    const invoices = store.invoices.filter((i) => i.patientId === patient.id).slice(0, 4);
    const payments = store.payments.filter((p) => p.patientId === patient.id).slice(0, 4);
    return { appointments, plans, packages, invoices, payments };
  }, [patient, store, today]);

  return (
    <ClinicPage fullWidth>
      <ClinicMockBanner />
      <ClinicPageHeader
        title="Patient Portal"
        subtitle="Admin configuration and polished patient-facing preview"
        icon={<Globe className="w-5 h-5 text-white" />}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="space-y-4">
          <ClinicCard title="Portal Overview" subtitle="Frontend demo — no live patient accounts">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-teal-50 p-3 border border-teal-100">
                <p className="text-[11px] text-slate-500">Accounts</p>
                <p className="text-xl font-extrabold text-teal-800">{Object.keys(access).length}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-100">
                <p className="text-[11px] text-slate-500">Enabled</p>
                <p className="text-xl font-extrabold text-emerald-700">{Object.values(access).filter(Boolean).length}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                <p className="text-[11px] text-slate-500">Disabled</p>
                <p className="text-xl font-extrabold">{Object.values(access).filter((v) => !v).length}</p>
              </div>
            </div>
          </ClinicCard>

          <ClinicCard title="Patient Account Access">
            <ClinicTable>
              <ClinicTableHeader columns={['Patient', 'Status', 'Portal Access']} />
              <ClinicTableBody>
                {store.patients.slice(0, 12).map((p) => (
                  <ClinicTableRow key={p.id}>
                    <ClinicTableCell>
                      <div className="flex items-center gap-2">
                        <ClinicAvatar name={fullPatientName(p)} color={p.avatarColor} size="sm" />
                        <span className="font-medium">{fullPatientName(p)}</span>
                      </div>
                    </ClinicTableCell>
                    <ClinicTableCell><ClinicStatusBadge status={p.status} /></ClinicTableCell>
                    <ClinicTableCell>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs font-bold text-teal-700"
                        onClick={() => setAccess((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                      >
                        {access[p.id] ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {access[p.id] ? 'Enabled' : 'Disabled'}
                      </button>
                    </ClinicTableCell>
                  </ClinicTableRow>
                ))}
              </ClinicTableBody>
            </ClinicTable>
          </ClinicCard>

          <ClinicCard title="Visibility Settings">
            <div className="space-y-2">
              {(
                [
                  ['appointments', 'Appointment visibility'],
                  ['history', 'Medical history visibility'],
                  ['billing', 'Billing visibility'],
                  ['progress', 'Treatment progress visibility'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center justify-between text-sm border border-teal-50 rounded-xl px-3 py-2">
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={visibility[key]}
                    onChange={(e) => setVisibility({ ...visibility, [key]: e.target.checked })}
                  />
                </label>
              ))}
            </div>
          </ClinicCard>

          <ClinicCard title="Portal Branding">
            <div className="space-y-3">
              <ClinicField label="Portal name">
                <input className={clinicInputClass()} value={branding.portalName} onChange={(e) => setBranding({ ...branding, portalName: e.target.value })} />
              </ClinicField>
              <ClinicField label="Welcome message">
                <input className={clinicInputClass()} value={branding.welcome} onChange={(e) => setBranding({ ...branding, welcome: e.target.value })} />
              </ClinicField>
              <ClinicField label="Primary color">
                <input type="color" className="h-10 w-20 rounded-lg border border-[#d1e7df]" value={branding.primaryColor} onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })} />
              </ClinicField>
              <ClinicButton onClick={() => toast.success('Portal settings saved (demo)')}>Save Portal Settings</ClinicButton>
            </div>
          </ClinicCard>
        </div>

        <ClinicCard
          title="Patient Portal Preview"
          subtitle="What patients would see"
          action={
            <ClinicSelect
              value={previewPatientId}
              onChange={setPreviewPatientId}
              options={store.patients.map((p) => ({ value: p.id, label: fullPatientName(p) }))}
            />
          }
        >
          {patient && preview && (
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
              <div className="px-5 py-4 text-white" style={{ background: branding.primaryColor }}>
                <p className="text-xs opacity-80">Patient Portal</p>
                <p className="text-lg font-extrabold">{branding.portalName}</p>
                <p className="text-xs mt-1 opacity-90">{branding.welcome}</p>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-3">
                  <ClinicAvatar name={fullPatientName(patient)} color={patient.avatarColor} />
                  <div>
                    <p className="font-bold text-slate-900">{fullPatientName(patient)}</p>
                    <p className="text-xs text-slate-500">{patient.id} · {patient.city}</p>
                  </div>
                </div>

                {visibility.appointments && (
                  <div className="bg-white rounded-xl border border-slate-200 p-3">
                    <p className="text-xs font-bold text-slate-700 mb-2">Upcoming Appointments</p>
                    {preview.appointments.length === 0 ? (
                      <p className="text-xs text-slate-500">No upcoming appointments</p>
                    ) : (
                      preview.appointments.map((a) => (
                        <div key={a.id} className="flex justify-between text-xs py-1.5 border-b border-slate-100 last:border-0">
                          <span>{formatDate(a.date)} · {a.startTime}</span>
                          <ClinicStatusBadge status={a.status} />
                        </div>
                      ))
                    )}
                  </div>
                )}

                {visibility.progress && (
                  <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-3">
                    <p className="text-xs font-bold text-slate-700">Treatment Progress</p>
                    {preview.plans.length === 0 ? (
                      <p className="text-xs text-slate-500">No active plans</p>
                    ) : (
                      preview.plans.map((t) => (
                        <div key={t.id}>
                          <p className="text-xs font-medium mb-1">{t.diagnosis}</p>
                          <ClinicProgress value={t.progressPercent} />
                        </div>
                      ))
                    )}
                    {preview.packages.map((pp) => {
                      const pkg = store.packages.find((p) => p.id === pp.packageId);
                      const remaining = pp.purchasedSessions - pp.usedSessions;
                      return (
                        <p key={pp.id} className="text-xs text-slate-600">
                          Package balance: <strong>{remaining}</strong> of {pp.purchasedSessions} sessions left ({pkg?.name})
                        </p>
                      );
                    })}
                  </div>
                )}

                {visibility.billing && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl border border-slate-200 p-3">
                      <p className="text-xs font-bold text-slate-700 mb-2">Invoices</p>
                      {preview.invoices.map((i) => (
                        <div key={i.id} className="flex justify-between text-xs py-1">
                          <span>{i.invoiceNumber}</span>
                          <span className="font-semibold">{formatPkr(i.outstanding)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-3">
                      <p className="text-xs font-bold text-slate-700 mb-2">Payment History</p>
                      {preview.payments.map((p) => (
                        <div key={p.id} className="flex justify-between text-xs py-1">
                          <span>{formatDate(p.date)}</span>
                          <span className="font-semibold">{formatPkr(p.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl border border-slate-200 p-3">
                  <p className="text-xs font-bold text-slate-700 mb-2">Profile Settings</p>
                  <p className="text-xs text-slate-500">{patient.phone} · {patient.email}</p>
                  <p className="text-xs text-slate-500 mt-1">{patient.address}, {patient.city}</p>
                </div>
              </div>
            </div>
          )}
        </ClinicCard>
      </div>
    </ClinicPage>
  );
}
