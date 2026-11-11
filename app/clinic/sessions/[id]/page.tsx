'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileEdit, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ClinicPage,
  ClinicMockBanner,
  ClinicPageHeader,
  ClinicCard,
  ClinicButton,
  ClinicField,
  clinicInputClass,
  ClinicStatusBadge,
} from '../../ui';
import {
  useClinicStore,
  fullPatientName,
  patientById,
  therapistById,
  serviceById,
} from '../../_lib/store';
import { formatDate } from '../../_lib/format';
import type { TherapySession } from '../../_lib/types';

const DOC_FIELDS: Array<{ key: keyof TherapySession; label: string; multiline?: boolean }> = [
  { key: 'condition', label: 'Patient condition', multiline: true },
  { key: 'assessment', label: 'Assessment', multiline: true },
  { key: 'symptoms', label: 'Symptoms', multiline: true },
  { key: 'treatmentPerformed', label: 'Treatment performed', multiline: true },
  { key: 'activities', label: 'Activities', multiline: true },
  { key: 'progressNotes', label: 'Progress notes', multiline: true },
  { key: 'patientResponse', label: 'Patient response', multiline: true },
  { key: 'recommendations', label: 'Recommendations', multiline: true },
  { key: 'nextSessionPlan', label: 'Next session plan', multiline: true },
  { key: 'remarks', label: 'Remarks', multiline: true },
];

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const store = useClinicStore();
  const session = store.sessions.find((s) => s.id === id);
  const [draft, setDraft] = useState<TherapySession | null>(session ? { ...session } : null);
  const [feedback, setFeedback] = useState(session?.patientFeedback || 4);

  const previous = useMemo(() => {
    if (!session) return null;
    const samePatient = store.sessions
      .filter((s) => s.patientId === session.patientId && s.id !== session.id && s.status === 'Completed')
      .sort((a, b) => b.date.localeCompare(a.date));
    return samePatient[0] || null;
  }, [session, store.sessions]);

  if (!session || !draft) {
    return (
      <ClinicPage>
        <p className="text-sm text-slate-600">Session not found.</p>
        <ClinicButton onClick={() => router.push('/clinic/sessions')}>Back</ClinicButton>
      </ClinicPage>
    );
  }

  const patient = patientById(session.patientId, store.patients);
  const therapist = therapistById(session.therapistId, store.therapists);
  const service = serviceById(session.serviceId, store.services);

  const save = () => {
    store.update((s) => ({
      ...s,
      sessions: s.sessions.map((x) => (x.id === id ? { ...draft, patientFeedback: feedback } : x)),
    }));
    toast.success('Session notes saved');
  };

  const complete = () => {
    store.update((s) => ({
      ...s,
      sessions: s.sessions.map((x) =>
        x.id === id ? { ...draft, patientFeedback: feedback, status: 'Completed' } : x
      ),
    }));
    toast.success('Session marked completed');
    router.push('/clinic/sessions');
  };

  return (
    <ClinicPage>
      <ClinicMockBanner />
      <ClinicPageHeader
        backHref="/clinic/sessions"
        title={`Session ${session.id}`}
        subtitle={`${patient ? fullPatientName(patient) : session.patientId} · ${formatDate(session.date)} · ${service?.name}`}
        icon={<FileEdit className="w-5 h-5 text-white" />}
        actions={
          <>
            <ClinicStatusBadge status={draft.status} />
            <ClinicButton variant="secondary" onClick={save}>Save draft</ClinicButton>
            <ClinicButton onClick={complete}><CheckCircle className="w-3.5 h-3.5" /> Complete session</ClinicButton>
          </>
        }
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <ClinicCard title="Session info" className="lg:col-span-1">
          <dl className="text-xs space-y-2 text-slate-600">
            <div><dt className="text-slate-400">Therapist</dt><dd className="font-semibold text-slate-900">{therapist?.name}</dd></div>
            <div><dt className="text-slate-400">Time</dt><dd>{session.startTime} – {session.endTime} ({session.durationMinutes} min)</dd></div>
            <div><dt className="text-slate-400">Service</dt><dd>{service?.name}</dd></div>
          </dl>
          <div className="mt-4">
            <ClinicField label="Patient feedback (1–5)">
              <input
                type="range"
                min={1}
                max={5}
                value={feedback}
                onChange={(e) => setFeedback(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
              <p className="text-center text-sm font-bold text-teal-700">{feedback} / 5</p>
            </ClinicField>
          </div>
        </ClinicCard>

        <ClinicCard title="Clinical documentation" className="lg:col-span-2">
          <div className="grid gap-4">
            {DOC_FIELDS.map((f) => (
              <ClinicField key={String(f.key)} label={f.label}>
                {f.multiline ? (
                  <textarea
                    className={clinicInputClass() + ' min-h-[72px]'}
                    value={(draft[f.key] as string) || ''}
                    onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                  />
                ) : (
                  <input
                    className={clinicInputClass()}
                    value={(draft[f.key] as string) || ''}
                    onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                  />
                )}
              </ClinicField>
            ))}
          </div>
        </ClinicCard>
      </div>

      {previous && (
        <ClinicCard title="Previous session comparison" subtitle={`${formatDate(previous.date)} — ${previous.id}`}>
          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border">
              <p className="font-bold text-slate-800 mb-1">Last progress notes</p>
              <p className="text-slate-600 whitespace-pre-wrap">{previous.progressNotes || 'No notes recorded.'}</p>
            </div>
            <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-100">
              <p className="font-bold text-teal-900 mb-1">Current draft</p>
              <p className="text-slate-700 whitespace-pre-wrap">{draft.progressNotes || '—'}</p>
            </div>
          </div>
        </ClinicCard>
      )}
    </ClinicPage>
  );
}
