'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ClinicPage,
  ClinicMockBanner,
  ClinicPageHeader,
  ClinicCard,
  ClinicStatusBadge,
  ClinicSearchInput,
  ClinicSelect,
  ClinicButton,
  ClinicField,
} from '../ui';
import { useClinicStore } from '../_lib/store';
import { formatDateTime } from '../_lib/format';

export default function NotificationsPage() {
  const store = useClinicStore();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [prefs, setPrefs] = useState({
    appointments: true,
    payments: true,
    followUps: true,
    inventory: true,
    staff: false,
  });

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(store.notifications.map((n) => n.category)))],
    [store.notifications]
  );

  const filtered = useMemo(() => {
    return store.notifications.filter((n) => {
      const hay = `${n.title} ${n.message} ${n.category}`.toLowerCase();
      return (
        (!q || hay.includes(q.toLowerCase())) &&
        (category === 'All' || n.category === category) &&
        (!unreadOnly || !n.read)
      );
    });
  }, [store.notifications, q, category, unreadOnly]);

  const markAll = () => {
    store.update((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
    toast.success('All notifications marked as read');
  };

  const markOne = (id: string) => {
    store.update((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  return (
    <ClinicPage>
      <ClinicMockBanner />
      <ClinicPageHeader
        title="Notifications"
        subtitle="Clinic alerts, reminders and operational updates"
        icon={<Bell className="w-5 h-5 text-white" />}
        actions={
          <ClinicButton variant="secondary" onClick={markAll}>
            <CheckCheck className="w-4 h-4" /> Mark all read
          </ClinicButton>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <ClinicCard className="xl:col-span-2" title="Notification Center">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <ClinicSearchInput value={q} onChange={setQ} placeholder="Search notifications…" />
            <ClinicSelect
              value={category}
              onChange={setCategory}
              options={categories.map((c) => ({ value: c, label: c === 'All' ? 'All categories' : c }))}
            />
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 whitespace-nowrap">
              <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} />
              Unread only
            </label>
          </div>
          <div className="space-y-2">
            {filtered.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => markOne(n.id)}
                className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${
                  n.read ? 'border-slate-200 bg-white' : 'border-teal-200 bg-teal-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className={`text-sm ${n.read ? 'font-semibold text-slate-800' : 'font-bold text-slate-900'}`}>
                        {n.title}
                      </p>
                      <ClinicStatusBadge status={n.priority} />
                      <span className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">{n.category}</span>
                    </div>
                    <p className="text-xs text-slate-600">{n.message}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{formatDateTime(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="w-2.5 h-2.5 rounded-full bg-teal-500 flex-shrink-0 mt-1.5" />}
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-10">No notifications match your filters.</p>
            )}
          </div>
        </ClinicCard>

        <ClinicCard title="Notification Preferences" subtitle="Demo preferences (local UI only)">
          <div className="space-y-3">
            {(
              [
                ['appointments', 'Appointment reminders & bookings'],
                ['payments', 'Payment reminders'],
                ['followUps', 'Follow-up reminders'],
                ['inventory', 'Low stock alerts'],
                ['staff', 'Staff notifications'],
              ] as const
            ).map(([key, label]) => (
              <ClinicField key={key} label={label}>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={prefs[key]}
                    onChange={(e) => setPrefs({ ...prefs, [key]: e.target.checked })}
                  />
                  Enabled
                </label>
              </ClinicField>
            ))}
            <ClinicButton
              className="w-full mt-2"
              onClick={() => toast.success('Notification preferences saved (demo)')}
            >
              Save Preferences
            </ClinicButton>
          </div>
        </ClinicCard>
      </div>
    </ClinicPage>
  );
}
