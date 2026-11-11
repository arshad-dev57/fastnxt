'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from 'react';
import { BarChart3, Download, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  ClinicPage,
  ClinicMockBanner,
  ClinicPageHeader,
  ClinicCard,
  ClinicTabs,
  ClinicSelect,
  ClinicButton,
  ClinicTable,
  ClinicTableHeader,
  ClinicTableBody,
  ClinicTableRow,
  ClinicTableCell,
  ClinicStatusBadge,
} from '../ui';
import { useClinicStore, fullPatientName } from '../_lib/store';
import { formatPkr } from '../_lib/format';

const TABS = ['Patient', 'Appointment', 'Therapist', 'Financial', 'Treatment'];
const PIE = ['#0f766e', '#14b8a6', '#0284c7', '#f59e0b', '#f43f5e', '#8b5cf6'];

export default function ReportsPage() {
  const store = useClinicStore();
  const [tab, setTab] = useState('Patient');
  const [therapistId, setTherapistId] = useState('All');
  const [serviceId, setServiceId] = useState('All');
  const [from, setFrom] = useState('2026-06-01');
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

  const patientStats = useMemo(() => {
    const active = store.patients.filter((p) => p.status === 'Active').length;
    const inactive = store.patients.filter((p) => p.status !== 'Active').length;
    const referrals = Object.entries(
      store.patients.reduce<Record<string, number>>((acc, p) => {
        acc[p.referralSource] = (acc[p.referralSource] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));
    return { active, inactive, referrals, total: store.patients.length };
  }, [store.patients]);

  const appointmentStats = useMemo(() => {
    let appts = store.appointments.filter((a) => a.date >= from && a.date <= to);
    if (therapistId !== 'All') appts = appts.filter((a) => a.therapistId === therapistId);
    if (serviceId !== 'All') appts = appts.filter((a) => a.serviceId === serviceId);
    const byStatus = Object.entries(
      appts.reduce<Record<string, number>>((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));
    return { total: appts.length, byStatus, rows: appts.slice(0, 12) };
  }, [store.appointments, from, to, therapistId, serviceId]);

  const therapistStats = useMemo(() => store.charts.therapistPerformance, [store.charts]);

  const financial = useMemo(() => {
    const revenue = store.payments
      .filter((p) => p.status === 'Completed' && p.date >= from && p.date <= to)
      .reduce((s, p) => s + p.amount, 0);
    const outstanding = store.invoices.reduce((s, i) => s + i.outstanding, 0);
    const byMethod = Object.entries(
      store.payments.reduce<Record<string, number>>((acc, p) => {
        if (p.status !== 'Completed') return acc;
        acc[p.method] = (acc[p.method] || 0) + p.amount;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));
    const expenses = store.expenses.reduce((s, e) => s + e.amount, 0);
    return { revenue, outstanding, byMethod, expenses, trend: store.charts.revenueTrend };
  }, [store, from, to]);

  const treatmentStats = useMemo(() => {
    const active = store.treatmentPlans.filter((t) => t.status === 'Active').length;
    const completed = store.treatmentPlans.filter((t) => t.status === 'Completed').length;
    const pending = store.treatmentPlans.filter((t) => ['Draft', 'Paused'].includes(t.status)).length;
    return {
      active,
      completed,
      pending,
      rows: store.treatmentPlans,
    };
  }, [store.treatmentPlans]);

  return (
    <ClinicPage>
      <ClinicMockBanner />
      <ClinicPageHeader
        title="Reports & Analytics"
        subtitle="Patient, appointment, therapist, financial and treatment insights"
        icon={<BarChart3 className="w-5 h-5 text-white" />}
        actions={
          <div className="flex gap-2">
            <ClinicButton variant="secondary" onClick={() => toast.success('Report exported (demo)')}>
              <Download className="w-4 h-4" /> Export
            </ClinicButton>
            <ClinicButton variant="secondary" onClick={() => window.print()}>
              <Printer className="w-4 h-4" /> Print
            </ClinicButton>
          </div>
        }
      />

      <ClinicCard>
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <label className="text-xs font-semibold text-slate-600">
            From
            <input type="date" className="ml-2 px-3 py-2 rounded-xl border border-[#d1e7df] text-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            To
            <input type="date" className="ml-2 px-3 py-2 rounded-xl border border-[#d1e7df] text-sm" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <ClinicSelect
            value={therapistId}
            onChange={setTherapistId}
            options={[{ value: 'All', label: 'All therapists' }, ...store.therapists.map((t) => ({ value: t.id, label: t.name }))]}
          />
          <ClinicSelect
            value={serviceId}
            onChange={setServiceId}
            options={[{ value: 'All', label: 'All services' }, ...store.services.map((s) => ({ value: s.id, label: s.name }))]}
          />
        </div>
        <ClinicTabs tabs={TABS} active={tab} onChange={setTab} />

        <div className="mt-5 space-y-5">
          {tab === 'Patient' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-teal-50 border border-teal-100 p-4"><p className="text-xs text-slate-500">Total</p><p className="text-2xl font-extrabold text-teal-800">{patientStats.total}</p></div>
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4"><p className="text-xs text-slate-500">Active</p><p className="text-2xl font-extrabold text-emerald-700">{patientStats.active}</p></div>
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4"><p className="text-xs text-slate-500">Inactive / other</p><p className="text-2xl font-extrabold text-slate-700">{patientStats.inactive}</p></div>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={store.charts.patientGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" /><YAxis /><Tooltip /><Legend />
                      <Line dataKey="newPatients" stroke="#0f766e" name="New" />
                      <Line dataKey="returning" stroke="#0284c7" name="Returning" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={patientStats.referrals} dataKey="value" nameKey="name" outerRadius={90} label>
                        {patientStats.referrals.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                      </Pie>
                      <Tooltip /><Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {tab === 'Appointment' && (
            <>
              <p className="text-sm text-slate-600">Filtered appointments: <strong>{appointmentStats.total}</strong></p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={store.charts.appointmentsTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" /><YAxis /><Tooltip /><Legend />
                    <Bar dataKey="completed" fill="#0f766e" name="Completed" />
                    <Bar dataKey="cancelled" fill="#f43f5e" name="Cancelled" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <ClinicTable>
                <ClinicTableHeader columns={['ID', 'Date', 'Patient', 'Status']} />
                <ClinicTableBody>
                  {appointmentStats.rows.map((a) => (
                    <ClinicTableRow key={a.id}>
                      <ClinicTableCell>{a.id}</ClinicTableCell>
                      <ClinicTableCell>{a.date} {a.startTime}</ClinicTableCell>
                      <ClinicTableCell>{fullPatientName(store.patients.find((p) => p.id === a.patientId))}</ClinicTableCell>
                      <ClinicTableCell><ClinicStatusBadge status={a.status} /></ClinicTableCell>
                    </ClinicTableRow>
                  ))}
                </ClinicTableBody>
              </ClinicTable>
            </>
          )}

          {tab === 'Therapist' && (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={therapistStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" /><YAxis /><Tooltip /><Legend />
                  <Bar dataKey="sessions" fill="#0f766e" name="Sessions" />
                  <Bar dataKey="utilization" fill="#99f6e4" name="Utilization %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {tab === 'Financial' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-teal-50 border border-teal-100 p-4"><p className="text-xs text-slate-500">Revenue</p><p className="text-xl font-extrabold text-teal-800">{formatPkr(financial.revenue)}</p></div>
                <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4"><p className="text-xs text-slate-500">Outstanding</p><p className="text-xl font-extrabold text-amber-700">{formatPkr(financial.outstanding)}</p></div>
                <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4"><p className="text-xs text-slate-500">Expenses</p><p className="text-xl font-extrabold text-rose-700">{formatPkr(financial.expenses)}</p></div>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financial.trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" /><YAxis /><Tooltip formatter={(v) => formatPkr(Number(v || 0))} /><Legend />
                      <Bar dataKey="revenue" fill="#0f766e" name="Revenue" />
                      <Bar dataKey="expenses" fill="#f59e0b" name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={financial.byMethod} dataKey="value" nameKey="name" outerRadius={90} label>
                        {financial.byMethod.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => formatPkr(Number(v || 0))} /><Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {tab === 'Treatment' && (
            <>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-teal-50 border border-teal-100 p-4"><p className="text-xs text-slate-500">Active</p><p className="text-2xl font-extrabold">{treatmentStats.active}</p></div>
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4"><p className="text-xs text-slate-500">Completed</p><p className="text-2xl font-extrabold">{treatmentStats.completed}</p></div>
                <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4"><p className="text-xs text-slate-500">Pending/Paused</p><p className="text-2xl font-extrabold">{treatmentStats.pending}</p></div>
              </div>
              <ClinicTable>
                <ClinicTableHeader columns={['Plan', 'Patient', 'Progress', 'Status']} />
                <ClinicTableBody>
                  {treatmentStats.rows.map((t) => (
                    <ClinicTableRow key={t.id}>
                      <ClinicTableCell>{t.id}</ClinicTableCell>
                      <ClinicTableCell>{fullPatientName(store.patients.find((p) => p.id === t.patientId))}</ClinicTableCell>
                      <ClinicTableCell>{t.progressPercent}%</ClinicTableCell>
                      <ClinicTableCell><ClinicStatusBadge status={t.status} /></ClinicTableCell>
                    </ClinicTableRow>
                  ))}
                </ClinicTableBody>
              </ClinicTable>
            </>
          )}
        </div>
      </ClinicCard>
    </ClinicPage>
  );
}
