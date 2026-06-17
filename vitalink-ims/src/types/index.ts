// ============= RBAC & Users =============
export type Role =
  | "ROLE_SUPER_ADMIN"
  | "ROLE_INSURANCE_AGENT"
  | "ROLE_SUPERVISOR"
  | "ROLE_DIRECTOR"
  | "ROLE_AUDITOR";

export interface Permission {
  id: string;
  label: string;
  description: string;
  module: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatar?: string;
  department: string;
  active: boolean;
  lastLogin: string;
  permissions: string[];
  createdAt: string;
}

// ============= Assurés =============
export type Gender = "M" | "F";
export type MaritalStatus = "single" | "married" | "divorced" | "widowed";

export interface Insured {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  address: string;
  city: string;
  postalCode: string;
  socialSecurityNumber: string;
  contractId: string;
  joinDate: string;
  status: "active" | "suspended" | "terminated" | "pending";
  dependents: number;
  totalReimbursements: number;
  lastClaimDate?: string;
  riskScore: number; // 0-100
  notes?: string;
}

// ============= Contrats =============
export type ContractType = "individual" | "family" | "group" | "enterprise";
export type ContractStatus = "active" | "suspended" | "terminated" | "expired" | "pending";

export interface Contract {
  id: string;
  reference: string;
  type: ContractType;
  insuredId: string;
  productName: string;
  startDate: string;
  endDate: string;
  monthlyPremium: number;
  annualPremium: number;
  coverageAmount: number;
  remainingCoverage: number;
  status: ContractStatus;
  paymentFrequency: "monthly" | "quarterly" | "annual";
  guarantees: string[]; // guarantee IDs
  deductible: number;
  commission: number;
  agentId: string;
  notes?: string;
}

// ============= Garanties =============
export type CoverageType =
  | "hospitalization"
  | "consultation"
  | "pharmacy"
  | "dental"
  | "optical"
  | "maternity"
  | "laboratory"
  | "imaging";

export interface Guarantee {
  id: string;
  code: string;
  name: string;
  description: string;
  type: CoverageType;
  ceiling: number;
  usedAmount: number;
  copayPercent: number;
  waitingDays: number;
  exclusions: string[];
  included: boolean;
  icon: string;
}

// ============= Hôpitaux =============
export type HospitalTier = 1 | 2 | 3;
export type ConventionStatus = "active" | "pending" | "terminated";

export interface Hospital {
  id: string;
  name: string;
  code: string;
  type: "public" | "private" | "clinic" | "university";
  tier: HospitalTier;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  director: string;
  bedCapacity: number;
  specialties: string[];
  conventionId: string;
  conventionStatus: ConventionStatus;
  pricingDiscount: number; // % discount
  rating: number; // 0-5
  totalClaims: number;
  averageProcessingDays: number;
  joinDate: string;
  active: boolean;
}

export interface Convention {
  id: string;
  reference: string;
  hospitalId: string;
  startDate: string;
  endDate: string;
  discountRate: number;
  paymentTerms: string;
  status: ConventionStatus;
  documentsCount: number;
}

// ============= Remboursements =============
export type ClaimStatus =
  | "received"
  | "under_review"
  | "approved"
  | "rejected"
  | "disputed"
  | "paid";

export type ClaimPriority = "low" | "normal" | "high" | "urgent";

export interface ReimbursementClaim {
  id: string;
  reference: string;
  insuredId: string;
  contractId: string;
  hospitalId: string;
  submissionDate: string;
  treatmentDate: string;
  medicalAct: string;
  medicalActCode: string;
  description: string;
  claimedAmount: number;
  approvedAmount: number;
  copayAmount: number;
  status: ClaimStatus;
  priority: ClaimPriority;
  assignedTo?: string;
  documents: string[];
  diagnosis?: string;
  rejectionReason?: string;
  disputeReason?: string;
  processingDays: number;
  slaDeadline: string;
  history: ClaimHistoryEntry[];
}

export interface ClaimHistoryEntry {
  date: string;
  actor: string;
  action: string;
  comment?: string;
}

// ============= Dashboard / Reports =============
export interface DashboardKPI {
  label: string;
  value: number;
  format: "number" | "currency" | "percent";
  change: number; // % change
  trend: "up" | "down" | "stable";
  icon: string;
  color: "brand" | "emerald" | "amber" | "rose" | "violet" | "cyan";
}

export interface ChartDataPoint {
  date: string;
  value: number;
  category?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  module: string;
  target?: string;
  severity: "info" | "warning" | "success" | "error";
}

// ============= Notifications & Settings =============
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  timestamp: string;
  module?: string;
}

export interface AppSettings {
  reimbursementDelayDays: number;
  autoApprovalThreshold: number;
  copayDefault: number;
  slaUrgentHours: number;
  slaNormalHours: number;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  security: {
    sessionTimeout: number;
    mfaRequired: boolean;
    passwordRotationDays: number;
  };
}