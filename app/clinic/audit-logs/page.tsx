'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from 'react';
import { ScrollText } from 'lucide-react';
import {
  ClinicPage,
  ClinicMockBanner,
  ClinicPageHeader,
  ClinicCard,
  ClinicTable,
  ClinicTableHeader,
  ClinicTableBody,
  ClinicTableRow,
  ClinicTableCell,
  ClinicSearchInput,
  ClinicSelect,
  ClinicDrawer,
  ClinicPagination,
  ClinicTabs,
} from '../ui';
import { useClinicStore } from '../_lib/store';
import { formatDateTime } from '../_lib/format';
import type { AuditLog } from '../_lib/types';

export default function AuditLogsPage() {
  const store = useClinicStore();
  const [q, setQ] = useState('');
  const [user, setUser] = useState('All');
  const [module, setModule] = useState('All');
  const [action, setAction] = useState('All');
  const [page, setPage] = useState(1);
  const [view, setView] = useState('Table');
  const [selected, setSelected] = useState<AuditLog | null>(null);
  const pageSize = 10;

  const users = useMemo(
    () => ['All', ...Array.from(new Set(store.auditLogs.map((l) => l.user)))],
    [store.auditLogs]
  );
  const modules = useMemo(
    () => ['All', ...Array.from(new Set(store.auditLogs.map((l) => l.module)))],
    [store.auditLogs]
  );
  const actions = useMemo(
    () => ['All', ...Array.from(new Set(store.auditLogs.map((l) => l.action)))],
    [store.auditLogs]
  );

  const filtered = useMemo(() => {
    return store.auditLogs
      .filter((l) => {
        const hay = `${l.user} ${l.action} ${l.module} ${l.recordRef} ${l.description}`.toLowerCase();
        return (
          (!q || hay.includes(q.toLowerCase())) &&
          (user === 'All' || l.user === user) &&
          (module === 'All' || l.module === module) &&
          (action === 'All' || l.action === action)
        );
      })
      .sort((a, b) => b.datetime.localeCompare(a.datetime));
  }, [store.auditLogs, q, user, module, action]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <ClinicPage>
      <ClinicMockBanner />
      <ClinicPageHeader
        title="Audit Logs"
        subtitle="Track user actions across the clinic module"
        icon={<ScrollText className="w-5 h-5 text-white" />}
      />

      <ClinicCard>
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <ClinicSearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search logs…" />
          <ClinicSelect value={user} onChange={(v) => { setUser(v); setPage(1); }} options={users.map((u) => ({ value: u, label: u === 'All' ? 'All users' : u }))} />
          <ClinicSelect value={module} onChange={(v) => { setModule(v); setPage(1); }} options={modules.map((m) => ({ value: m, label: m === 'All' ? 'All modules' : m }))} />
          <ClinicSelect value={action} onChange={(v) => { setAction(v); setPage(1); }} options={actions.map((a) => ({ value: a, label: a === 'All' ? 'All actions' : a }))} />
        </div>
        <ClinicTabs tabs={['Table', 'Timeline']} active={view} onChange={setView} />

        {view === 'Table' ? (
          <>
            <div className="mt-4">
              <ClinicTable>
                <ClinicTableHeader columns={['Date & Time', 'User', 'Action', 'Module', 'Record', 'IP', 'Description']} />
                <ClinicTableBody>
                  {rows.map((l) => (
                    <ClinicTableRow key={l.id} onClick={() => setSelected(l)}>
                      <ClinicTableCell className="whitespace-nowrap">{formatDateTime(l.datetime)}</ClinicTableCell>
                      <ClinicTableCell className="font-medium">{l.user}</ClinicTableCell>
                      <ClinicTableCell>{l.action}</ClinicTableCell>
                      <ClinicTableCell>{l.module}</ClinicTableCell>
                      <ClinicTableCell className="font-mono text-xs">{l.recordRef}</ClinicTableCell>
                      <ClinicTableCell className="text-xs text-slate-500">{l.ip}</ClinicTableCell>
                      <ClinicTableCell className="max-w-[240px] truncate">{l.description}</ClinicTableCell>
                    </ClinicTableRow>
                  ))}
                </ClinicTableBody>
              </ClinicTable>
            </div>
            <ClinicPagination currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={pageSize} onPageChange={setPage} />
          </>
        ) : (
          <div className="mt-5 space-y-4">
            {rows.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setSelected(l)}
                className="w-full text-left flex gap-3"
              >
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-teal-600 mt-1" />
                  <div className="w-px flex-1 bg-teal-100 mt-1" />
                </div>
                <div className="flex-1 rounded-xl border border-teal-100 bg-teal-50/30 px-4 py-3 mb-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-slate-900">{l.action} · {l.module}</p>
                    <span className="text-[11px] text-slate-400">{formatDateTime(l.datetime)}</span>
                  </div>
                  <p className="text-xs text-slate-600">{l.user} — {l.description}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{l.recordRef} · {l.ip}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </ClinicCard>

      <ClinicDrawer
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Audit Log Detail"
        subtitle={selected?.id}
      >
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-slate-500">User</p><p className="font-semibold">{selected.user}</p></div>
              <div><p className="text-xs text-slate-500">Action</p><p className="font-semibold">{selected.action}</p></div>
              <div><p className="text-xs text-slate-500">Module</p><p className="font-semibold">{selected.module}</p></div>
              <div><p className="text-xs text-slate-500">Record</p><p className="font-semibold">{selected.recordRef}</p></div>
              <div><p className="text-xs text-slate-500">Date & time</p><p className="font-semibold">{formatDateTime(selected.datetime)}</p></div>
              <div><p className="text-xs text-slate-500">IP address</p><p className="font-semibold">{selected.ip}</p></div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Description</p>
              <p className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-slate-700">{selected.description}</p>
            </div>
          </div>
        )}
      </ClinicDrawer>
    </ClinicPage>
  );
}
