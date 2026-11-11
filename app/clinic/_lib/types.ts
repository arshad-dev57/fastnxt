export type PatientStatus = 'Active' | 'Inactive' | 'Discharged' | 'On Hold';
export type AppointmentStatus =
  | 'Scheduled'
  | 'Confirmed'
  | 'Checked In'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'
  | 'No Show'
  | 'Rescheduled';
export type SessionStatus = 'Scheduled' | 'In Progress' | 'Paused' | 'Completed' | 'Cancelled';
export type TreatmentPlanStatus = 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Cancelled';
export type InvoiceStatus = 'Draft' | 'Unpaid' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled';
export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Card' | 'Online Payment' | 'Other';
export type PaymentStatus = 'Completed' | 'Pending' | 'Refunded' | 'Failed';
export type FollowUpStatus = 'Upcoming' | 'Overdue' | 'Completed' | 'Missed' | 'Cancelled';
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type WaitingStatus = 'Waiting' | 'Contacted' | 'Booked' | 'Expired' | 'Cancelled';
export type RoomStatus = 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';
export type StaffStatus = 'Active' | 'On Leave' | 'Inactive';
export type InventoryStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expired';
export type PackageStatus = 'Active' | 'Inactive' | 'Expired';
export type PrescriptionStatus = 'Active' | 'Completed' | 'Cancelled';
export type ExpenseStatus = 'Pending' | 'Approved' | 'Paid' | 'Rejected';

export interface ClinicPatient {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  age: number;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  emergencyContact: string;
  emergencyPhone: string;
  cnic?: string;
  bloodGroup?: string;
  referralSource: string;
  registrationDate: string;
  assignedTherapistId?: string;
  lastVisit?: string;
  nextAppointment?: string;
  status: PatientStatus;
  notes?: string;
  allergies?: string[];
  conditions?: string[];
  avatarColor: string;
}

export interface ClinicTherapist {
  id: string;
  name: string;
  qualification: string;
  specialization: string;
  experienceYears: number;
  phone: string;
  email: string;
  employmentType: 'Full-time' | 'Part-time' | 'Consultant';
  joiningDate: string;
  branch: string;
  consultationFee: number;
  sessionFee: number;
  commissionPercent: number;
  status: StaffStatus;
  avatarColor: string;
  todayAppointments: number;
  utilization: number;
}

export interface ClinicService {
  id: string;
  name: string;
  category: string;
  description: string;
  durationMinutes: number;
  price: number;
  therapistIds: string[];
  requiredRoomType?: string;
  requiredEquipment?: string[];
  taxPercent: number;
  status: 'Active' | 'Inactive';
}

export interface ClinicRoom {
  id: string;
  name: string;
  type: string;
  capacity: number;
  equipment: string[];
  branch: string;
  status: RoomStatus;
  maintenanceNote?: string;
}

export interface ClinicAppointment {
  id: string;
  patientId: string;
  therapistId: string;
  serviceId: string;
  roomId?: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  type: 'Consultation' | 'Therapy' | 'Follow-up' | 'Assessment' | 'Walk-in';
  status: AppointmentStatus;
  notes?: string;
  recurring?: boolean;
}

export interface WaitingListItem {
  id: string;
  patientId: string;
  serviceId: string;
  preferredTherapistId?: string;
  preferredDate: string;
  preferredTime: string;
  priority: Priority;
  requestedAt: string;
  contactPhone: string;
  status: WaitingStatus;
  notes?: string;
}

export interface TherapySession {
  id: string;
  patientId: string;
  therapistId: string;
  appointmentId?: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: SessionStatus;
  condition?: string;
  assessment?: string;
  symptoms?: string;
  treatmentPerformed?: string;
  activities?: string;
  progressNotes?: string;
  patientResponse?: string;
  recommendations?: string;
  nextSessionPlan?: string;
  remarks?: string;
  patientFeedback?: number;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  therapistId: string;
  diagnosis: string;
  objectives: string[];
  recommendedTherapyIds: string[];
  totalSessions: number;
  completedSessions: number;
  startDate: string;
  expectedEndDate: string;
  progressPercent: number;
  status: TreatmentPlanStatus;
  notes?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  clinicianId: string;
  date: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  status: PrescriptionStatus;
}

export interface FollowUp {
  id: string;
  patientId: string;
  assignedStaffId: string;
  date: string;
  type: 'Upcoming' | 'Missed Appointment' | 'Post-treatment' | 'Pending' | 'Overdue';
  contactMethod: 'Phone' | 'WhatsApp' | 'SMS' | 'Email' | 'In Person';
  notes: string;
  priority: Priority;
  status: FollowUpStatus;
}

export interface ClinicInvoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  date: string;
  dueDate: string;
  items: Array<{ description: string; qty: number; unitPrice: number; amount: number }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  outstanding: number;
  status: InvoiceStatus;
  notes?: string;
}

export interface ClinicPayment {
  id: string;
  patientId: string;
  invoiceId: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  receivedBy: string;
  status: PaymentStatus;
}

export interface TherapyPackage {
  id: string;
  name: string;
  description: string;
  serviceIds: string[];
  sessions: number;
  price: number;
  validityDays: number;
  discountPercent: number;
  status: PackageStatus;
}

export interface PatientPackage {
  id: string;
  patientId: string;
  packageId: string;
  purchasedSessions: number;
  usedSessions: number;
  purchaseDate: string;
  expiryDate: string;
  status: 'Active' | 'Expired' | 'Exhausted' | 'Renewed';
}

export interface ClinicExpense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  status: ExpenseStatus;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  expiryDate?: string;
  supplier: string;
  status: InventoryStatus;
  assignedRoomId?: string;
}

export interface ClinicStaff {
  id: string;
  name: string;
  role:
    | 'Clinic Administrator'
    | 'Receptionist'
    | 'Therapist'
    | 'Nurse'
    | 'Assistant'
    | 'Billing Staff';
  phone: string;
  email: string;
  branch: string;
  status: StaffStatus;
  joiningDate: string;
  shift: string;
  avatarColor: string;
}

export interface TherapistSchedule {
  id: string;
  therapistId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  isOff: boolean;
  maxSessions: number;
  roomId?: string;
}

export interface ClinicNotification {
  id: string;
  category: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  priority: Priority;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  module: string;
  recordRef: string;
  datetime: string;
  ip: string;
  description: string;
}

export interface ClinicRole {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, Array<'View' | 'Create' | 'Edit' | 'Delete' | 'Approve' | 'Export'>>;
  usersCount: number;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  type: 'History' | 'Diagnosis' | 'Vital Signs' | 'Lab Report' | 'Assessment' | 'Document';
  title: string;
  date: string;
  recordedBy: string;
  summary: string;
  details?: string;
}

export interface ClinicSettings {
  clinicName: string;
  tagline: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  currency: string;
  taxPercent: number;
  workingHoursStart: string;
  workingHoursEnd: string;
  appointmentSlotMinutes: number;
  patientIdPrefix: string;
  appointmentIdPrefix: string;
  logoText: string;
}

export interface ActivityFeedItem {
  id: string;
  type: string;
  message: string;
  time: string;
}
