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
  | "ROLE_RECEPTIONIST"
  | "ROLE_TRIAGE"
  | "ROLE_DOCTOR"
  | "ROLE_LABORATORY"
  | "ROLE_NURSE"
  | "ROLE_BILLING"
  | "ROLE_CASHIER"
  | "ROLE_PHARMACIST"
  | "ROLE_DIRECTOR";

export type Permission =
  | "patient.read"
  | "patient.write"
  | "patient.delete"
  | "consultation.read"
  | "consultation.write"
  | "triage.read"
  | "billing.read"
  | "billing.write"
  | "billing.refund"
  | "insurance.verify"
  | "triage.write"
  | "laboratory.read"
  | "laboratory.write"
  | "nursing.read"
  | "care.write"
  | "payment.write"
  | "pharmacy.read"
  | "pharmacy.write"
  | "hospitalization.write"
  | "user.manage"
  | "settings.manage"
  | "report.view"
  | "audit.read.extended"
  | "director.assurances";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ROLE_ADMIN_HOSPITAL: [
    "patient.read", "patient.write", "patient.delete",
    "consultation.read", "consultation.write",
    "triage.read", "triage.write", "laboratory.read", "laboratory.write", "nursing.read", "care.write",
    "billing.read", "billing.write", "billing.refund", "insurance.verify",
    "payment.write", "pharmacy.read", "pharmacy.write", "hospitalization.write",
    "user.manage", "settings.manage", "report.view", "audit.read.extended",
  ],
  ROLE_RECEPTIONIST: [
    "patient.read", "patient.write", "insurance.verify", "payment.write",
  ],
  ROLE_TRIAGE: [
    "patient.read", "patient.write", "consultation.read", "triage.read", "triage.write",
  ],
  ROLE_DOCTOR: [
    "patient.read", "patient.write",
    "consultation.read", "consultation.write",
    "laboratory.read", "laboratory.write", "care.write", "hospitalization.write",
    "billing.read", "report.view",
  ],
  ROLE_LABORATORY: [
    "patient.read", "consultation.read", "laboratory.read", "laboratory.write",
  ],
  ROLE_NURSE: [
    "patient.read", "consultation.read", "nursing.read", "care.write", "hospitalization.write",
  ],
  ROLE_BILLING: [
    "patient.read",
    "billing.read", "billing.write", "billing.refund",
    "payment.write",
  ],
  ROLE_CASHIER: [
    "patient.read", "insurance.verify", "payment.write",
  ],
  ROLE_PHARMACIST: [
    "patient.read", "consultation.read", "pharmacy.write", "payment.write",
  ],
  ROLE_DIRECTOR: [
    "patient.read", "consultation.read", "billing.read", "report.view", "audit.read.extended", "director.assurances",
    "user.manage", "settings.manage", "laboratory.read", "laboratory.write",
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

export interface PatientAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface PatientEmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

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
  insuranceStatus?: "ASSURE" | "NON_ASSURE" | "EN_ATTENTE";
  insuranceCoveragePercentage?: number;
  emergencyContact: string;
  emergencyPhone: string;
  status: "ACTIVE" | "INACTIVE" | "DECEASED";
  photoUrl?: string;
  allergies?: string[];
  antecedents?: string[];
}

// Raw MongoDB document shape
export interface PatientRaw {
  _id: { $oid: string };
  firstName: string;
  lastName: string;
  medicalRecordNumber: string;
  dateOfBirth: { $date: string };
  gender: "M" | "F";
  phone: string;
  email: string;
  address: PatientAddress;
  emergencyContact: PatientEmergencyContact;
  bloodType: string;
  allergies?: string[];
  antecedents?: string[];
  insuranceCardNumber?: string;
  insuranceProvider?: string;
  status: string;
  createdAt: { $date: string };
  updatedAt: { $date: string };
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
export type UrgencyLevel = "P1_URGENCE" | "P2_TRES_URGENT" | "P3_URGENT" | "P4_SEMI_URGENT" | "P5_NON_URGENT";
export type InsuranceStatus = "COVERED" | "NOT_COVERED" | "VERIFYING";
export type PaymentStatus = "PENDING_PAYMENT" | "PAIEMENT_VALIDE" | "PAID" | "INSURANCE_COVERED" | "PAIEMENT_DIFFERE_URGENCE" | "CANCELLED";
export type ConsultationStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type ConsultationType = "GENERAL" | "SPECIALIST" | "EMERGENCY" | "FOLLOW_UP";

export interface VitalSigns {
  temperature: number;
  bloodPressure: string;
  heartRate: number;
  respiratoryRate: number;
  oxygenSaturation: number;
}

export interface Consultation extends Timestamps {
  id: ID;
  patientId: ID;
  doctorId: ID;
  doctorName: string;
  type: ConsultationType;
  status: ConsultationStatus;
  urgency: UrgencyLevel;
  assignedService?: string;
  triageNurseId?: ID;
  insuranceStatus: InsuranceStatus;
  paymentStatus: PaymentStatus;
  paymentAmount?: number;
  insuranceCover?: number;
  patientShare?: number;
  scheduledAt: ISODate;
  startedAt?: ISODate;
  endedAt?: ISODate;
  reason: string;
  diagnosis: string;
  icd10Codes?: string[];
  prescription?: string;
  notes?: string;
  vitalSigns?: VitalSigns;
}

export type ActType = "CARE" | "EXAM" | "IMAGING" | "LAB" | "MEDICATION";
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
  urgency?: UrgencyLevel;
  paymentStatus?: PaymentStatus;
  requestedBy?: string;
  labResults?: string;
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
  hospitalizationId?: ID;
  scope: "CONSULTATION" | "HOSPITALIZATION";
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

// ----- User & Staff -----
export interface User extends Timestamps {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  service: string;
  phone?: string;
  active: boolean;
  lastLogin?: ISODate;
}

export interface Doctor extends User {
  specialty: string;
  licenseNumber: string;
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
  rejectionReason?: string;
  disputeReason?: string;
}

// ----- Insurance -----
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
  startDate: string;
  endDate: string;
  coverageRate: number;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
}

// ----- Settings & Catalog -----
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

// ----- Pharmacy -----
export interface PharmacyItem {
  id: ID;
  code: string;
  name: string;
  dosage: string;
  form: "COMPRIME" | "GELULE" | "SIROP" | "INJECTABLE" | "POMMADE" | "SOLUTION" | "AUTRE";
  category: "ANTIBIOTIQUE" | "ANALGESIQUE" | "ANTIHYPERTENSEUR" | "ANTIDIABETIQUE" | "ANTI_INFLAMMATOIRE" | "VITAMINE" | "AUTRE";
  stock: number;
  minStock: number;
  unitPrice: number;
  supplier: string;
  expiryDate: ISODate;
  location: string;
  active: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
}

// ----- Audit Log -----
export type AuditAction =
  | "LOGIN" | "LOGOUT"
  | "CREATE" | "UPDATE" | "DELETE"
  | "APPROVE" | "REJECT" | "PAY"
  | "SUBMIT" | "DISPUTE"
  | "VIEW" | "EXPORT";

export type AuditEntity =
  | "patient" | "consultation" | "invoice" | "refund"
  | "prescription" | "laboratory" | "triage" | "hospitalization"
  | "user" | "personnel" | "tarif" | "service"
  | "act" | "report" | "message" | "settings";

export interface AuditLogEntry {
  id: ID;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  entityName?: string;
  patientId?: string;
  patientName?: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  ip?: string;
  userAgent?: string;
  status: "SUCCESS" | "FAILURE" | "ERROR";
  createdAt: ISODate;
}

// ----- Dashboard -----
export interface DashboardKPI {
  totalPatients: number;
  todayAdmissions: number;
  pendingInvoices: number;
  pendingRefunds: number;
  monthlyRevenue: number;
  bedOccupancyRate: number;
  trends: Record<string, number>;
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