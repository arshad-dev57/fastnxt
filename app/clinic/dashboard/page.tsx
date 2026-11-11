'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  CalendarDays,
  CheckCircle2,
  Clock3,
  XCircle,
  UserX,
  Banknote,
  Wallet,
  PhoneCall,
  UserRound,
  Activity,
  LayoutDashboard,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts';
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
  ClinicSelect,
  CLINIC_COLORS,
} from '../ui';
import { useClinicStore, fullPatientName } from '../_lib/store';
import { formatDate, formatPkr, todayIso } from '../_lib/format';

export default function ClinicDashboardPage() {
  const store = useClinicStore();
  const [range, setRange] = useState<'Today' | 'This Week' | 'This Month'>('Today');
  const [apptView, setApptView] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');
  const today = todayIso();

  const kpis = useMemo(() => {
    const monthPrefix = today.slice(0, 7);
    const todayAppts = store.appointments.filter((a) => a.date === today);
    const completedSessions = store.sessions.filter((s) => s.status === 'Completed').length;
    const pendingSessions = store.sessions.filter((s) =>
      ['Scheduled', 'In Progress', 'Paused'].includes(s.status)
    ).length;
    const cancelled = store.appointments.filter((a) => a.status === 'Cancelled').length;
    const noShows = store.appointments.filter((a) => a.status === 'No Show').length;
    const revenue = store.payments
      .filter((p) => p.status === 'Completed')
      .reduce((s, p) => s + p.amount, 0);
    const pendingPay = store.invoices
      .filter((i) => ['Unpaid', 'Partially Paid', 'Overdue'].includes(i.status))
      .reduce((s, i) => s + i.outstanding, 0);
    const followUps = store.followUps.filter((f) =>
      ['Upcoming', 'Overdue'].includes(f.status)
    ).length;
    const availableTherapists = store.therapists.filter((t) => t.status === 'Active').length;
    const util =
      store.therapists.filter((t) => t.status === 'Active').reduce((s, t) => s + t.utilization, 0) /
      Math.max(1, availableTherapists);
    const newPatients = store.patients.filter((p) => p.registrationDate.startsWith(monthPrefix))
      .length;

    return {
      totalPatients: store.patients.length,
      newPatients,
      todayAppts: todayAppts.length,
      completedSessions,
      pendingSessions,
      cancelled,
      noShows,
      revenue,
      pendingPay,
      followUps,
      availableTherapists,
      util: Math.round(util),
    };
  }, [store, today]);

  const todaysAppointments = useMemo(
    () =>
      store.appointments
        .filter((a) => a.date === today)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [store.appointments, today]
  );

  const upcomingSessions = useMemo(
    () =>
      store.sessions
        .filter((s) => s.date >= today && s.status !== 'Cancelled')
        .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
        .slice(0, 6),
    [store.sessions, today]
  );

  const upcomingFollowUps = useMemo(
    () =>
      store.followUps
        .filter((f) => ['Upcoming', 'Overdue'].includes(f.status))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 6),
    [store.followUps]
  );

  const recentPatients = useMemo(
    () =>
      [...store.patients]
        .sort((a, b) => b.registrationDate.localeCompare(a.registrationDate))
        .slice(0, 6),
    [store.patients]
  );

  const paymentAlerts = useMemo(
    () =>
      store.invoices
        .filter((i) => ['Overdue', 'Unpaid', 'Partially Paid'].includes(i.status))
        .sort((a, b) => b.outstanding - a.outstanding)
        .slice(0, 6),
    [store.invoices]
  );

  const appointmentChart =
    apptView === 'Daily'
      ? store.charts.appointmentsTrend
      : apptView === 'Weekly'
      ? store.charts.appointmentsTrend
      : store.charts.revenueTrend.map((r) => ({
          label: r.month,
          scheduled: Math.round(r.revenue / 20000),
          completed: Math.round(r.revenue / 24000),
          cancelled: 2,
        }));

  return (
    <ClinicPage fullWidth>
      <ClinicMockBanner />
      <ClinicPageHeader
        title="Clinic Management Dashboard"
        subtitle={`${range} overview · ${store.settings.clinicName} · ${store.settings.city}`}
        icon={<LayoutDashboard className="w-5 h-5 text-white" />}
        actions={
          <div className="flex items-center gap-2">
            <ClinicSelect
              value={range}
              onChange={(v) => setRange(v as typeof range)}
              options={[
                { value: 'Today', label: 'Today' },
                { value: 'This Week', label: 'This Week' },
                { value: 'This Month', label: 'This Month' },
              ]}
              className="bg-white/95 text-teal-900 border-0"
            />
            <Link
              href="/clinic/calendar"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-teal-800 text-xs font-bold hover:bg-white/90 shadow-sm"
            >
              Book Appointment
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3">
        <ClinicStatCard label="Total Patients" value={kpis.totalPatients} icon={Users} color={CLINIC_COLORS.primary} href="/clinic/patients" hint="Registered patients" />
        <ClinicStatCard label="New Patients This Month" value={kpis.newPatients} icon={UserPlus} color="#0891b2" hint="Registrations" />
        <ClinicStatCard label="Today's Appointments" value={kpis.todayAppts} icon={CalendarDays} color="#0284c7" href="/clinic/calendar" />
        <ClinicStatCard label="Completed Sessions" value={kpis.completedSessions} icon={CheckCircle2} color={CLINIC_COLORS.success} href="/clinic/sessions" />
        <ClinicStatCard label="Pending Sessions" value={kpis.pendingSessions} icon={Clock3} color={CLINIC_COLORS.warning} />
        <ClinicStatCard label="Cancelled Appointments" value={kpis.cancelled} icon={XCircle} color="#f43f5e" />
        <ClinicStatCard label="No-Show Patients" value={kpis.noShows} icon={UserX} color="#e11d48" />
        <ClinicStatCard label="Total Revenue" value={formatPkr(kpis.revenue)} icon={Banknote} color="#059669" href="/clinic/payments" />
        <ClinicStatCard label="Pending Payments" value={formatPkr(kpis.pendingPay)} icon={Wallet} color="#d97706" href="/clinic/invoices" />
        <ClinicStatCard label="Upcoming Follow-ups" value={kpis.followUps} icon={PhoneCall} color="#7c3aed" href="/clinic/follow-ups" />
        <ClinicStatCard label="Available Therapists" value={kpis.availableTherapists} icon={UserRound} color="#0f766e" href="/clinic/therapists" />
        <ClinicStatCard label="Therapist Utilization" value={`${kpis.util}%`} icon={Activity} color="#14b8a6" hint="Active therapists avg" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <ClinicCard
          className="xl:col-span-2"
          title="Today's Appointments"
          subtitle={`${todaysAppointments.length} scheduled for ${formatDate(today)}`}
          action={
            <Link href="/clinic/calendar" className="text-xs font-bold text-teal-700 inline-flex items-center gap-1">
              Open calendar <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
          noPadding
        >
          <div className="p-0">
            <ClinicTable>
              <ClinicTableHeader columns={['Time', 'Patient', 'Therapist', 'Service', 'Status']} />
              <ClinicTableBody>
                {todaysAppointments.length === 0 ? (
                  <ClinicTableRow>
                    <ClinicTableCell colSpan={5} className="text-center text-slate-500 py-8">
                      No appointments for today
                    </ClinicTableCell>
                  </ClinicTableRow>
                ) : (
                  todaysAppointments.map((a) => {
                    const patient = store.patients.find((p) => p.id === a.patientId);
                    const therapist = store.therapists.find((t) => t.id === a.therapistId);
                    const service = store.services.find((s) => s.id === a.serviceId);
                    return (
                      <ClinicTableRow key={a.id}>
                        <ClinicTableCell className="font-semibold text-slate-900 whitespace-nowrap">
                          {a.startTime}–{a.endTime}
                        </ClinicTableCell>
                        <ClinicTableCell>
                          <div className="flex items-center gap-2">
                            <ClinicAvatar name={fullPatientName(patient)} color={patient?.avatarColor} size="sm" />
                            <span className="font-medium">{fullPatientName(patient)}</span>
                          </div>
                        </ClinicTableCell>
                        <ClinicTableCell>{therapist?.name || '—'}</ClinicTableCell>
                        <ClinicTableCell>{service?.name || '—'}</ClinicTableCell>
                        <ClinicTableCell>
                          <ClinicStatusBadge status={a.status} />
                        </ClinicTableCell>
                      </ClinicTableRow>
                    );
                  })
                )}
              </ClinicTableBody>
            </ClinicTable>
          </div>
        </ClinicCard>

        <ClinicCard
          title="Appointment Overview"
          subtitle={`${apptView} trend`}
          action={
            <ClinicSelect
              value={apptView}
              onChange={(v) => setApptView(v as typeof apptView)}
              options={[
                { value: 'Daily', label: 'Daily' },
                { value: 'Weekly', label: 'Weekly' },
                { value: 'Monthly', label: 'Monthly' },
              ]}
            />
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="scheduled" fill="#0f766e" radius={[6, 6, 0, 0]} name="Scheduled" />
                <Bar dataKey="completed" fill="#14b8a6" radius={[6, 6, 0, 0]} name="Completed" />
                <Bar dataKey="cancelled" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Cancelled" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ClinicCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ClinicCard title="Revenue Analytics" subtitle="Monthly revenue vs expenses (PKR)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={store.charts.revenueTrend}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f766e" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0f766e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatPkr(Number(v || 0))} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#0f766e" fill="url(#revFill)" name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#f59e0b" fill="#f59e0b22" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ClinicCard>

        <ClinicCard title="Patient Growth" subtitle="New vs returning patients">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={store.charts.patientGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="newPatients" stroke="#0f766e" strokeWidth={2.5} name="New" />
                <Line type="monotone" dataKey="returning" stroke="#0284c7" strokeWidth={2.5} name="Returning" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ClinicCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <ClinicCard title="Therapist Performance" subtitle="Sessions, revenue & utilization" className="xl:col-span-2" noPadding>
          <div className="p-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={store.charts.therapistPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="sessions" fill="#0f766e" name="Sessions" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="right" dataKey="utilization" fill="#99f6e4" name="Utilization %" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ClinicCard>

        <ClinicCard title="Clinic Activity Feed" subtitle="Live operational updates">
          <div className="space-y-3">
            {store.activityFeed.map((item) => (
              <div key={item.id} className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-800 font-medium leading-snug">{item.message}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ClinicCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <ClinicCard title="Upcoming Sessions" action={<Link href="/clinic/sessions" className="text-xs font-bold text-teal-700">View all</Link>}>
          <div className="space-y-3">
            {upcomingSessions.map((s) => {
              const patient = store.patients.find((p) => p.id === s.patientId);
              return (
                <div key={s.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{fullPatientName(patient)}</p>
                    <p className="text-[11px] text-slate-500">
                      {formatDate(s.date)} · {s.startTime}
                    </p>
                  </div>
                  <ClinicStatusBadge status={s.status} />
                </div>
              );
            })}
          </div>
        </ClinicCard>

        <ClinicCard title="Upcoming Follow-ups" action={<Link href="/clinic/follow-ups" className="text-xs font-bold text-teal-700">View all</Link>}>
          <div className="space-y-3">
            {upcomingFollowUps.map((f) => {
              const patient = store.patients.find((p) => p.id === f.patientId);
              return (
                <div key={f.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{fullPatientName(patient)}</p>
                    <p className="text-[11px] text-slate-500">
                      {formatDate(f.date)} · {f.contactMethod}
                    </p>
                  </div>
                  <ClinicStatusBadge status={f.status} />
                </div>
              );
            })}
          </div>
        </ClinicCard>

        <ClinicCard title="Recent Registrations" action={<Link href="/clinic/patients" className="text-xs font-bold text-teal-700">Patients</Link>}>
          <div className="space-y-3">
            {recentPatients.map((p) => (
              <Link key={p.id} href={`/clinic/patients/${p.id}`} className="flex items-center gap-2 hover:bg-teal-50/60 rounded-lg p-1 -m-1">
                <ClinicAvatar name={fullPatientName(p)} color={p.avatarColor} size="sm" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{fullPatientName(p)}</p>
                  <p className="text-[11px] text-slate-500">{formatDate(p.registrationDate)} · {p.city}</p>
                </div>
              </Link>
            ))}
          </div>
        </ClinicCard>

        <ClinicCard
          title="Payment Alerts"
          subtitle="Outstanding balances"
          action={<Link href="/clinic/invoices" className="text-xs font-bold text-teal-700">Invoices</Link>}
        >
          <div className="space-y-3">
            {paymentAlerts.map((inv) => {
              const patient = store.patients.find((p) => p.id === inv.patientId);
              return (
                <div key={inv.id} className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {inv.invoiceNumber} · {fullPatientName(patient)}
                    </p>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-500">{formatPkr(inv.outstanding)}</span>
                      <ClinicStatusBadge status={inv.status} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ClinicCard>
      </div>
    </ClinicPage>
  );
}
