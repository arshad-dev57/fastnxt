import type {
  ActivityFeedItem,
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
import { addDaysIso, todayIso } from './format';

const T = todayIso();
const colors = ['#0f766e', '#0891b2', '#059669', '#0284c7', '#7c3aed', '#db2777', '#ea580c', '#4f46e5'];

export const CLINIC_SETTINGS: ClinicSettings = {
  clinicName: 'Bisonstechs Care Clinic',
  tagline: 'Complete physiotherapy & rehabilitation care',
  address: '12-C, Block 6, PECHS',
  city: 'Karachi',
  phone: '+92 21 3456 7890',
  email: 'care@bisonstechs.clinic',
  website: 'www.bisonstechscare.pk',
  currency: 'PKR',
  taxPercent: 5,
  workingHoursStart: '09:00',
  workingHoursEnd: '20:00',
  appointmentSlotMinutes: 30,
  patientIdPrefix: 'PAT',
  appointmentIdPrefix: 'APT',
  logoText: 'BCC',
};

export const THERAPISTS: ClinicTherapist[] = [
  { id: 'TH-001', name: 'Dr. Ayesha Khan', qualification: 'DPT, MPhil', specialization: 'Physiotherapy', experienceYears: 12, phone: '+92 300 1112233', email: 'ayesha.khan@clinic.pk', employmentType: 'Full-time', joiningDate: '2019-03-12', branch: 'Karachi PECHS', consultationFee: 3500, sessionFee: 2500, commissionPercent: 20, status: 'Active', avatarColor: colors[0], todayAppointments: 6, utilization: 88 },
  { id: 'TH-002', name: 'Dr. Bilal Ahmed', qualification: 'DPT', specialization: 'Sports Rehab', experienceYears: 8, phone: '+92 301 2223344', email: 'bilal.ahmed@clinic.pk', employmentType: 'Full-time', joiningDate: '2020-07-01', branch: 'Karachi PECHS', consultationFee: 3000, sessionFee: 2200, commissionPercent: 18, status: 'Active', avatarColor: colors[1], todayAppointments: 5, utilization: 76 },
  { id: 'TH-003', name: 'Sara Malik', qualification: 'MS Clinical Psychology', specialization: 'Psychology', experienceYears: 10, phone: '+92 302 3334455', email: 'sara.malik@clinic.pk', employmentType: 'Full-time', joiningDate: '2018-11-20', branch: 'Karachi PECHS', consultationFee: 4000, sessionFee: 3500, commissionPercent: 25, status: 'Active', avatarColor: colors[2], todayAppointments: 4, utilization: 70 },
  { id: 'TH-004', name: 'Dr. Hamza Raza', qualification: 'DPT, Orthopedic Cert.', specialization: 'Orthopedic Physio', experienceYears: 9, phone: '+92 303 4445566', email: 'hamza.raza@clinic.pk', employmentType: 'Full-time', joiningDate: '2021-01-15', branch: 'Lahore Gulberg', consultationFee: 3200, sessionFee: 2400, commissionPercent: 20, status: 'Active', avatarColor: colors[3], todayAppointments: 3, utilization: 65 },
  { id: 'TH-005', name: 'Fatima Noor', qualification: 'BS Speech Therapy', specialization: 'Speech Therapy', experienceYears: 6, phone: '+92 304 5556677', email: 'fatima.noor@clinic.pk', employmentType: 'Part-time', joiningDate: '2022-05-10', branch: 'Karachi PECHS', consultationFee: 2800, sessionFee: 2000, commissionPercent: 15, status: 'Active', avatarColor: colors[4], todayAppointments: 4, utilization: 72 },
  { id: 'TH-006', name: 'Dr. Omar Siddiqui', qualification: 'MOT', specialization: 'Occupational Therapy', experienceYears: 7, phone: '+92 305 6667788', email: 'omar.siddiqui@clinic.pk', employmentType: 'Full-time', joiningDate: '2021-09-01', branch: 'Islamabad F-7', consultationFee: 3000, sessionFee: 2300, commissionPercent: 18, status: 'Active', avatarColor: colors[5], todayAppointments: 2, utilization: 58 },
  { id: 'TH-007', name: 'Nadia Hussain', qualification: 'DPT', specialization: 'Pediatric Physio', experienceYears: 5, phone: '+92 306 7778899', email: 'nadia.hussain@clinic.pk', employmentType: 'Full-time', joiningDate: '2023-02-14', branch: 'Karachi PECHS', consultationFee: 2500, sessionFee: 1800, commissionPercent: 15, status: 'On Leave', avatarColor: colors[6], todayAppointments: 0, utilization: 0 },
  { id: 'TH-008', name: 'Dr. Usman Ali', qualification: 'MBBS, Rehab Cert.', specialization: 'Consultation', experienceYears: 15, phone: '+92 307 8889900', email: 'usman.ali@clinic.pk', employmentType: 'Consultant', joiningDate: '2017-06-01', branch: 'Karachi PECHS', consultationFee: 5000, sessionFee: 4000, commissionPercent: 30, status: 'Active', avatarColor: colors[7], todayAppointments: 3, utilization: 55 },
];

export const SERVICES: ClinicService[] = [
  { id: 'SRV-001', name: 'Initial Physiotherapy Assessment', category: 'Assessment', description: 'Comprehensive musculoskeletal assessment and treatment plan.', durationMinutes: 45, price: 3500, therapistIds: ['TH-001', 'TH-002', 'TH-004'], requiredRoomType: 'Assessment', taxPercent: 5, status: 'Active' },
  { id: 'SRV-002', name: 'Manual Therapy Session', category: 'Physiotherapy', description: 'Hands-on soft tissue and joint mobilization.', durationMinutes: 40, price: 2500, therapistIds: ['TH-001', 'TH-002', 'TH-004'], requiredRoomType: 'Therapy', requiredEquipment: ['Treatment Table'], taxPercent: 5, status: 'Active' },
  { id: 'SRV-003', name: 'Electrotherapy Session', category: 'Physiotherapy', description: 'TENS / Ultrasound / IFT modalities.', durationMinutes: 30, price: 2000, therapistIds: ['TH-001', 'TH-002'], requiredRoomType: 'Therapy', requiredEquipment: ['TENS Unit', 'Ultrasound'], taxPercent: 5, status: 'Active' },
  { id: 'SRV-004', name: 'Psychology Consultation', category: 'Psychology', description: 'Clinical psychology intake and counseling.', durationMinutes: 50, price: 4000, therapistIds: ['TH-003'], requiredRoomType: 'Consultation', taxPercent: 5, status: 'Active' },
  { id: 'SRV-005', name: 'CBT Session', category: 'Psychology', description: 'Cognitive behavioral therapy session.', durationMinutes: 50, price: 3500, therapistIds: ['TH-003'], requiredRoomType: 'Consultation', taxPercent: 5, status: 'Active' },
  { id: 'SRV-006', name: 'Speech Therapy Session', category: 'Speech Therapy', description: 'Articulation and language therapy.', durationMinutes: 40, price: 2200, therapistIds: ['TH-005'], requiredRoomType: 'Therapy', taxPercent: 5, status: 'Active' },
  { id: 'SRV-007', name: 'Occupational Therapy', category: 'Occupational Therapy', description: 'ADL and fine motor skill training.', durationMinutes: 45, price: 2300, therapistIds: ['TH-006'], requiredRoomType: 'Therapy', taxPercent: 5, status: 'Active' },
  { id: 'SRV-008', name: 'Sports Injury Rehab', category: 'Rehabilitation', description: 'Return-to-sport progressive rehabilitation.', durationMinutes: 50, price: 2800, therapistIds: ['TH-002', 'TH-004'], requiredRoomType: 'Gym', requiredEquipment: ['Exercise Ball', 'Resistance Bands'], taxPercent: 5, status: 'Active' },
  { id: 'SRV-009', name: 'Follow-up Consultation', category: 'Follow-up Consultation', description: 'Progress review with clinician.', durationMinutes: 20, price: 1500, therapistIds: ['TH-001', 'TH-008'], requiredRoomType: 'Consultation', taxPercent: 5, status: 'Active' },
  { id: 'SRV-010', name: 'Pediatric Physio Session', category: 'Physiotherapy', description: 'Age-appropriate pediatric physiotherapy.', durationMinutes: 35, price: 2000, therapistIds: ['TH-007', 'TH-001'], requiredRoomType: 'Pediatric', taxPercent: 5, status: 'Active' },
  { id: 'SRV-011', name: 'Post-Surgical Rehab', category: 'Rehabilitation', description: 'Structured post-operative recovery program.', durationMinutes: 45, price: 3000, therapistIds: ['TH-001', 'TH-004'], requiredRoomType: 'Therapy', taxPercent: 5, status: 'Active' },
  { id: 'SRV-012', name: 'Medical Consultation', category: 'Consultation', description: 'Physician consultation for rehab planning.', durationMinutes: 30, price: 5000, therapistIds: ['TH-008'], requiredRoomType: 'Consultation', taxPercent: 5, status: 'Active' },
];

export const ROOMS: ClinicRoom[] = [
  { id: 'RM-001', name: 'Assessment Bay A', type: 'Assessment', capacity: 2, equipment: ['Plinth', 'Goniometer'], branch: 'Karachi PECHS', status: 'Available' },
  { id: 'RM-002', name: 'Therapy Room 1', type: 'Therapy', capacity: 1, equipment: ['Treatment Table', 'TENS Unit'], branch: 'Karachi PECHS', status: 'Occupied' },
  { id: 'RM-003', name: 'Therapy Room 2', type: 'Therapy', capacity: 1, equipment: ['Treatment Table', 'Ultrasound'], branch: 'Karachi PECHS', status: 'Available' },
  { id: 'RM-004', name: 'Consultation Suite', type: 'Consultation', capacity: 3, equipment: ['Desk', 'Privacy Screen'], branch: 'Karachi PECHS', status: 'Available' },
  { id: 'RM-005', name: 'Rehab Gym', type: 'Gym', capacity: 6, equipment: ['Treadmill', 'Exercise Ball', 'Resistance Bands'], branch: 'Karachi PECHS', status: 'Available' },
  { id: 'RM-006', name: 'Pediatric Room', type: 'Pediatric', capacity: 2, equipment: ['Play Mat', 'Therapy Toys'], branch: 'Karachi PECHS', status: 'Maintenance', maintenanceNote: 'AC servicing scheduled' },
];

const patientSeed: Array<[string, string, 'Male' | 'Female', string, string, string, string]> = [
  ['Ahmed', 'Raza', 'Male', '1988-04-12', 'Karachi', 'TH-001', 'Orthopedic referral'],
  ['Hina', 'Saeed', 'Female', '1992-08-21', 'Karachi', 'TH-003', 'Self'],
  ['Ali', 'Hassan', 'Male', '1975-01-05', 'Lahore', 'TH-004', 'Hospital'],
  ['Maryam', 'Iqbal', 'Female', '2001-11-30', 'Karachi', 'TH-005', 'School'],
  ['Zain', 'Malik', 'Male', '1995-06-18', 'Islamabad', 'TH-002', 'Sports club'],
  ['Sana', 'Qureshi', 'Female', '1983-03-09', 'Karachi', 'TH-001', 'Family'],
  ['Farhan', 'Sheikh', 'Male', '1968-12-02', 'Karachi', 'TH-008', 'GP referral'],
  ['Areeba', 'Khan', 'Female', '2012-07-14', 'Karachi', 'TH-007', 'Pediatrician'],
  ['Imran', 'Javed', 'Male', '1990-09-25', 'Lahore', 'TH-004', 'Self'],
  ['Nida', 'Anwar', 'Female', '1998-02-17', 'Karachi', 'TH-003', 'Online'],
  ['Usama', 'Tariq', 'Male', '1986-05-28', 'Islamabad', 'TH-006', 'Workplace'],
  ['Rabia', 'Shah', 'Female', '1979-10-11', 'Karachi', 'TH-001', 'Hospital'],
  ['Hassan', 'Mehmood', 'Male', '2004-01-22', 'Karachi', 'TH-002', 'Sports club'],
  ['Iqra', 'Bibi', 'Female', '1993-04-03', 'Lahore', 'TH-005', 'Self'],
  ['Kamran', 'Abbas', 'Male', '1972-08-19', 'Karachi', 'TH-008', 'GP referral'],
  ['Mehwish', 'Rauf', 'Female', '1989-12-27', 'Karachi', 'TH-001', 'Family'],
  ['Taha', 'Noor', 'Male', '2015-03-08', 'Karachi', 'TH-007', 'Pediatrician'],
  ['Bushra', 'Latif', 'Female', '1965-06-15', 'Islamabad', 'TH-006', 'Hospital'],
  ['Saad', 'Farooq', 'Male', '1997-09-01', 'Karachi', 'TH-002', 'Self'],
  ['Yasmeen', 'Akhtar', 'Female', '1981-11-06', 'Lahore', 'TH-004', 'Orthopedic referral'],
  ['Daniyal', 'Mir', 'Male', '1994-02-14', 'Karachi', 'TH-001', 'Online'],
  ['Komal', 'Zafar', 'Female', '2000-07-29', 'Karachi', 'TH-003', 'Self'],
];

function ageOf(dob: string): number {
  const b = new Date(dob);
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  const m = n.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && n.getDate() < b.getDate())) a -= 1;
  return a;
}

export const PATIENTS: ClinicPatient[] = patientSeed.map((p, i) => {
  const id = `PAT-${String(i + 1).padStart(4, '0')}`;
  const statuses: ClinicPatient['status'][] = ['Active', 'Active', 'Active', 'Active', 'On Hold', 'Inactive', 'Discharged'];
  return {
    id,
    firstName: p[0],
    lastName: p[1],
    gender: p[2],
    dateOfBirth: p[3],
    age: ageOf(p[3]),
    phone: `+92 3${String(10 + (i % 90)).padStart(2, '0')} ${String(1000000 + i * 137).slice(0, 7)}`,
    whatsapp: `+92 3${String(10 + (i % 90)).padStart(2, '0')} ${String(1000000 + i * 137).slice(0, 7)}`,
    email: `${p[0].toLowerCase()}.${p[1].toLowerCase()}@email.pk`,
    address: `${12 + i}, Street ${i + 3}, Block ${(i % 8) + 1}`,
    city: p[4],
    emergencyContact: `Family of ${p[0]}`,
    emergencyPhone: `+92 300 ${String(2000000 + i * 91).slice(0, 7)}`,
    cnic: i % 3 === 0 ? `42101-${String(1000000 + i).slice(0, 7)}-${i % 9}` : undefined,
    bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'A-', 'O-'][i % 6],
    referralSource: p[6],
    registrationDate: addDaysIso(T, -(60 - i * 2)),
    assignedTherapistId: p[5],
    lastVisit: addDaysIso(T, -(i % 12)),
    nextAppointment: i % 5 === 0 ? undefined : addDaysIso(T, (i % 7) + 1),
    status: statuses[i % statuses.length],
    notes: i % 4 === 0 ? 'Prefers morning appointments.' : undefined,
    allergies: i % 5 === 0 ? ['Penicillin'] : i % 7 === 0 ? ['Latex'] : [],
    conditions: i % 3 === 0 ? ['Lower back pain'] : i % 4 === 0 ? ['Anxiety'] : ['Post-injury rehab'],
    avatarColor: colors[i % colors.length],
  };
});

function apt(
  n: number,
  patientIdx: number,
  therapistId: string,
  serviceId: string,
  dayOffset: number,
  start: string,
  end: string,
  status: ClinicAppointment['status'],
  type: ClinicAppointment['type'] = 'Therapy',
  roomId?: string
): ClinicAppointment {
  return {
    id: `APT-${String(n).padStart(4, '0')}`,
    patientId: PATIENTS[patientIdx].id,
    therapistId,
    serviceId,
    roomId,
    date: addDaysIso(T, dayOffset),
    startTime: start,
    endTime: end,
    durationMinutes: 40,
    type,
    status,
    notes: status === 'Cancelled' ? 'Patient requested cancellation' : undefined,
  };
}

export const APPOINTMENTS: ClinicAppointment[] = [
  apt(1, 0, 'TH-001', 'SRV-002', 0, '09:00', '09:40', 'Confirmed', 'Therapy', 'RM-002'),
  apt(2, 1, 'TH-003', 'SRV-004', 0, '09:30', '10:20', 'Checked In', 'Consultation', 'RM-004'),
  apt(3, 4, 'TH-002', 'SRV-008', 0, '10:00', '10:50', 'In Progress', 'Therapy', 'RM-005'),
  apt(4, 5, 'TH-001', 'SRV-003', 0, '11:00', '11:30', 'Scheduled', 'Therapy', 'RM-003'),
  apt(5, 7, 'TH-005', 'SRV-006', 0, '11:30', '12:10', 'Confirmed', 'Therapy', 'RM-003'),
  apt(6, 8, 'TH-004', 'SRV-002', 0, '12:00', '12:40', 'Scheduled', 'Therapy', 'RM-002'),
  apt(7, 10, 'TH-006', 'SRV-007', 0, '14:00', '14:45', 'Confirmed', 'Therapy', 'RM-005'),
  apt(8, 12, 'TH-002', 'SRV-008', 0, '15:00', '15:50', 'Scheduled', 'Therapy', 'RM-005'),
  apt(9, 14, 'TH-008', 'SRV-012', 0, '16:00', '16:30', 'Confirmed', 'Consultation', 'RM-004'),
  apt(10, 2, 'TH-004', 'SRV-011', 0, '17:00', '17:45', 'Scheduled', 'Therapy', 'RM-002'),
  apt(11, 3, 'TH-005', 'SRV-006', 1, '09:00', '09:40', 'Scheduled'),
  apt(12, 6, 'TH-001', 'SRV-009', 1, '10:00', '10:20', 'Confirmed', 'Follow-up'),
  apt(13, 9, 'TH-003', 'SRV-005', 1, '11:00', '11:50', 'Scheduled', 'Therapy'),
  apt(14, 11, 'TH-001', 'SRV-002', 1, '12:00', '12:40', 'Scheduled'),
  apt(15, 13, 'TH-005', 'SRV-006', 1, '14:00', '14:40', 'Scheduled'),
  apt(16, 15, 'TH-001', 'SRV-011', 2, '09:30', '10:15', 'Scheduled'),
  apt(17, 16, 'TH-007', 'SRV-010', 2, '10:30', '11:05', 'Scheduled', 'Therapy', 'RM-006'),
  apt(18, 17, 'TH-006', 'SRV-007', 2, '11:30', '12:15', 'Scheduled'),
  apt(19, 18, 'TH-002', 'SRV-008', 2, '14:00', '14:50', 'Scheduled'),
  apt(20, 19, 'TH-004', 'SRV-002', 2, '15:00', '15:40', 'Scheduled'),
  apt(21, 0, 'TH-001', 'SRV-002', -1, '09:00', '09:40', 'Completed'),
  apt(22, 1, 'TH-003', 'SRV-005', -1, '10:00', '10:50', 'Completed'),
  apt(23, 4, 'TH-002', 'SRV-008', -1, '11:00', '11:50', 'No Show'),
  apt(24, 5, 'TH-001', 'SRV-003', -2, '09:00', '09:30', 'Completed'),
  apt(25, 8, 'TH-004', 'SRV-002', -2, '10:00', '10:40', 'Cancelled'),
  apt(26, 10, 'TH-006', 'SRV-007', -3, '14:00', '14:45', 'Completed'),
  apt(27, 12, 'TH-002', 'SRV-001', -3, '15:00', '15:45', 'Completed', 'Assessment'),
  apt(28, 14, 'TH-008', 'SRV-012', -4, '16:00', '16:30', 'Completed', 'Consultation'),
  apt(29, 2, 'TH-004', 'SRV-011', -5, '11:00', '11:45', 'Completed'),
  apt(30, 20, 'TH-001', 'SRV-002', -6, '09:30', '10:10', 'Completed'),
  apt(31, 21, 'TH-003', 'SRV-004', 3, '10:00', '10:50', 'Scheduled', 'Consultation'),
  apt(32, 6, 'TH-001', 'SRV-002', 3, '11:00', '11:40', 'Confirmed'),
  apt(33, 9, 'TH-003', 'SRV-005', 4, '09:00', '09:50', 'Scheduled'),
  apt(34, 11, 'TH-001', 'SRV-003', 4, '12:00', '12:30', 'Scheduled'),
  apt(35, 15, 'TH-001', 'SRV-011', 5, '14:00', '14:45', 'Scheduled'),
];

export const WAITING_LIST: WaitingListItem[] = [
  { id: 'WL-001', patientId: 'PAT-0004', serviceId: 'SRV-006', preferredTherapistId: 'TH-005', preferredDate: addDaysIso(T, 2), preferredTime: '10:00', priority: 'High', requestedAt: addDaysIso(T, -3), contactPhone: PATIENTS[3].phone, status: 'Waiting' },
  { id: 'WL-002', patientId: 'PAT-0010', serviceId: 'SRV-005', preferredTherapistId: 'TH-003', preferredDate: addDaysIso(T, 1), preferredTime: '15:00', priority: 'Medium', requestedAt: addDaysIso(T, -5), contactPhone: PATIENTS[9].phone, status: 'Contacted' },
  { id: 'WL-003', patientId: 'PAT-0013', serviceId: 'SRV-008', preferredTherapistId: 'TH-002', preferredDate: addDaysIso(T, 3), preferredTime: '11:00', priority: 'Urgent', requestedAt: addDaysIso(T, -1), contactPhone: PATIENTS[12].phone, status: 'Waiting' },
  { id: 'WL-004', patientId: 'PAT-0018', serviceId: 'SRV-007', preferredDate: addDaysIso(T, 4), preferredTime: '09:30', priority: 'Low', requestedAt: addDaysIso(T, -7), contactPhone: PATIENTS[17].phone, status: 'Waiting' },
  { id: 'WL-005', patientId: 'PAT-0007', serviceId: 'SRV-012', preferredTherapistId: 'TH-008', preferredDate: addDaysIso(T, 2), preferredTime: '16:00', priority: 'High', requestedAt: addDaysIso(T, -2), contactPhone: PATIENTS[6].phone, status: 'Booked' },
  { id: 'WL-006', patientId: 'PAT-0020', serviceId: 'SRV-002', preferredTherapistId: 'TH-001', preferredDate: addDaysIso(T, 5), preferredTime: '12:00', priority: 'Medium', requestedAt: addDaysIso(T, -4), contactPhone: PATIENTS[19].phone, status: 'Waiting' },
];

export const SESSIONS: TherapySession[] = Array.from({ length: 22 }).map((_, i) => {
  const aptRef = APPOINTMENTS[i];
  const statuses: TherapySession['status'][] = ['Completed', 'Completed', 'Completed', 'In Progress', 'Scheduled', 'Paused'];
  return {
    id: `SES-${String(i + 1).padStart(4, '0')}`,
    patientId: aptRef.patientId,
    therapistId: aptRef.therapistId,
    appointmentId: aptRef.id,
    serviceId: aptRef.serviceId,
    date: aptRef.date,
    startTime: aptRef.startTime,
    endTime: aptRef.endTime,
    durationMinutes: aptRef.durationMinutes,
    status: i < 3 ? 'Completed' : i === 3 ? 'In Progress' : statuses[i % statuses.length],
    condition: 'Musculoskeletal strain',
    assessment: 'Moderate restriction in ROM; pain 5/10',
    symptoms: 'Localized pain, stiffness after prolonged sitting',
    treatmentPerformed: 'Manual therapy + therapeutic exercise',
    activities: 'Stretching, isometric strengthening, gait training',
    progressNotes: i % 2 === 0 ? 'Improved mobility compared to previous session.' : 'Pain reduced; continue current protocol.',
    patientResponse: 'Tolerated well',
    recommendations: 'Home exercise program twice daily',
    nextSessionPlan: 'Progress loading and functional drills',
    remarks: 'Patient compliant with HEP',
    patientFeedback: 4 + (i % 2),
  };
});

export const TREATMENT_PLANS: TreatmentPlan[] = [
  { id: 'TP-001', patientId: 'PAT-0001', therapistId: 'TH-001', diagnosis: 'Lumbar disc strain', objectives: ['Reduce pain', 'Restore lumbar ROM', 'Return to desk work'], recommendedTherapyIds: ['SRV-002', 'SRV-003'], totalSessions: 12, completedSessions: 7, startDate: addDaysIso(T, -28), expectedEndDate: addDaysIso(T, 14), progressPercent: 58, status: 'Active' },
  { id: 'TP-002', patientId: 'PAT-0002', therapistId: 'TH-003', diagnosis: 'Generalized anxiety', objectives: ['Reduce anxiety symptoms', 'Improve coping skills'], recommendedTherapyIds: ['SRV-004', 'SRV-005'], totalSessions: 10, completedSessions: 4, startDate: addDaysIso(T, -21), expectedEndDate: addDaysIso(T, 30), progressPercent: 40, status: 'Active' },
  { id: 'TP-003', patientId: 'PAT-0003', therapistId: 'TH-004', diagnosis: 'Post ACL reconstruction', objectives: ['Restore knee strength', 'Return to sport'], recommendedTherapyIds: ['SRV-011', 'SRV-008'], totalSessions: 20, completedSessions: 12, startDate: addDaysIso(T, -45), expectedEndDate: addDaysIso(T, 20), progressPercent: 60, status: 'Active' },
  { id: 'TP-004', patientId: 'PAT-0004', therapistId: 'TH-005', diagnosis: 'Articulation delay', objectives: ['Improve speech clarity'], recommendedTherapyIds: ['SRV-006'], totalSessions: 16, completedSessions: 6, startDate: addDaysIso(T, -30), expectedEndDate: addDaysIso(T, 40), progressPercent: 38, status: 'Active' },
  { id: 'TP-005', patientId: 'PAT-0005', therapistId: 'TH-002', diagnosis: 'Ankle sprain grade II', objectives: ['Reduce swelling', 'Restore proprioception'], recommendedTherapyIds: ['SRV-008'], totalSessions: 8, completedSessions: 8, startDate: addDaysIso(T, -35), expectedEndDate: addDaysIso(T, -5), progressPercent: 100, status: 'Completed' },
  { id: 'TP-006', patientId: 'PAT-0006', therapistId: 'TH-001', diagnosis: 'Cervical spondylosis', objectives: ['Reduce neck pain', 'Improve posture'], recommendedTherapyIds: ['SRV-002', 'SRV-003'], totalSessions: 10, completedSessions: 3, startDate: addDaysIso(T, -14), expectedEndDate: addDaysIso(T, 28), progressPercent: 30, status: 'Active' },
  { id: 'TP-007', patientId: 'PAT-0011', therapistId: 'TH-006', diagnosis: 'Fine motor impairment', objectives: ['Improve grip strength', 'ADL independence'], recommendedTherapyIds: ['SRV-007'], totalSessions: 12, completedSessions: 5, startDate: addDaysIso(T, -20), expectedEndDate: addDaysIso(T, 25), progressPercent: 42, status: 'Active' },
  { id: 'TP-008', patientId: 'PAT-0015', therapistId: 'TH-008', diagnosis: 'Post hip replacement', objectives: ['Safe ambulation', 'Strengthen hip girdle'], recommendedTherapyIds: ['SRV-011'], totalSessions: 15, completedSessions: 2, startDate: addDaysIso(T, -7), expectedEndDate: addDaysIso(T, 45), progressPercent: 13, status: 'Active' },
  { id: 'TP-009', patientId: 'PAT-0008', therapistId: 'TH-007', diagnosis: 'Developmental delay', objectives: ['Gross motor milestones'], recommendedTherapyIds: ['SRV-010'], totalSessions: 18, completedSessions: 4, startDate: addDaysIso(T, -18), expectedEndDate: addDaysIso(T, 50), progressPercent: 22, status: 'Paused' },
  { id: 'TP-010', patientId: 'PAT-0012', therapistId: 'TH-001', diagnosis: 'Frozen shoulder', objectives: ['Increase shoulder ROM'], recommendedTherapyIds: ['SRV-002'], totalSessions: 12, completedSessions: 9, startDate: addDaysIso(T, -40), expectedEndDate: addDaysIso(T, 5), progressPercent: 75, status: 'Active' },
];

export const PRESCRIPTIONS: Prescription[] = [
  { id: 'RX-001', patientId: 'PAT-0001', clinicianId: 'TH-008', date: addDaysIso(T, -10), medication: 'Ibuprofen', dosage: '400mg', frequency: 'Twice daily', duration: '5 days', instructions: 'Take after meals', status: 'Completed' },
  { id: 'RX-002', patientId: 'PAT-0002', clinicianId: 'TH-003', date: addDaysIso(T, -5), medication: 'Escitalopram', dosage: '10mg', frequency: 'Once daily', duration: '30 days', instructions: 'Morning dose', status: 'Active' },
  { id: 'RX-003', patientId: 'PAT-0003', clinicianId: 'TH-008', date: addDaysIso(T, -2), medication: 'Paracetamol', dosage: '500mg', frequency: 'As needed', duration: '7 days', instructions: 'Max 4 doses/day', status: 'Active' },
  { id: 'RX-004', patientId: 'PAT-0006', clinicianId: 'TH-001', date: addDaysIso(T, -1), medication: 'Muscle relaxant (Tizanidine)', dosage: '2mg', frequency: 'Nightly', duration: '7 days', instructions: 'May cause drowsiness', status: 'Active' },
  { id: 'RX-005', patientId: 'PAT-0015', clinicianId: 'TH-008', date: T, medication: 'Calcium + Vit D', dosage: '1 tablet', frequency: 'Once daily', duration: '60 days', instructions: 'With breakfast', status: 'Active' },
  { id: 'RX-006', patientId: 'PAT-0012', clinicianId: 'TH-008', date: addDaysIso(T, -8), medication: 'Diclofenac gel', dosage: 'Apply thin layer', frequency: 'Thrice daily', duration: '10 days', instructions: 'Do not apply on broken skin', status: 'Active' },
  { id: 'RX-007', patientId: 'PAT-0007', clinicianId: 'TH-008', date: addDaysIso(T, -15), medication: 'Omeprazole', dosage: '20mg', frequency: 'Once daily', duration: '14 days', instructions: 'Before breakfast', status: 'Completed' },
  { id: 'RX-008', patientId: 'PAT-0004', clinicianId: 'TH-005', date: addDaysIso(T, -3), medication: 'Multivitamin syrup', dosage: '5ml', frequency: 'Once daily', duration: '30 days', instructions: 'After lunch', status: 'Active' },
];

export const FOLLOW_UPS: FollowUp[] = [
  { id: 'FU-001', patientId: 'PAT-0001', assignedStaffId: 'ST-002', date: addDaysIso(T, 1), type: 'Upcoming', contactMethod: 'WhatsApp', notes: 'Confirm next therapy slot', priority: 'Medium', status: 'Upcoming' },
  { id: 'FU-002', patientId: 'PAT-0005', assignedStaffId: 'ST-002', date: addDaysIso(T, -1), type: 'Missed Appointment', contactMethod: 'Phone', notes: 'No-show yesterday — reschedule', priority: 'High', status: 'Overdue' },
  { id: 'FU-003', patientId: 'PAT-0003', assignedStaffId: 'TH-004', date: addDaysIso(T, 2), type: 'Post-treatment', contactMethod: 'SMS', notes: 'Check home exercise compliance', priority: 'Medium', status: 'Upcoming' },
  { id: 'FU-004', patientId: 'PAT-0002', assignedStaffId: 'TH-003', date: T, type: 'Upcoming', contactMethod: 'Email', notes: 'Session reminder', priority: 'Low', status: 'Upcoming' },
  { id: 'FU-005', patientId: 'PAT-0009', assignedStaffId: 'ST-002', date: addDaysIso(T, -3), type: 'Pending', contactMethod: 'Phone', notes: 'Payment reminder linked', priority: 'High', status: 'Overdue' },
  { id: 'FU-006', patientId: 'PAT-0011', assignedStaffId: 'TH-006', date: addDaysIso(T, 3), type: 'Post-treatment', contactMethod: 'WhatsApp', notes: 'ADL progress check', priority: 'Medium', status: 'Upcoming' },
  { id: 'FU-007', patientId: 'PAT-0015', assignedStaffId: 'ST-005', date: addDaysIso(T, -7), type: 'Post-treatment', contactMethod: 'Phone', notes: 'Completed — patient improving', priority: 'Low', status: 'Completed' },
  { id: 'FU-008', patientId: 'PAT-0018', assignedStaffId: 'ST-002', date: addDaysIso(T, 4), type: 'Upcoming', contactMethod: 'SMS', notes: 'Package renewal discussion', priority: 'Medium', status: 'Upcoming' },
  { id: 'FU-009', patientId: 'PAT-0004', assignedStaffId: 'TH-005', date: addDaysIso(T, -2), type: 'Missed Appointment', contactMethod: 'WhatsApp', notes: 'Parent to confirm new time', priority: 'Urgent', status: 'Missed' },
  { id: 'FU-010', patientId: 'PAT-0021', assignedStaffId: 'ST-002', date: addDaysIso(T, 5), type: 'Pending', contactMethod: 'Email', notes: 'First visit orientation', priority: 'Low', status: 'Upcoming' },
  { id: 'FU-011', patientId: 'PAT-0006', assignedStaffId: 'TH-001', date: addDaysIso(T, 1), type: 'Upcoming', contactMethod: 'Phone', notes: 'Neck pain review', priority: 'Medium', status: 'Upcoming' },
  { id: 'FU-012', patientId: 'PAT-0012', assignedStaffId: 'ST-002', date: addDaysIso(T, -10), type: 'Post-treatment', contactMethod: 'Phone', notes: 'Completed successfully', priority: 'Low', status: 'Completed' },
];

export const INVOICES: ClinicInvoice[] = [
  { id: 'INV-001', invoiceNumber: 'INV-2026-001', patientId: 'PAT-0001', date: addDaysIso(T, -5), dueDate: addDaysIso(T, 5), items: [{ description: 'Manual Therapy Session x2', qty: 2, unitPrice: 2500, amount: 5000 }], subtotal: 5000, discount: 0, tax: 250, total: 5250, paidAmount: 5250, outstanding: 0, status: 'Paid' },
  { id: 'INV-002', invoiceNumber: 'INV-2026-002', patientId: 'PAT-0002', date: addDaysIso(T, -3), dueDate: addDaysIso(T, 7), items: [{ description: 'Psychology Consultation', qty: 1, unitPrice: 4000, amount: 4000 }], subtotal: 4000, discount: 200, tax: 190, total: 3990, paidAmount: 2000, outstanding: 1990, status: 'Partially Paid' },
  { id: 'INV-003', invoiceNumber: 'INV-2026-003', patientId: 'PAT-0003', date: addDaysIso(T, -2), dueDate: addDaysIso(T, 8), items: [{ description: 'Post-Surgical Rehab x3', qty: 3, unitPrice: 3000, amount: 9000 }], subtotal: 9000, discount: 500, tax: 425, total: 8925, paidAmount: 0, outstanding: 8925, status: 'Unpaid' },
  { id: 'INV-004', invoiceNumber: 'INV-2026-004', patientId: 'PAT-0005', date: addDaysIso(T, -12), dueDate: addDaysIso(T, -2), items: [{ description: 'Sports Injury Rehab package balance', qty: 1, unitPrice: 8000, amount: 8000 }], subtotal: 8000, discount: 0, tax: 400, total: 8400, paidAmount: 0, outstanding: 8400, status: 'Overdue' },
  { id: 'INV-005', invoiceNumber: 'INV-2026-005', patientId: 'PAT-0006', date: T, dueDate: addDaysIso(T, 10), items: [{ description: 'Electrotherapy Session', qty: 2, unitPrice: 2000, amount: 4000 }], subtotal: 4000, discount: 0, tax: 200, total: 4200, paidAmount: 4200, outstanding: 0, status: 'Paid' },
  { id: 'INV-006', invoiceNumber: 'INV-2026-006', patientId: 'PAT-0008', date: addDaysIso(T, -1), dueDate: addDaysIso(T, 9), items: [{ description: 'Pediatric Physio Session x4', qty: 4, unitPrice: 2000, amount: 8000 }], subtotal: 8000, discount: 800, tax: 360, total: 7560, paidAmount: 3000, outstanding: 4560, status: 'Partially Paid' },
  { id: 'INV-007', invoiceNumber: 'INV-2026-007', patientId: 'PAT-0010', date: addDaysIso(T, -8), dueDate: addDaysIso(T, 2), items: [{ description: 'CBT Session x2', qty: 2, unitPrice: 3500, amount: 7000 }], subtotal: 7000, discount: 0, tax: 350, total: 7350, paidAmount: 7350, outstanding: 0, status: 'Paid' },
  { id: 'INV-008', invoiceNumber: 'INV-2026-008', patientId: 'PAT-0011', date: addDaysIso(T, -4), dueDate: addDaysIso(T, 6), items: [{ description: 'Occupational Therapy', qty: 3, unitPrice: 2300, amount: 6900 }], subtotal: 6900, discount: 0, tax: 345, total: 7245, paidAmount: 0, outstanding: 7245, status: 'Unpaid' },
  { id: 'INV-009', invoiceNumber: 'INV-2026-009', patientId: 'PAT-0012', date: addDaysIso(T, -6), dueDate: addDaysIso(T, 4), items: [{ description: 'Manual Therapy Session x5', qty: 5, unitPrice: 2500, amount: 12500 }], subtotal: 12500, discount: 1000, tax: 575, total: 12075, paidAmount: 12075, outstanding: 0, status: 'Paid' },
  { id: 'INV-010', invoiceNumber: 'INV-2026-010', patientId: 'PAT-0015', date: T, dueDate: addDaysIso(T, 14), items: [{ description: 'Medical Consultation + Rehab', qty: 1, unitPrice: 8000, amount: 8000 }], subtotal: 8000, discount: 0, tax: 400, total: 8400, paidAmount: 0, outstanding: 8400, status: 'Draft' },
  { id: 'INV-011', invoiceNumber: 'INV-2026-011', patientId: 'PAT-0018', date: addDaysIso(T, -9), dueDate: addDaysIso(T, 1), items: [{ description: 'Standard Package', qty: 1, unitPrice: 18000, amount: 18000 }], subtotal: 18000, discount: 2000, tax: 800, total: 16800, paidAmount: 16800, outstanding: 0, status: 'Paid' },
  { id: 'INV-012', invoiceNumber: 'INV-2026-012', patientId: 'PAT-0019', date: addDaysIso(T, -15), dueDate: addDaysIso(T, -5), items: [{ description: 'Follow-up Consultation', qty: 2, unitPrice: 1500, amount: 3000 }], subtotal: 3000, discount: 0, tax: 150, total: 3150, paidAmount: 0, outstanding: 3150, status: 'Overdue' },
  { id: 'INV-013', invoiceNumber: 'INV-2026-013', patientId: 'PAT-0020', date: addDaysIso(T, -1), dueDate: addDaysIso(T, 9), items: [{ description: 'Initial Assessment', qty: 1, unitPrice: 3500, amount: 3500 }], subtotal: 3500, discount: 0, tax: 175, total: 3675, paidAmount: 3675, outstanding: 0, status: 'Paid' },
  { id: 'INV-014', invoiceNumber: 'INV-2026-014', patientId: 'PAT-0007', date: addDaysIso(T, -20), dueDate: addDaysIso(T, -10), items: [{ description: 'Consultation', qty: 1, unitPrice: 5000, amount: 5000 }], subtotal: 5000, discount: 0, tax: 250, total: 5250, paidAmount: 0, outstanding: 5250, status: 'Cancelled' },
  { id: 'INV-015', invoiceNumber: 'INV-2026-015', patientId: 'PAT-0021', date: T, dueDate: addDaysIso(T, 7), items: [{ description: 'Registration + Assessment', qty: 1, unitPrice: 4500, amount: 4500 }], subtotal: 4500, discount: 0, tax: 225, total: 4725, paidAmount: 0, outstanding: 4725, status: 'Unpaid' },
];

export const PAYMENTS: ClinicPayment[] = [
  { id: 'PAY-001', patientId: 'PAT-0001', invoiceId: 'INV-001', date: addDaysIso(T, -5), amount: 5250, method: 'Card', reference: 'TXN-88421', receivedBy: 'Sana Reception', status: 'Completed' },
  { id: 'PAY-002', patientId: 'PAT-0002', invoiceId: 'INV-002', date: addDaysIso(T, -2), amount: 2000, method: 'Cash', receivedBy: 'Sana Reception', status: 'Completed' },
  { id: 'PAY-003', patientId: 'PAT-0006', invoiceId: 'INV-005', date: T, amount: 4200, method: 'Bank Transfer', reference: 'BT-99102', receivedBy: 'Billing Desk', status: 'Completed' },
  { id: 'PAY-004', patientId: 'PAT-0008', invoiceId: 'INV-006', date: addDaysIso(T, -1), amount: 3000, method: 'Online Payment', reference: 'OP-5521', receivedBy: 'Billing Desk', status: 'Completed' },
  { id: 'PAY-005', patientId: 'PAT-0010', invoiceId: 'INV-007', date: addDaysIso(T, -7), amount: 7350, method: 'Card', reference: 'TXN-88490', receivedBy: 'Sana Reception', status: 'Completed' },
  { id: 'PAY-006', patientId: 'PAT-0012', invoiceId: 'INV-009', date: addDaysIso(T, -6), amount: 12075, method: 'Bank Transfer', reference: 'BT-99188', receivedBy: 'Billing Desk', status: 'Completed' },
  { id: 'PAY-007', patientId: 'PAT-0018', invoiceId: 'INV-011', date: addDaysIso(T, -9), amount: 16800, method: 'Card', reference: 'TXN-88501', receivedBy: 'Billing Desk', status: 'Completed' },
  { id: 'PAY-008', patientId: 'PAT-0020', invoiceId: 'INV-013', date: addDaysIso(T, -1), amount: 3675, method: 'Cash', receivedBy: 'Sana Reception', status: 'Completed' },
  { id: 'PAY-009', patientId: 'PAT-0002', invoiceId: 'INV-002', date: addDaysIso(T, -20), amount: 500, method: 'Cash', receivedBy: 'Sana Reception', status: 'Refunded' },
  { id: 'PAY-010', patientId: 'PAT-0001', invoiceId: 'INV-001', date: addDaysIso(T, -30), amount: 2500, method: 'Cash', receivedBy: 'Sana Reception', status: 'Completed' },
  { id: 'PAY-011', patientId: 'PAT-0011', invoiceId: 'INV-008', date: addDaysIso(T, -4), amount: 2000, method: 'Online Payment', reference: 'OP-5600', receivedBy: 'Billing Desk', status: 'Pending' },
  { id: 'PAY-012', patientId: 'PAT-0005', invoiceId: 'INV-004', date: addDaysIso(T, -11), amount: 4000, method: 'Card', reference: 'TXN-88300', receivedBy: 'Billing Desk', status: 'Completed' },
  { id: 'PAY-013', patientId: 'PAT-0003', invoiceId: 'INV-003', date: addDaysIso(T, -2), amount: 3000, method: 'Bank Transfer', reference: 'BT-99200', receivedBy: 'Billing Desk', status: 'Failed' },
  { id: 'PAY-014', patientId: 'PAT-0019', invoiceId: 'INV-012', date: addDaysIso(T, -14), amount: 1500, method: 'Cash', receivedBy: 'Sana Reception', status: 'Completed' },
  { id: 'PAY-015', patientId: 'PAT-0021', invoiceId: 'INV-015', date: T, amount: 1000, method: 'Cash', receivedBy: 'Sana Reception', status: 'Pending' },
];

export const PACKAGES: TherapyPackage[] = [
  { id: 'PKG-001', name: 'Basic Care', description: '5 physiotherapy sessions for common musculoskeletal conditions.', serviceIds: ['SRV-002', 'SRV-003'], sessions: 5, price: 10000, validityDays: 60, discountPercent: 10, status: 'Active' },
  { id: 'PKG-002', name: 'Standard Rehab', description: '10 mixed therapy sessions with assessment included.', serviceIds: ['SRV-001', 'SRV-002', 'SRV-008'], sessions: 10, price: 18000, validityDays: 90, discountPercent: 15, status: 'Active' },
  { id: 'PKG-003', name: 'Premium Recovery', description: '20 sessions for post-surgical and complex rehab.', serviceIds: ['SRV-011', 'SRV-008', 'SRV-002'], sessions: 20, price: 32000, validityDays: 120, discountPercent: 20, status: 'Active' },
  { id: 'PKG-004', name: 'Mind Care', description: '8 psychology / CBT sessions.', serviceIds: ['SRV-004', 'SRV-005'], sessions: 8, price: 24000, validityDays: 90, discountPercent: 12, status: 'Active' },
  { id: 'PKG-005', name: 'Speech Starter', description: '12 speech therapy sessions for children.', serviceIds: ['SRV-006'], sessions: 12, price: 22000, validityDays: 100, discountPercent: 10, status: 'Active' },
];

export const PATIENT_PACKAGES: PatientPackage[] = [
  { id: 'PP-001', patientId: 'PAT-0001', packageId: 'PKG-002', purchasedSessions: 10, usedSessions: 7, purchaseDate: addDaysIso(T, -40), expiryDate: addDaysIso(T, 50), status: 'Active' },
  { id: 'PP-002', patientId: 'PAT-0002', packageId: 'PKG-004', purchasedSessions: 8, usedSessions: 4, purchaseDate: addDaysIso(T, -25), expiryDate: addDaysIso(T, 65), status: 'Active' },
  { id: 'PP-003', patientId: 'PAT-0003', packageId: 'PKG-003', purchasedSessions: 20, usedSessions: 12, purchaseDate: addDaysIso(T, -50), expiryDate: addDaysIso(T, 70), status: 'Active' },
  { id: 'PP-004', patientId: 'PAT-0005', packageId: 'PKG-001', purchasedSessions: 5, usedSessions: 5, purchaseDate: addDaysIso(T, -70), expiryDate: addDaysIso(T, -10), status: 'Exhausted' },
  { id: 'PP-005', patientId: 'PAT-0018', packageId: 'PKG-002', purchasedSessions: 10, usedSessions: 2, purchaseDate: addDaysIso(T, -9), expiryDate: addDaysIso(T, 81), status: 'Active' },
  { id: 'PP-006', patientId: 'PAT-0004', packageId: 'PKG-005', purchasedSessions: 12, usedSessions: 6, purchaseDate: addDaysIso(T, -30), expiryDate: addDaysIso(T, 70), status: 'Active' },
];

export const EXPENSES: ClinicExpense[] = [
  { id: 'EXP-001', category: 'Utilities', description: 'Electricity bill — October', amount: 85000, date: addDaysIso(T, -8), paymentMethod: 'Bank Transfer', reference: 'UE-991', status: 'Paid' },
  { id: 'EXP-002', category: 'Supplies', description: 'Therapy consumables restock', amount: 42000, date: addDaysIso(T, -5), paymentMethod: 'Cash', status: 'Paid' },
  { id: 'EXP-003', category: 'Maintenance', description: 'AC servicing — Pediatric Room', amount: 15000, date: addDaysIso(T, -2), paymentMethod: 'Cash', status: 'Approved' },
  { id: 'EXP-004', category: 'Marketing', description: 'Google Ads — clinic campaigns', amount: 28000, date: addDaysIso(T, -12), paymentMethod: 'Online Payment', reference: 'ADS-22', status: 'Paid' },
  { id: 'EXP-005', category: 'Salaries', description: 'Part-time assistant overtime', amount: 18000, date: addDaysIso(T, -3), paymentMethod: 'Bank Transfer', status: 'Pending' },
  { id: 'EXP-006', category: 'Equipment', description: 'New resistance bands set', amount: 9500, date: addDaysIso(T, -1), paymentMethod: 'Card', status: 'Paid' },
  { id: 'EXP-007', category: 'Rent', description: 'Clinic premises rent — November', amount: 250000, date: addDaysIso(T, -15), paymentMethod: 'Bank Transfer', reference: 'RENT-11', status: 'Paid' },
  { id: 'EXP-008', category: 'Training', description: 'CPD workshop for therapists', amount: 35000, date: T, paymentMethod: 'Bank Transfer', status: 'Approved' },
];

export const INVENTORY: InventoryItem[] = [
  { id: 'INVY-001', name: 'TENS Electrode Pads', sku: 'MED-TENS-01', category: 'Consumables', quantity: 48, unit: 'packs', reorderLevel: 20, expiryDate: addDaysIso(T, 180), supplier: 'MedSupply PK', status: 'In Stock' },
  { id: 'INVY-002', name: 'Ultrasound Gel', sku: 'MED-USG-02', category: 'Consumables', quantity: 12, unit: 'bottles', reorderLevel: 10, expiryDate: addDaysIso(T, 90), supplier: 'MedSupply PK', status: 'In Stock' },
  { id: 'INVY-003', name: 'Resistance Bands Set', sku: 'EQ-RB-03', category: 'Therapy Equipment', quantity: 6, unit: 'sets', reorderLevel: 3, supplier: 'RehabGear', status: 'In Stock', assignedRoomId: 'RM-005' },
  { id: 'INVY-004', name: 'Disposable Couch Covers', sku: 'MED-COV-04', category: 'Consumables', quantity: 8, unit: 'rolls', reorderLevel: 15, supplier: 'MedSupply PK', status: 'Low Stock' },
  { id: 'INVY-005', name: 'Goniometer', sku: 'EQ-GON-05', category: 'Therapy Equipment', quantity: 4, unit: 'pcs', reorderLevel: 2, supplier: 'RehabGear', status: 'In Stock', assignedRoomId: 'RM-001' },
  { id: 'INVY-006', name: 'Exercise Ball 65cm', sku: 'EQ-BALL-06', category: 'Therapy Equipment', quantity: 3, unit: 'pcs', reorderLevel: 2, supplier: 'RehabGear', status: 'In Stock', assignedRoomId: 'RM-005' },
  { id: 'INVY-007', name: 'Hand Sanitizer 5L', sku: 'MED-SAN-07', category: 'Medical Supplies', quantity: 2, unit: 'cans', reorderLevel: 4, expiryDate: addDaysIso(T, 200), supplier: 'HygieneCo', status: 'Low Stock' },
  { id: 'INVY-008', name: 'Pediatric Therapy Toys Kit', sku: 'EQ-TOY-08', category: 'Therapy Equipment', quantity: 1, unit: 'kits', reorderLevel: 1, supplier: 'KidsRehab', status: 'In Stock', assignedRoomId: 'RM-006' },
  { id: 'INVY-009', name: 'Kinesiology Tape', sku: 'MED-KT-09', category: 'Consumables', quantity: 0, unit: 'rolls', reorderLevel: 10, expiryDate: addDaysIso(T, -5), supplier: 'MedSupply PK', status: 'Out of Stock' },
  { id: 'INVY-010', name: 'Blood Pressure Monitor', sku: 'EQ-BP-10', category: 'Medical Supplies', quantity: 2, unit: 'pcs', reorderLevel: 1, supplier: 'MedSupply PK', status: 'In Stock', assignedRoomId: 'RM-004' },
  { id: 'INVY-011', name: 'Hot Pack Covers', sku: 'MED-HP-11', category: 'Consumables', quantity: 5, unit: 'pcs', reorderLevel: 6, supplier: 'RehabGear', status: 'Low Stock' },
  { id: 'INVY-012', name: 'Crutches Adjustable', sku: 'EQ-CR-12', category: 'Therapy Equipment', quantity: 4, unit: 'pairs', reorderLevel: 2, supplier: 'RehabGear', status: 'In Stock' },
];

export const STAFF: ClinicStaff[] = [
  { id: 'ST-001', name: 'Dr. Maham Rizvi', role: 'Clinic Administrator', phone: '+92 300 5551122', email: 'maham@clinic.pk', branch: 'Karachi PECHS', status: 'Active', joiningDate: '2018-01-10', shift: '09:00–18:00', avatarColor: colors[0] },
  { id: 'ST-002', name: 'Sana Reception', role: 'Receptionist', phone: '+92 301 5552233', email: 'sana@clinic.pk', branch: 'Karachi PECHS', status: 'Active', joiningDate: '2021-04-01', shift: '09:00–17:00', avatarColor: colors[1] },
  { id: 'ST-003', name: 'Nurse Amna', role: 'Nurse', phone: '+92 302 5553344', email: 'amna@clinic.pk', branch: 'Karachi PECHS', status: 'Active', joiningDate: '2020-08-15', shift: '10:00–18:00', avatarColor: colors[2] },
  { id: 'ST-004', name: 'Asif Assist', role: 'Assistant', phone: '+92 303 5554455', email: 'asif@clinic.pk', branch: 'Karachi PECHS', status: 'Active', joiningDate: '2022-11-01', shift: '09:00–17:00', avatarColor: colors[3] },
  { id: 'ST-005', name: 'Billing Desk (Hira)', role: 'Billing Staff', phone: '+92 304 5555566', email: 'hira@clinic.pk', branch: 'Karachi PECHS', status: 'Active', joiningDate: '2019-06-20', shift: '09:00–17:00', avatarColor: colors[4] },
  { id: 'ST-006', name: 'Dr. Ayesha Khan', role: 'Therapist', phone: '+92 300 1112233', email: 'ayesha.khan@clinic.pk', branch: 'Karachi PECHS', status: 'Active', joiningDate: '2019-03-12', shift: '09:00–17:00', avatarColor: colors[0] },
  { id: 'ST-007', name: 'Lahore Front Desk', role: 'Receptionist', phone: '+92 305 5556677', email: 'lahore.desk@clinic.pk', branch: 'Lahore Gulberg', status: 'Active', joiningDate: '2023-01-05', shift: '10:00–18:00', avatarColor: colors[5] },
  { id: 'ST-008', name: 'Nurse Farah', role: 'Nurse', phone: '+92 306 5557788', email: 'farah@clinic.pk', branch: 'Islamabad F-7', status: 'On Leave', joiningDate: '2022-03-18', shift: '09:00–17:00', avatarColor: colors[6] },
];

export const SCHEDULES: TherapistSchedule[] = THERAPISTS.flatMap((th, ti) =>
  [1, 2, 3, 4, 5, 6].map((day) => ({
    id: `SCH-${th.id}-${day}`,
    therapistId: th.id,
    dayOfWeek: day,
    startTime: day === 6 ? '10:00' : '09:00',
    endTime: day === 6 ? '14:00' : '17:00',
    breakStart: day === 6 ? undefined : '13:00',
    breakEnd: day === 6 ? undefined : '14:00',
    isOff: th.status === 'On Leave' || (ti % 3 === 0 && day === 5),
    maxSessions: day === 6 ? 4 : 8,
    roomId: ti % 2 === 0 ? 'RM-002' : 'RM-003',
  }))
);

export const MEDICAL_RECORDS: MedicalRecord[] = [
  { id: 'MR-001', patientId: 'PAT-0001', type: 'History', title: 'Musculoskeletal history', date: addDaysIso(T, -28), recordedBy: 'Dr. Ayesha Khan', summary: 'Chronic lumbar pain for 8 months after lifting injury.' },
  { id: 'MR-002', patientId: 'PAT-0001', type: 'Diagnosis', title: 'Lumbar disc strain', date: addDaysIso(T, -27), recordedBy: 'Dr. Usman Ali', summary: 'Clinical diagnosis consistent with L4-L5 strain.' },
  { id: 'MR-003', patientId: 'PAT-0001', type: 'Vital Signs', title: 'Baseline vitals', date: addDaysIso(T, -27), recordedBy: 'Nurse Amna', summary: 'BP 122/78, HR 76, SpO2 98%' },
  { id: 'MR-004', patientId: 'PAT-0002', type: 'Assessment', title: 'Anxiety screening', date: addDaysIso(T, -21), recordedBy: 'Sara Malik', summary: 'GAD-7 score 14 — moderate anxiety.' },
  { id: 'MR-005', patientId: 'PAT-0003', type: 'Lab Report', title: 'Pre-op labs summary', date: addDaysIso(T, -50), recordedBy: 'Dr. Usman Ali', summary: 'CBC and coagulation within normal limits.' },
  { id: 'MR-006', patientId: 'PAT-0003', type: 'Document', title: 'Surgical discharge summary', date: addDaysIso(T, -48), recordedBy: 'External Hospital', summary: 'ACL reconstruction — right knee.' },
  { id: 'MR-007', patientId: 'PAT-0004', type: 'Assessment', title: 'Speech assessment', date: addDaysIso(T, -30), recordedBy: 'Fatima Noor', summary: 'Mild articulation delay; stimulable for /r/ and /s/.' },
  { id: 'MR-008', patientId: 'PAT-0006', type: 'History', title: 'Cervical pain history', date: addDaysIso(T, -14), recordedBy: 'Dr. Ayesha Khan', summary: 'Desk-job related neck pain with occipital headaches.' },
  { id: 'MR-009', patientId: 'PAT-0015', type: 'Vital Signs', title: 'Post-op vitals', date: addDaysIso(T, -7), recordedBy: 'Nurse Amna', summary: 'BP 118/74, HR 82, Temp 36.8C' },
  { id: 'MR-010', patientId: 'PAT-0012', type: 'Diagnosis', title: 'Adhesive capsulitis', date: addDaysIso(T, -40), recordedBy: 'Dr. Usman Ali', summary: 'Frozen shoulder — right side, stage 2.' },
];

export const NOTIFICATIONS: ClinicNotification[] = [
  { id: 'NT-001', category: 'Appointment reminders', title: 'Today: 10 appointments', message: 'You have 10 appointments scheduled for today at PECHS branch.', createdAt: `${T}T08:00:00`, read: false, priority: 'Medium' },
  { id: 'NT-002', category: 'Payment reminders', title: 'Overdue invoices', message: '2 invoices are overdue totaling PKR 11,550.', createdAt: `${T}T08:15:00`, read: false, priority: 'High' },
  { id: 'NT-003', category: 'Follow-up reminders', title: 'Follow-ups due', message: '3 follow-ups need action today.', createdAt: `${T}T08:30:00`, read: false, priority: 'Medium' },
  { id: 'NT-004', category: 'Low stock', title: 'Low stock alert', message: 'Disposable couch covers and sanitizer are below reorder level.', createdAt: addDaysIso(T, -1) + 'T16:00:00', read: true, priority: 'High' },
  { id: 'NT-005', category: 'New bookings', title: 'New walk-in booked', message: 'Daniyal Mir booked Initial Assessment for tomorrow.', createdAt: addDaysIso(T, -1) + 'T14:22:00', read: true, priority: 'Low' },
  { id: 'NT-006', category: 'Appointment cancellations', title: 'Cancellation', message: 'Imran Javed cancelled APT-0025.', createdAt: addDaysIso(T, -2) + 'T11:05:00', read: true, priority: 'Medium' },
  { id: 'NT-007', category: 'Package expiry', title: 'Package expiring soon', message: 'Ahmed Raza Standard Rehab package has 3 sessions left.', createdAt: addDaysIso(T, -1) + 'T09:00:00', read: false, priority: 'Medium' },
  { id: 'NT-008', category: 'Session updates', title: 'Session completed', message: 'Dr. Ayesha completed SES-0001 for Ahmed Raza.', createdAt: addDaysIso(T, -1) + 'T10:10:00', read: true, priority: 'Low' },
  { id: 'NT-009', category: 'Staff notifications', title: 'Leave approved', message: 'Nadia Hussain leave for this week is approved.', createdAt: addDaysIso(T, -3) + 'T12:00:00', read: true, priority: 'Low' },
  { id: 'NT-010', category: 'Appointment reminders', title: 'No-show recorded', message: 'Zain Malik marked as No Show for yesterday session.', createdAt: addDaysIso(T, -1) + 'T12:00:00', read: false, priority: 'High' },
];

export const AUDIT_LOGS: AuditLog[] = [
  { id: 'AL-001', user: 'Sana Reception', action: 'Create', module: 'Appointments', recordRef: 'APT-0035', datetime: `${T}T09:12:00`, ip: '192.168.1.21', description: 'Created appointment for Mehwish Rauf' },
  { id: 'AL-002', user: 'Billing Desk (Hira)', action: 'Payment', module: 'Payments', recordRef: 'PAY-003', datetime: `${T}T09:40:00`, ip: '192.168.1.33', description: 'Received PKR 4,200 via bank transfer' },
  { id: 'AL-003', user: 'Dr. Ayesha Khan', action: 'Update', module: 'Sessions', recordRef: 'SES-0004', datetime: `${T}T10:15:00`, ip: '192.168.1.44', description: 'Started therapy session' },
  { id: 'AL-004', user: 'Dr. Maham Rizvi', action: 'Edit', module: 'Settings', recordRef: 'CLINIC', datetime: addDaysIso(T, -1) + 'T17:00:00', ip: '192.168.1.10', description: 'Updated working hours' },
  { id: 'AL-005', user: 'Sana Reception', action: 'Create', module: 'Patients', recordRef: 'PAT-0022', datetime: addDaysIso(T, -2) + 'T11:20:00', ip: '192.168.1.21', description: 'Registered Komal Zafar' },
  { id: 'AL-006', user: 'Billing Desk (Hira)', action: 'Export', module: 'Invoices', recordRef: 'INV-LIST', datetime: addDaysIso(T, -2) + 'T15:00:00', ip: '192.168.1.33', description: 'Exported invoice list to Excel' },
  { id: 'AL-007', user: 'Sara Malik', action: 'Create', module: 'Prescriptions', recordRef: 'RX-002', datetime: addDaysIso(T, -5) + 'T13:10:00', ip: '192.168.1.50', description: 'Created prescription for Hina Saeed' },
  { id: 'AL-008', user: 'Dr. Maham Rizvi', action: 'Approve', module: 'Expenses', recordRef: 'EXP-003', datetime: addDaysIso(T, -2) + 'T10:00:00', ip: '192.168.1.10', description: 'Approved AC servicing expense' },
  { id: 'AL-009', user: 'Sana Reception', action: 'Update', module: 'Waiting List', recordRef: 'WL-002', datetime: addDaysIso(T, -1) + 'T09:30:00', ip: '192.168.1.21', description: 'Marked waiting request as Contacted' },
  { id: 'AL-010', user: 'System', action: 'Login', module: 'Auth', recordRef: 'ST-001', datetime: `${T}T08:01:00`, ip: '192.168.1.10', description: 'Clinic administrator signed in' },
];

const PERM_CATS = ['Dashboard', 'Patients', 'Appointments', 'Medical Records', 'Sessions', 'Treatment Plans', 'Therapists', 'Billing', 'Payments', 'Inventory', 'Reports', 'Settings'] as const;
const PERM_TYPES = ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Export'] as const;

function fullPerms() {
  return Object.fromEntries(PERM_CATS.map((c) => [c, [...PERM_TYPES]])) as ClinicRole['permissions'];
}

function viewOnly() {
  return Object.fromEntries(PERM_CATS.map((c) => [c, ['View']])) as ClinicRole['permissions'];
}

export const ROLES: ClinicRole[] = [
  { id: 'ROLE-001', name: 'Super Admin', description: 'Full clinic system access', permissions: fullPerms(), usersCount: 1 },
  { id: 'ROLE-002', name: 'Clinic Admin', description: 'Manage operations, staff and billing', permissions: fullPerms(), usersCount: 2 },
  {
    id: 'ROLE-003',
    name: 'Receptionist',
    description: 'Front desk appointments and patient intake',
    permissions: {
      Dashboard: ['View'],
      Patients: ['View', 'Create', 'Edit'],
      Appointments: ['View', 'Create', 'Edit'],
      'Medical Records': ['View'],
      Sessions: ['View'],
      'Treatment Plans': ['View'],
      Therapists: ['View'],
      Billing: ['View', 'Create'],
      Payments: ['View', 'Create'],
      Inventory: ['View'],
      Reports: ['View', 'Export'],
      Settings: ['View'],
    },
    usersCount: 3,
  },
  {
    id: 'ROLE-004',
    name: 'Therapist',
    description: 'Clinical sessions and documentation',
    permissions: {
      Dashboard: ['View'],
      Patients: ['View', 'Edit'],
      Appointments: ['View', 'Edit'],
      'Medical Records': ['View', 'Create', 'Edit'],
      Sessions: ['View', 'Create', 'Edit'],
      'Treatment Plans': ['View', 'Create', 'Edit'],
      Therapists: ['View'],
      Billing: ['View'],
      Payments: ['View'],
      Inventory: ['View'],
      Reports: ['View'],
      Settings: [],
    },
    usersCount: 8,
  },
  { id: 'ROLE-005', name: 'Doctor', description: 'Consultations and prescriptions', permissions: fullPerms(), usersCount: 1 },
  {
    id: 'ROLE-006',
    name: 'Nurse',
    description: 'Vitals and patient support',
    permissions: {
      Dashboard: ['View'],
      Patients: ['View', 'Edit'],
      Appointments: ['View'],
      'Medical Records': ['View', 'Create', 'Edit'],
      Sessions: ['View'],
      'Treatment Plans': ['View'],
      Therapists: ['View'],
      Billing: ['View'],
      Payments: ['View'],
      Inventory: ['View', 'Edit'],
      Reports: ['View'],
      Settings: [],
    },
    usersCount: 2,
  },
  {
    id: 'ROLE-007',
    name: 'Accountant',
    description: 'Invoices, payments and expenses',
    permissions: {
      Dashboard: ['View'],
      Patients: ['View'],
      Appointments: ['View'],
      'Medical Records': [],
      Sessions: ['View'],
      'Treatment Plans': ['View'],
      Therapists: ['View'],
      Billing: ['View', 'Create', 'Edit', 'Approve', 'Export'],
      Payments: ['View', 'Create', 'Edit', 'Approve', 'Export'],
      Inventory: ['View'],
      Reports: ['View', 'Export'],
      Settings: ['View'],
    },
    usersCount: 1,
  },
  {
    id: 'ROLE-008',
    name: 'Inventory Manager',
    description: 'Clinic stock and equipment',
    permissions: {
      ...viewOnly(),
      Inventory: ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Export'],
      Reports: ['View', 'Export'],
    },
    usersCount: 1,
  },
];

export const ACTIVITY_FEED: ActivityFeedItem[] = [
  { id: 'ACT-001', type: 'appointment', message: 'Hina Saeed checked in for Psychology Consultation', time: '09:32' },
  { id: 'ACT-002', type: 'session', message: 'Sports Injury Rehab started with Dr. Bilal Ahmed', time: '10:02' },
  { id: 'ACT-003', type: 'payment', message: 'Payment of PKR 4,200 received from Sana Qureshi', time: '09:40' },
  { id: 'ACT-004', type: 'patient', message: 'New patient Komal Zafar registered', time: 'Yesterday' },
  { id: 'ACT-005', type: 'followup', message: 'Overdue follow-up for Zain Malik', time: '08:45' },
  { id: 'ACT-006', type: 'inventory', message: 'Low stock: Disposable Couch Covers', time: 'Yesterday' },
];

export const DASHBOARD_CHARTS = {
  appointmentsTrend: [
    { label: 'Mon', scheduled: 18, completed: 15, cancelled: 2 },
    { label: 'Tue', scheduled: 22, completed: 19, cancelled: 1 },
    { label: 'Wed', scheduled: 20, completed: 17, cancelled: 3 },
    { label: 'Thu', scheduled: 25, completed: 21, cancelled: 2 },
    { label: 'Fri', scheduled: 24, completed: 20, cancelled: 2 },
    { label: 'Sat', scheduled: 14, completed: 12, cancelled: 1 },
    { label: 'Sun', scheduled: 6, completed: 5, cancelled: 0 },
  ],
  revenueTrend: [
    { month: 'Jun', revenue: 420000, expenses: 210000 },
    { month: 'Jul', revenue: 465000, expenses: 230000 },
    { month: 'Aug', revenue: 510000, expenses: 245000 },
    { month: 'Sep', revenue: 488000, expenses: 250000 },
    { month: 'Oct', revenue: 545000, expenses: 260000 },
    { month: 'Nov', revenue: 392000, expenses: 198000 },
  ],
  patientGrowth: [
    { month: 'Jun', newPatients: 28, returning: 64 },
    { month: 'Jul', newPatients: 32, returning: 70 },
    { month: 'Aug', newPatients: 35, returning: 78 },
    { month: 'Sep', newPatients: 30, returning: 82 },
    { month: 'Oct', newPatients: 38, returning: 88 },
    { month: 'Nov', newPatients: 22, returning: 61 },
  ],
  therapistPerformance: THERAPISTS.filter((t) => t.status === 'Active').map((t) => ({
    name: t.name.split(' ').slice(-1)[0],
    sessions: 20 + Math.round(t.utilization / 4),
    revenue: Math.round(t.sessionFee * (20 + t.utilization / 4)),
    utilization: t.utilization,
  })),
};
