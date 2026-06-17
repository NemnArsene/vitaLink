// ============================================================================
// HMS Platform - Core TypeScript Domain Models
// Architecture: Feature-Sliced Design + DDD
// ============================================================================

// ----- Common -----
export type ID = string;
export type ISODate = string;

export interface Timestamps {
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

// ----- RBAC -----
export type Role =
  | "ROLE_ADMIN_HOSPITAL"
  | "ROLE_DOCTOR"
  | "ROLE_NURSE"
  | "ROLE_BILLING"
  | "ROLE_DIRECTOR";

export type Permission =
  | "patient.read"
  | "patient.write"
  | "patient.delete"
  | "consultation.read"
  | "consultation.write"
  | "billing.read"
  | "billing.write"
  | "billing.refund"
  | "user.manage"
  | "settings.manage"
  | "report.view";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ROLE_ADMIN_HOSPITAL: [
    "patient.read", "patient.write", "patient.delete",
    "consultation.read", "consultation.write",
    "billing.read", "billing.write", "billing.refund",
    "user.manage", "settings.manage", "report.view",
  ],
  ROLE_DOCTOR: [
    "patient.read", "patient.write",
    "consultation.read", "consultation.write",
    "billing.read", "report.view",
  ],
  ROLE_NURSE: [
    "patient.read", "patient.write",
    "consultation.read",
  ],
  ROLE_BILLING: [
    "patient.read",
    "billing.read", "billing.write", "billing.refund",
  ],
  ROLE_DIRECTOR: [
    "patient.read", "consultation.read", "billing.read", "report.view",
  ],
};

// ----- Hospital -----
export interface Hospital extends Timestamps {
  id: ID;
  name: string;
  code: string;
  city: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  totalBeds: number;
  availableBeds: number;
}

// ----- Patient -----
export type Gender = "M" | "F";
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export interface Patient extends Timestamps {
  id: ID;
  fileNumber: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  birthDate: ISODate;
  bloodGroup: BloodGroup;
  phone: string;
  email: string;
  address: string;
  city: string;
  insuranceId?: ID;
  insuranceNumber?: string;
  insuranceCompany?: string;
  emergencyContact: string;
  emergencyPhone: string;
  status: "ACTIVE" | "INACTIVE" | "DECEASED";
  photoUrl?: string;
}

export type AllergySeverity = "MILD" | "MODERATE" | "SEVERE";
export interface Allergy {
  id: ID;
  patientId: ID;
  substance: string;
  severity: AllergySeverity;
  reaction: string;
  notedAt: ISODate;
}

export interface MedicalCondition {
  id: ID;
  patientId: ID;
  name: string;
  diagnosedAt: ISODate;
  status: "ACTIVE" | "RESOLVED" | "CHRONIC";
  notes: string;
}

// ----- Medical Record -----
export interface MedicalRecord extends Timestamps {
  id: ID;
  patientId: ID;
  allergies: Allergy[];
  conditions: MedicalCondition[];
  notes: string;
}

// ----- Consultations & Acts -----
export type ConsultationStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type ConsultationType = "GENERAL" | "SPECIALIST" | "EMERGENCY" | "FOLLOW_UP";

export interface Consultation extends Timestamps {
  id: ID;
  patientId: ID;
  doctorId: ID;
  doctorName: string;
  type: ConsultationType;
  status: ConsultationStatus;
  scheduledAt: ISODate;
  startedAt?: ISODate;
  endedAt?: ISODate;
  reason: string;
  diagnosis: string;
  prescription?: string;
  notes?: string;
  vitalSigns?: {
    temperature: number;
    bloodPressure: string;
    heartRate: number;
    respiratoryRate: number;
    oxygenSaturation: number;
  };
}

export type ActType = "CARE" | "EXAM" | "IMAGING" | "LAB";
export interface MedicalAct extends Timestamps {
  id: ID;
  consultationId?: ID;
  patientId: ID;
  type: ActType;
  code: string;
  label: string;
  description: string;
  performedBy: string;
  performedAt: ISODate;
  cost: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
}

// ----- Billing -----
export type InvoiceStatus = "DRAFT" | "ISSUED" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";

export interface InvoiceLine {
  id: ID;
  actId?: ID;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice extends Timestamps {
  id: ID;
  number: string;
  patientId: ID;
  patientName: string;
  consultationId?: ID;
  lines: InvoiceLine[];
  subtotal: number;
  insuranceCover: number;
  patientShare: number;
  total: number;
  status: InvoiceStatus;
  issuedAt: ISODate;
  dueDate: ISODate;
  paidAt?: ISODate;
  insuranceCompany?: string;
  insuranceNumber?: string;
}

// ----- Reimbursement -----
export type RefundStatus = "DRAFT" | "SUBMITTED" | "PROCESSING" | "APPROVED" | "REJECTED" | "DISPUTED" | "PAID";

export interface Refund extends Timestamps {
  id: ID;
  invoiceId: ID;
  invoiceNumber: string;
  patientId: ID;
  patientName: string;
  insuranceCompany: string;
  amount: number;
  status: RefundStatus;
  submittedAt: ISODate;
  processedAt?: ISODate;
  paidAt?: ISODate;
  reference: string;
  disputeReason?: string;
  rejectionReason?: string;
}

// ----- Users -----
export interface Doctor extends User {
  specialty: string;
  licenseNumber: string;
}

export interface User extends Timestamps {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  service: string;
  phone: string;
  active: boolean;
  lastLogin?: ISODate;
}

// ----- Insurance (read-only mock from API Gateway) -----
export interface InsuranceCompany {
  id: ID;
  name: string;
  code: string;
  apiEndpoint: string;
  status: "ACTIVE" | "INACTIVE";
  contactEmail: string;
  contactPhone: string;
}

export interface InsuranceContract {
  id: ID;
  companyId: ID;
  companyName: string;
  contractNumber: string;
  startDate: ISODate;
  endDate: ISODate;
  coverageRate: number;
  status: "ACTIVE" | "EXPIRED" | "PENDING";
}

// ----- Dashboard -----
export interface DashboardKPI {
  totalPatients: number;
  todayAdmissions: number;
  pendingInvoices: number;
  pendingRefunds: number;
  monthlyRevenue: number;
  bedOccupancyRate: number;
  trends: {
    patients: number;
    admissions: number;
    invoices: number;
    refunds: number;
    revenue: number;
    occupancy: number;
  };
}

export interface MonthlyRevenuePoint {
  month: string;
  revenue: number;
  refunds: number;
  net: number;
}

export interface ServiceOccupancy {
  service: string;
  occupied: number;
  total: number;
  rate: number;
}

// ----- Settings -----
export interface MedicalService {
  id: ID;
  code: string;
  name: string;
  description: string;
  head: string;
  capacity: number;
  active: boolean;
}

export interface ActCatalogItem {
  id: ID;
  code: string;
  type: ActType;
  label: string;
  basePrice: number;
  active: boolean;
}