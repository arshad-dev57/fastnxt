'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ClinicPage,
  ClinicMockBanner,
  ClinicPageHeader,
  ClinicCard,
  ClinicButton,
  ClinicField,
  clinicInputClass,
} from '../ui';
import { useClinicStore } from '../_lib/store';
import type { ClinicSettings } from '../_lib/types';

const SECTIONS = [
  'General Settings',
  'Clinic Profile',
  'Clinic Logo & Branding',
  'Contact Information',
  'Branch Settings',
  'Working Hours',
  'Appointment Settings',
  'Session Settings',
  'Billing Settings',
  'Tax Settings',
  'Payment Methods',
  'Notification Preferences',
  'Document Templates',
  'Invoice Templates',
  'Prescription Templates',
  'Patient ID Configuration',
  'Appointment ID Configuration',
  'Currency & Localization',
  'Date & Time Preferences',
];

export default function ClinicSettingsPage() {
  const store = useClinicStore();
  const [section, setSection] = useState(SECTIONS[0]);
  const [form, setForm] = useState<ClinicSettings>(store.settings);
  const [paymentMethods, setPaymentMethods] = useState({
    Cash: true,
    'Bank Transfer': true,
    Card: true,
    'Online Payment': true,
    Other: false,
  });

  const save = () => {
    store.update((prev) => ({ ...prev, settings: form }));
    toast.success('Clinic settings saved');
  };

  const set = <K extends keyof ClinicSettings>(key: K, value: ClinicSettings[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <ClinicPage fullWidth>
      <ClinicMockBanner />
      <ClinicPageHeader
        title="Clinic Settings"
        subtitle="Configure clinic profile, operations, billing and templates"
        icon={<Settings className="w-5 h-5 text-white" />}
        actions={<ClinicButton onClick={save}>Save Changes</ClinicButton>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
        <ClinicCard className="h-fit" noPadding>
          <nav className="p-2 space-y-0.5 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {SECTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSection(s)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  section === s ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-teal-50'
                }`}
              >
                {s}
              </button>
            ))}
          </nav>
        </ClinicCard>

        <ClinicCard title={section}>
          {(section === 'General Settings' || section === 'Clinic Profile') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicField label="Clinic name"><input className={clinicInputClass()} value={form.clinicName} onChange={(e) => set('clinicName', e.target.value)} /></ClinicField>
              <ClinicField label="Tagline"><input className={clinicInputClass()} value={form.tagline} onChange={(e) => set('tagline', e.target.value)} /></ClinicField>
              <ClinicField label="City"><input className={clinicInputClass()} value={form.city} onChange={(e) => set('city', e.target.value)} /></ClinicField>
              <ClinicField label="Website"><input className={clinicInputClass()} value={form.website} onChange={(e) => set('website', e.target.value)} /></ClinicField>
              <div className="sm:col-span-2"><ClinicField label="Address"><input className={clinicInputClass()} value={form.address} onChange={(e) => set('address', e.target.value)} /></ClinicField></div>
            </div>
          )}

          {section === 'Clinic Logo & Branding' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicField label="Logo text / monogram"><input className={clinicInputClass()} value={form.logoText} onChange={(e) => set('logoText', e.target.value)} /></ClinicField>
              <div className="flex items-end">
                <div className="w-16 h-16 rounded-2xl bg-teal-700 text-white flex items-center justify-center text-xl font-bold">{form.logoText}</div>
              </div>
              <p className="sm:col-span-2 text-xs text-slate-500">Logo upload is simulated in this frontend demo.</p>
            </div>
          )}

          {section === 'Contact Information' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicField label="Phone"><input className={clinicInputClass()} value={form.phone} onChange={(e) => set('phone', e.target.value)} /></ClinicField>
              <ClinicField label="Email"><input className={clinicInputClass()} value={form.email} onChange={(e) => set('email', e.target.value)} /></ClinicField>
            </div>
          )}

          {section === 'Branch Settings' && (
            <div className="space-y-2 text-sm">
              {['Karachi PECHS', 'Lahore Gulberg', 'Islamabad F-7'].map((b) => (
                <div key={b} className="flex items-center justify-between rounded-xl border border-teal-100 px-4 py-3">
                  <span className="font-semibold">{b}</span>
                  <span className="text-xs text-emerald-700 font-bold">Active</span>
                </div>
              ))}
            </div>
          )}

          {(section === 'Working Hours' || section === 'Appointment Settings' || section === 'Session Settings') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicField label="Working hours start"><input type="time" className={clinicInputClass()} value={form.workingHoursStart} onChange={(e) => set('workingHoursStart', e.target.value)} /></ClinicField>
              <ClinicField label="Working hours end"><input type="time" className={clinicInputClass()} value={form.workingHoursEnd} onChange={(e) => set('workingHoursEnd', e.target.value)} /></ClinicField>
              <ClinicField label="Appointment slot (minutes)"><input type="number" className={clinicInputClass()} value={form.appointmentSlotMinutes} onChange={(e) => set('appointmentSlotMinutes', Number(e.target.value))} /></ClinicField>
            </div>
          )}

          {(section === 'Billing Settings' || section === 'Tax Settings') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicField label="Default tax %"><input type="number" className={clinicInputClass()} value={form.taxPercent} onChange={(e) => set('taxPercent', Number(e.target.value))} /></ClinicField>
              <ClinicField label="Currency"><input className={clinicInputClass()} value={form.currency} onChange={(e) => set('currency', e.target.value)} /></ClinicField>
            </div>
          )}

          {section === 'Payment Methods' && (
            <div className="space-y-2">
              {Object.keys(paymentMethods).map((m) => (
                <label key={m} className="flex items-center justify-between rounded-xl border border-teal-50 px-3 py-2 text-sm">
                  <span>{m}</span>
                  <input
                    type="checkbox"
                    checked={paymentMethods[m as keyof typeof paymentMethods]}
                    onChange={(e) => setPaymentMethods({ ...paymentMethods, [m]: e.target.checked })}
                  />
                </label>
              ))}
            </div>
          )}

          {section === 'Notification Preferences' && (
            <p className="text-sm text-slate-600">Configure reminder channels in the Notifications page. Email, SMS and WhatsApp toggles are simulated for this demo.</p>
          )}

          {(section === 'Document Templates' || section === 'Invoice Templates' || section === 'Prescription Templates') && (
            <div className="rounded-xl border border-dashed border-teal-200 bg-teal-50/40 p-6 text-sm text-slate-600">
              Template editor placeholder for <strong>{section}</strong>. Header/footer branding uses clinic profile fields above.
            </div>
          )}

          {(section === 'Patient ID Configuration' || section === 'Appointment ID Configuration') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicField label="Patient ID prefix"><input className={clinicInputClass()} value={form.patientIdPrefix} onChange={(e) => set('patientIdPrefix', e.target.value)} /></ClinicField>
              <ClinicField label="Appointment ID prefix"><input className={clinicInputClass()} value={form.appointmentIdPrefix} onChange={(e) => set('appointmentIdPrefix', e.target.value)} /></ClinicField>
            </div>
          )}

          {(section === 'Currency & Localization' || section === 'Date & Time Preferences') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicField label="Currency code"><input className={clinicInputClass()} value={form.currency} onChange={(e) => set('currency', e.target.value)} /></ClinicField>
              <ClinicField label="Locale">
                <select className={clinicInputClass()} defaultValue="en-PK">
                  <option value="en-PK">English (Pakistan)</option>
                  <option value="ur-PK">Urdu (Pakistan)</option>
                </select>
              </ClinicField>
              <ClinicField label="Timezone">
                <select className={clinicInputClass()} defaultValue="Asia/Karachi">
                  <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
                </select>
              </ClinicField>
              <ClinicField label="Date format">
                <select className={clinicInputClass()} defaultValue="dd MMM yyyy">
                  <option>dd MMM yyyy</option>
                  <option>yyyy-MM-dd</option>
                  <option>dd/MM/yyyy</option>
                </select>
              </ClinicField>
            </div>
          )}
        </ClinicCard>
      </div>
    </ClinicPage>
  );
}
