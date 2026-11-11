'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ACTIVITY_FEED,
  APPOINTMENTS,
  AUDIT_LOGS,
  CLINIC_SETTINGS,
  DASHBOARD_CHARTS,
  EXPENSES,
  FOLLOW_UPS,
  INVENTORY,
  INVOICES,
  MEDICAL_RECORDS,
  NOTIFICATIONS,
  PACKAGES,
  PATIENT_PACKAGES,
  PATIENTS,
  PAYMENTS,
  PRESCRIPTIONS,
  ROLES,
  ROOMS,
  SCHEDULES,
  SERVICES,
  SESSIONS,
  STAFF,
  THERAPISTS,
  TREATMENT_PLANS,
  WAITING_LIST,
} from './mock-data';
import type {
  AuditLog,
  ClinicAppointment,
  ClinicExpense,
  ClinicInvoice,
  ClinicNotification,
  ClinicPatient,
  ClinicPayment,
  ClinicRole,
  ClinicRoom,
  ClinicService,
  ClinicSettings,
  ClinicStaff,
  ClinicTherapist,
  FollowUp,
  InventoryItem,
  MedicalRecord,
  PatientPackage,
  Prescription,
  TherapistSchedule,
  TherapyPackage,
  TherapySession,
  TreatmentPlan,
  WaitingListItem,
} from './types';

const STORAGE_KEY = 'bisonstechs_clinic_store_v1';

export interface ClinicStoreState {
  patients: ClinicPatient[];
  therapists: ClinicTherapist[];
  services: ClinicService[];
  rooms: ClinicRoom[];
  appointments: ClinicAppointment[];
  waitingList: WaitingListItem[];
  sessions: TherapySession[];
  treatmentPlans: TreatmentPlan[];
  prescriptions: Prescription[];
  followUps: FollowUp[];
  invoices: ClinicInvoice[];
  payments: ClinicPayment[];
  packages: TherapyPackage[];
  patientPackages: PatientPackage[];
  expenses: ClinicExpense[];
  inventory: InventoryItem[];
  staff: ClinicStaff[];
  schedules: TherapistSchedule[];
  medicalRecords: MedicalRecord[];
  notifications: ClinicNotification[];
  auditLogs: AuditLog[];
  roles: ClinicRole[];
  settings: ClinicSettings;
}

function seedState(): ClinicStoreState {
  return {
    patients: PATIENTS,
    therapists: THERAPISTS,
    services: SERVICES,
    rooms: ROOMS,
    appointments: APPOINTMENTS,
    waitingList: WAITING_LIST,
    sessions: SESSIONS,
    treatmentPlans: TREATMENT_PLANS,
    prescriptions: PRESCRIPTIONS,
    followUps: FOLLOW_UPS,
    invoices: INVOICES,
    payments: PAYMENTS,
    packages: PACKAGES,
    patientPackages: PATIENT_PACKAGES,
    expenses: EXPENSES,
    inventory: INVENTORY,
    staff: STAFF,
    schedules: SCHEDULES,
    medicalRecords: MEDICAL_RECORDS,
    notifications: NOTIFICATIONS,
    auditLogs: AUDIT_LOGS,
    roles: ROLES,
    settings: CLINIC_SETTINGS,
  };
}

function loadState(): ClinicStoreState {
  if (typeof window === 'undefined') return seedState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    return { ...seedState(), ...JSON.parse(raw) };
  } catch {
    return seedState();
  }
}

function persist(state: ClinicStoreState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let memory = seedState();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getClinicStore(): ClinicStoreState {
  return memory;
}

export function setClinicStore(updater: (prev: ClinicStoreState) => ClinicStoreState) {
  memory = updater(memory);
  persist(memory);
  emit();
}

export function resetClinicStore() {
  memory = seedState();
  persist(memory);
  emit();
}

export function useClinicStore(): ClinicStoreState & {
  update: typeof setClinicStore;
  reset: typeof resetClinicStore;
  charts: typeof DASHBOARD_CHARTS;
  activityFeed: typeof ACTIVITY_FEED;
} {
  const [state, setState] = useState<ClinicStoreState>(memory);

  useEffect(() => {
    memory = loadState();
    setState(memory);
    const listener = () => setState({ ...memory });
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const update = useCallback((updater: (prev: ClinicStoreState) => ClinicStoreState) => {
    setClinicStore(updater);
  }, []);

  return {
    ...state,
    update,
    reset: resetClinicStore,
    charts: DASHBOARD_CHARTS,
    activityFeed: ACTIVITY_FEED,
  };
}

export function patientById(id: string, patients = memory.patients) {
  return patients.find((p) => p.id === id);
}

export function therapistById(id: string, therapists = memory.therapists) {
  return therapists.find((t) => t.id === id);
}

export function serviceById(id: string, services = memory.services) {
  return services.find((s) => s.id === id);
}

export function roomById(id: string, rooms = memory.rooms) {
  return rooms.find((r) => r.id === id);
}

export function fullPatientName(p?: ClinicPatient | null) {
  if (!p) return 'Unknown patient';
  return `${p.firstName} ${p.lastName}`;
}

export function nextId(prefix: string, existing: Array<{ id: string }>) {
  const nums = existing
    .map((e) => Number(String(e.id).replace(/\D/g, '')))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}-${String(next).padStart(4, '0')}`;
}
