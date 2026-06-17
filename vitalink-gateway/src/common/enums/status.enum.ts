// ============================================================================
// Status enums — Mirrors PostgreSQL enums from hospital & insurance schemas
// ============================================================================

export enum ClaimStatus {
  PENDING = 'EN_ATTENTE',
  APPROVED = 'APPROUVEE',
  REJECTED = 'REJETEE',
  PARTIALLY_REIMBURSED = 'REMBOURSEE_PARTIELLEMENT',
  DISPUTED = 'LITIGE',
}

export enum DisputeStatus {
  OPEN = 'OUVERT',
  UNDER_REVIEW = 'EN_COURS_EXAMEN',
  RESOLVED = 'RESOLU',
  ABANDONED = 'ABANDONNE',
}

export enum PolicyStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDUE',
  CANCELLED = 'RESILIEE',
  EXPIRED = 'EXPIREE',
}

export enum InvoiceStatus {
  DRAFT = 'BROUILLON',
  ISSUED = 'EMISE',
  SUBMITTED = 'SOUMISE',
  PENDING = 'EN_ATTENTE',
  APPROVED = 'APPROUVEE',
  REJECTED = 'REJETEE',
  DISPUTED = 'LITIGE',
  PAID = 'PAYEE',
}

export enum GuaranteeType {
  CONSULTATION = 'CONSULTATION',
  HOSPITALIZATION = 'HOSPITALISATION',
  PHARMACY = 'PHARMACIE',
  LABORATORY = 'LABORATOIRE',
  IMAGING = 'IMAGERIE',
  SURGERY = 'CHIRURGIE',
  MATERNITY = 'MATERNITE',
  DENTAL = 'DENTAIRE',
  OPTIC = 'OPTIQUE',
}

export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

export enum UrgencyLevel {
  P1_EMERGENCY = 'P1_URGENCE',
  P2_VERY_URGENT = 'P2_TRES_URGENT',
  P3_URGENT = 'P3_URGENT',
  P4_SEMI_URGENT = 'P4_SEMI_URGENT',
  P5_NON_URGENT = 'P5_NON_URGENT',
}

export enum Sex {
  MALE = 'M',
  FEMALE = 'F',
  OTHER = 'AUTRE',
}
