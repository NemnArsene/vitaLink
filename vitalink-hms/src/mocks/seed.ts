import { faker } from "@/lib/faker";
import type {
  Patient, User, Doctor, Consultation, MedicalAct, Invoice, Refund,
  MedicalRecord, InsuranceCompany, InsuranceContract,
  MedicalService, ActCatalogItem, Hospital, Allergy, MedicalCondition,
  AuditLogEntry, PharmacyItem, DashboardKPI, ServiceOccupancy
} from "@/types";

// ============== HOSPITAL ==============
export const HOSPITAL: Hospital = {
  id: "hosp-001",
  name: "Hôpital Général de Yaoundé",
  code: "HGY-001",
  city: "Yaoundé",
  country: "Cameroun",
  address: "Rue Henri Dunant, Yaoundé",
  phone: "+237 222 23 40 00",
  email: "contact@hgy.cm",
  totalBeds: 250,
  availableBeds: 38,
  createdAt: "2020-01-01T00:00:00Z",
  updatedAt: new Date().toISOString(),
};

// ============== INSURANCE COMPANIES ==============
export const INSURANCE_COMPANIES: InsuranceCompany[] = [
  { id: "ins-1", name: "NSIA Assurances", code: "NSIA", apiEndpoint: "https://api.nsia.africa/v1", status: "ACTIVE", contactEmail: "pro@nsia.africa", contactPhone: "+237 233 43 12 12" },
  { id: "ins-2", name: "SUNU Assurances", code: "SUNU", apiEndpoint: "https://api.sunu-assurances.com/v1", status: "ACTIVE", contactEmail: "sante@sunu.com", contactPhone: "+237 233 42 85 85" },
  { id: "ins-3", name: "AXA Cameroun", code: "AXA", apiEndpoint: "https://api.axa-cameroun.com/v1", status: "ACTIVE", contactEmail: "health@axa-cameroun.com", contactPhone: "+237 233 43 90 90" },
  { id: "ins-4", name: "Allianz Cameroun", code: "ALZ", apiEndpoint: "https://api.allianz.cm/v1", status: "ACTIVE", contactEmail: "corp@allianz.cm", contactPhone: "+237 233 42 11 11" },
  { id: "ins-5", name: "CNPS", code: "CNPS", apiEndpoint: "https://api.cnps.cm/v1", status: "ACTIVE", contactEmail: "info@cnps.cm", contactPhone: "+237 222 23 50 50" },
];

export const INSURANCE_CONTRACTS: InsuranceContract[] = [
  { id: "ctr-1", companyId: "ins-1", companyName: "NSIA Assurances", contractNumber: "CTR-NSIA-2024-001", startDate: "2024-01-01", endDate: "2026-12-31", coverageRate: 80, status: "ACTIVE" },
  { id: "ctr-2", companyId: "ins-2", companyName: "SUNU Assurances", contractNumber: "CTR-SUNU-2024-002", startDate: "2024-03-01", endDate: "2026-02-28", coverageRate: 75, status: "ACTIVE" },
  { id: "ctr-3", companyId: "ins-3", companyName: "AXA Afrique", contractNumber: "CTR-AXA-2024-003", startDate: "2024-06-01", endDate: "2025-12-31", coverageRate: 85, status: "ACTIVE" },
  { id: "ctr-4", companyId: "ins-5", companyName: "CNPS", contractNumber: "CTR-CNPS-2024-004", startDate: "2024-01-01", endDate: "2027-12-31", coverageRate: 90, status: "ACTIVE" },
];

// ============== MEDICAL SERVICES ==============
export const MEDICAL_SERVICES: MedicalService[] = [
  { id: "srv-1", code: "CARDIO", name: "Cardiologie", description: "Service de cardiologie et soins du cœur", head: "Dr. Esther Mengue", capacity: 32, active: true },
  { id: "srv-2", code: "PEDIA", name: "Pédiatrie", description: "Soins médicaux pour enfants", head: "Dr. Jean-Pierre Nkolo", capacity: 45, active: true },
  { id: "srv-3", code: "URGENCE", name: "Urgences", description: "Service d'accueil des urgences", head: "Dr. Rose Eyanga", capacity: 28, active: true },
  { id: "srv-4", code: "CHIR", name: "Chirurgie Générale", description: "Bloc opératoire et chirurgie", head: "Dr. Paul Atangana", capacity: 38, active: true },
  { id: "srv-5", code: "MATERN", name: "Maternité", description: "Gynécologie-obstétrique", head: "Dr. Christine Ngo", capacity: 30, active: true },
  { id: "srv-6", code: "NEURO", name: "Neurologie", description: "Soins du système nerveux", head: "Dr. Samuel Mbarga", capacity: 22, active: true },
  { id: "srv-7", code: "ONCO", name: "Oncologie", description: "Traitement des cancers", head: "Dr. Martine Biya", capacity: 18, active: true },
];

// ============== ACTS CATALOG ==============
export const ACTS_CATALOG: ActCatalogItem[] = [
  { id: "act-1", code: "CONS-GEN", type: "CARE", label: "Consultation Généraliste", basePrice: 15000, active: true },
  { id: "act-2", code: "CONS-SPEC", type: "CARE", label: "Consultation Spécialiste", basePrice: 25000, active: true },
  { id: "act-3", code: "ECHO-ABD", type: "IMAGING", label: "Échographie Abdominale", basePrice: 35000, active: true },
  { id: "act-4", code: "RADIO-THX", type: "IMAGING", label: "Radiographie Thoracique", basePrice: 20000, active: true },
  { id: "act-5", code: "IRM-CER", type: "IMAGING", label: "IRM Cérébrale", basePrice: 120000, active: true },
  { id: "act-6", code: "SCAN-ABD", type: "IMAGING", label: "Scanner Abdominal", basePrice: 95000, active: true },
  { id: "act-7", code: "BIO-NFS", type: "LAB", label: "Numération Formule Sanguine", basePrice: 8000, active: true },
  { id: "act-8", code: "BIO-GLY", type: "LAB", label: "Glycémie", basePrice: 5000, active: true },
  { id: "act-9", code: "BIO-CREA", type: "LAB", label: "Créatininémie", basePrice: 6500, active: true },
  { id: "act-10", code: "SOIN-PANS", type: "CARE", label: "Pansement Simple", basePrice: 5000, active: true },
  { id: "act-11", code: "SOIN-INJ", type: "CARE", label: "Injection", basePrice: 3000, active: true },
  { id: "act-12", code: "SOIN-PERF", type: "CARE", label: "Perfusion", basePrice: 8000, active: true },
];

// ============== DOCTORS ==============
export const DOCTORS: Doctor[] = Array.from({ length: 12 }, (_, i) => ({
  id: `doc-${i + 1}`,
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
  role: "ROLE_DOCTOR" as const,
  service: faker.helpers.arrayElement(MEDICAL_SERVICES).name,
  phone: faker.phone.number(),
  active: true,
  specialty: faker.helpers.arrayElement(["Cardiologie", "Pédiatrie", "Neurologie", "Chirurgie", "Gynécologie", "Médecine interne"]),
  licenseNumber: `MED-${faker.string.numeric(6)}`,
  createdAt: faker.date.past({ years: 3 }).toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  lastLogin: faker.date.recent({ days: 7 }).toISOString(),
}));

// ============== USERS ==============
export const USERS: User[] = [
  ...DOCTORS,
  // Nurses
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `nurse-${i + 1}`,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    role: "ROLE_NURSE" as const,
    service: faker.helpers.arrayElement(MEDICAL_SERVICES).name,
    phone: faker.phone.number(),
    active: true,
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    lastLogin: faker.date.recent({ days: 3 }).toISOString(),
  })),
  // Billing
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `bill-${i + 1}`,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    role: "ROLE_BILLING" as const,
    service: "Facturation",
    phone: faker.phone.number(),
    active: true,
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    lastLogin: faker.date.recent({ days: 2 }).toISOString(),
  })),
  // Receptionists
  ...Array.from({ length: 2 }, (_, i) => ({
    id: `recp-${i + 1}`,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    role: "ROLE_RECEPTIONIST" as const,
    service: "Accueil",
    phone: faker.phone.number(),
    active: true,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    lastLogin: faker.date.recent({ days: 1 }).toISOString(),
  })),
  // Triage
  ...Array.from({ length: 2 }, (_, i) => ({
    id: `trg-${i + 1}`,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    role: "ROLE_TRIAGE" as const,
    service: "Urgences",
    phone: faker.phone.number(),
    active: true,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    lastLogin: faker.date.recent({ days: 1 }).toISOString(),
  })),
  // Lab
  ...Array.from({ length: 2 }, (_, i) => ({
    id: `lab-${i + 1}`,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    role: "ROLE_LABORATORY" as const,
    service: "Laboratoire",
    phone: faker.phone.number(),
    active: true,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    lastLogin: faker.date.recent({ days: 1 }).toISOString(),
  })),
  // Cashiers
  ...Array.from({ length: 2 }, (_, i) => ({
    id: `csh-${i + 1}`,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    role: "ROLE_CASHIER" as const,
    service: "Caisse",
    phone: faker.phone.number(),
    active: true,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    lastLogin: faker.date.recent({ days: 1 }).toISOString(),
  })),
  // Admin
  {
    id: "admin-1",
    firstName: "Esther",
    lastName: "Mengue",
    email: "admin@hgy.cm",
    role: "ROLE_ADMIN_HOSPITAL" as const,
    service: "Administration",
    phone: "+237 677 123 456",
    active: true,
    createdAt: "2020-01-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  },
  // Director
  {
    id: "dir-1",
    firstName: "Jean-Pierre",
    lastName: "Nkolo",
    email: "directeur@hgy.cm",
    role: "ROLE_DIRECTOR" as const,
    service: "Direction",
    phone: "+237 677 234 567",
    active: true,
    createdAt: "2019-01-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  },
];

// ============== PATIENTS ==============
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
const cities = ["Yaoundé", "Douala", "Bafoussam", "Garoua", "Maroua", "Bamenda", "Limbe", "Kribi"];

export const PATIENTS: Patient[] = Array.from({ length: 85 }, (_, i) => {
  const gender = faker.helpers.arrayElement(["M", "F"]) as "M" | "F";
  const firstName = gender === "M" ? faker.person.firstName("male") : faker.person.firstName("female");
  const lastName = faker.person.lastName();
  const ins = faker.helpers.maybe(() => faker.helpers.arrayElement(INSURANCE_COMPANIES), { probability: 0.7 });
  return {
    id: `pat-${i + 1}`,
    fileNumber: `P-${String(20240000 + i).padStart(8, "0")}`,
    firstName,
    lastName,
    gender,
    birthDate: faker.date.between({ from: "1940-01-01", to: "2024-01-01" }).toISOString(),
    bloodGroup: faker.helpers.arrayElement(bloodGroups),
    phone: faker.phone.number(),
    email: faker.internet.email({ firstName, lastName }),
    address: faker.location.streetAddress(),
    city: faker.helpers.arrayElement(cities),
    insuranceId: ins?.id,
    insuranceCompany: ins?.name,
    insuranceNumber: ins ? `INS-${faker.string.numeric(8)}` : undefined,
    emergencyContact: `${faker.person.firstName()} ${faker.person.lastName()}`,
    emergencyPhone: faker.phone.number(),
    status: "ACTIVE",
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  };
});

// ============== MEDICAL RECORDS ==============
export const MEDICAL_RECORDS: MedicalRecord[] = PATIENTS.slice(0, 60).map((p, idx) => {
  const allergiesCount = faker.number.int({ min: 0, max: 3 });
  const conditionsCount = faker.number.int({ min: 0, max: 4 });
  const allergies: Allergy[] = Array.from({ length: allergiesCount }, (_, i) => ({
    id: `all-${idx}-${i}`,
    patientId: p.id,
    substance: faker.helpers.arrayElement(["Pénicilline", "Arachides", "Fruits de mer", "Latex", "Aspirine", "Pollen", "Iode"]),
    severity: faker.helpers.arrayElement(["MILD", "MODERATE", "SEVERE"]) as "MILD" | "MODERATE" | "SEVERE",
    reaction: faker.helpers.arrayElement(["Éruption cutanée", "Difficultés respiratoires", "Nausées", "Choc anaphylactique"]),
    notedAt: faker.date.past({ years: 1 }).toISOString(),
  }));
  const conditions: MedicalCondition[] = Array.from({ length: conditionsCount }, (_, i) => ({
    id: `cond-${idx}-${i}`,
    patientId: p.id,
    name: faker.helpers.arrayElement(["Hypertension", "Diabète Type 2", "Asthme", "Migraine chronique", "Hypercholestérolémie", "Anémie"]),
    diagnosedAt: faker.date.past({ years: 3 }).toISOString(),
    status: faker.helpers.arrayElement(["ACTIVE", "CHRONIC", "RESOLVED"]) as "ACTIVE" | "CHRONIC" | "RESOLVED",
    notes: faker.lorem.sentence(),
  }));
  return {
    id: `rec-${p.id}`,
    patientId: p.id,
    allergies,
    conditions,
    notes: faker.lorem.paragraph(),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
});

// ============== CONSULTATIONS ==============
export const CONSULTATIONS: Consultation[] = Array.from({ length: 120 }, (_, i) => {
  const patient = faker.helpers.arrayElement(PATIENTS);
  const doctor = faker.helpers.arrayElement(DOCTORS);
  const scheduledAt = faker.date.between({ from: "2025-12-01", to: "2026-02-28" }).toISOString();
  const status = faker.helpers.weightedArrayElement([
    { weight: 4, value: "COMPLETED" },
    { weight: 2, value: "SCHEDULED" },
    { weight: 1, value: "IN_PROGRESS" },
    { weight: 1, value: "CANCELLED" },
  ]) as "COMPLETED" | "SCHEDULED" | "IN_PROGRESS" | "CANCELLED";
  return {
    id: `cons-${i + 1}`,
    patientId: patient.id,
    doctorId: doctor.id,
    doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
    type: faker.helpers.arrayElement(["GENERAL", "SPECIALIST", "EMERGENCY", "FOLLOW_UP"]) as "GENERAL" | "SPECIALIST" | "EMERGENCY" | "FOLLOW_UP",
    status,
    insuranceStatus: patient.insuranceCompany ? "COVERED" : "NOT_COVERED",
    paymentStatus: status === "COMPLETED" ? "PAID" : "PENDING_PAYMENT",
    urgency: faker.helpers.arrayElement(["P1_URGENCE", "P2_TRES_URGENT", "P3_URGENT", "P4_SEMI_URGENT", "P5_NON_URGENT"]),
    scheduledAt,
    startedAt: status === "COMPLETED" || status === "IN_PROGRESS" ? scheduledAt : undefined,
    endedAt: status === "COMPLETED" ? new Date(new Date(scheduledAt).getTime() + 30 * 60000).toISOString() : undefined,
    reason: faker.helpers.arrayElement(["Fièvre persistante", "Douleurs abdominales", "Contrôle de routine", "Maux de tête", "Fatigue chronique", "Toux persistante"]),
    diagnosis: status === "COMPLETED" ? faker.helpers.arrayElement(["Grippe saisonnière", "Gastro-entérite", "Hypertension stade 1", "Diabète non contrôlé", "Infection urinaire"]) : "",
    prescription: status === "COMPLETED" ? faker.lorem.sentence() : undefined,
    notes: faker.lorem.sentence(),
    vitalSigns: {
      temperature: faker.number.float({ min: 36, max: 39, fractionDigits: 1 }),
      bloodPressure: `${faker.number.int({ min: 110, max: 150 })}/${faker.number.int({ min: 70, max: 95 })}`,
      heartRate: faker.number.int({ min: 60, max: 110 }),
      respiratoryRate: faker.number.int({ min: 12, max: 22 }),
      oxygenSaturation: faker.number.int({ min: 94, max: 100 }),
    },
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  };
});

// ============== MEDICAL ACTS ==============
export const MEDICAL_ACTS: MedicalAct[] = Array.from({ length: 200 }, (_, i) => {
  const cons = faker.helpers.arrayElement(CONSULTATIONS.filter(c => c.status === "COMPLETED"));
  const act = faker.helpers.arrayElement(ACTS_CATALOG);
  return {
    id: `ma-${i + 1}`,
    consultationId: cons.id,
    patientId: cons.patientId,
    type: act.type,
    code: act.code,
    label: act.label,
    description: `${act.label} pour patient #${cons.patientId}`,
    performedBy: cons.doctorName,
    performedAt: cons.endedAt || new Date().toISOString(),
    cost: act.basePrice + faker.number.int({ min: -2000, max: 5000 }),
    status: faker.helpers.weightedArrayElement([
      { weight: 5, value: "COMPLETED" },
      { weight: 2, value: "PENDING" },
      { weight: 1, value: "CANCELLED" },
    ]) as "COMPLETED" | "PENDING" | "CANCELLED",
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  };
});

// ============== INVOICES ==============
export const INVOICES: Invoice[] = Array.from({ length: 95 }, (_, i) => {
  const patient = faker.helpers.arrayElement(PATIENTS);
  const linesCount = faker.number.int({ min: 1, max: 4 });
  const lines = Array.from({ length: linesCount }, (_, li) => {
    const act = faker.helpers.arrayElement(ACTS_CATALOG);
    const qty = faker.number.int({ min: 1, max: 2 });
    const total = act.basePrice * qty;
    return {
      id: `line-${i}-${li}`,
      actId: act.id,
      description: act.label,
      quantity: qty,
      unitPrice: act.basePrice,
      total,
    };
  });
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const hasInsurance = !!patient.insuranceCompany;
  const coverageRate = hasInsurance ? faker.helpers.arrayElement([70, 75, 80, 85, 90]) : 0;
  const insuranceCover = Math.round(subtotal * coverageRate / 100);
  const patientShare = subtotal - insuranceCover;
  const status = faker.helpers.weightedArrayElement([
    { weight: 4, value: "PAID" },
    { weight: 2, value: "ISSUED" },
    { weight: 1, value: "PARTIALLY_PAID" },
    { weight: 1, value: "OVERDUE" },
  ]) as "PAID" | "ISSUED" | "PARTIALLY_PAID" | "OVERDUE";
  return {
    id: `inv-${i + 1}`,
    number: `INV-2025-${String(i + 1).padStart(5, "0")}`,
    patientId: patient.id,
    patientName: `${patient.firstName} ${patient.lastName}`,
    lines,
    scope: "CONSULTATION",
    subtotal,
    insuranceCover,
    patientShare,
    total: subtotal,
    status,
    issuedAt: faker.date.between({ from: "2025-10-01", to: "2026-02-15" }).toISOString(),
    dueDate: faker.date.soon({ days: 30 }).toISOString(),
    paidAt: status === "PAID" ? faker.date.recent({ days: 10 }).toISOString() : undefined,
    insuranceCompany: patient.insuranceCompany,
    insuranceNumber: patient.insuranceNumber,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  };
});

// ============== REFUNDS ==============
export const REFUNDS: Refund[] = INVOICES.filter(i => i.insuranceCompany && i.insuranceCover > 0).slice(0, 55).map((inv, i) => {
  const status = faker.helpers.weightedArrayElement([
    { weight: 4, value: "PAID" },
    { weight: 2, value: "SUBMITTED" },
    { weight: 2, value: "PROCESSING" },
    { weight: 1, value: "APPROVED" },
    { weight: 1, value: "REJECTED" },
    { weight: 1, value: "DISPUTED" },
  ]) as "PAID" | "SUBMITTED" | "PROCESSING" | "APPROVED" | "REJECTED" | "DISPUTED";
  const submittedAt = faker.date.between({ from: "2025-10-15", to: "2026-02-15" }).toISOString();
  return {
    id: `ref-${i + 1}`,
    invoiceId: inv.id,
    invoiceNumber: inv.number,
    patientId: inv.patientId,
    patientName: inv.patientName,
    insuranceCompany: inv.insuranceCompany || "—",
    amount: inv.insuranceCover,
    status,
    submittedAt,
    processedAt: status !== "SUBMITTED" ? faker.date.between({ from: submittedAt, to: new Date().toISOString() }).toISOString() : undefined,
    paidAt: status === "PAID" ? faker.date.recent({ days: 5 }).toISOString() : undefined,
    reference: `REF-${faker.string.alphanumeric(10).toUpperCase()}`,
    rejectionReason: status === "REJECTED" ? "Pièce justificative manquante" : undefined,
    disputeReason: status === "DISPUTED" ? "Montant contesté par l'assureur" : undefined,
    createdAt: submittedAt,
    updatedAt: faker.date.recent().toISOString(),
  };
});

// ============== DASHBOARD HELPERS ==============
export function computeDashboardKPI() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    totalPatients: PATIENTS.length,
    todayAdmissions: PATIENTS.filter(p => p.createdAt.slice(0, 10) === today).length || 8,
    pendingInvoices: INVOICES.filter(i => i.status === "ISSUED" || i.status === "PARTIALLY_PAID" || i.status === "OVERDUE").length,
    pendingRefunds: REFUNDS.filter(r => r.status === "SUBMITTED" || r.status === "PROCESSING" || r.status === "DISPUTED").length,
    monthlyRevenue: INVOICES.filter(i => i.paidAt && i.paidAt.startsWith("2026-01")).reduce((s, i) => s + i.patientShare, 0),
    bedOccupancyRate: Math.round(((HOSPITAL.totalBeds - HOSPITAL.availableBeds) / HOSPITAL.totalBeds) * 100),
    trends: {
      patients: 8.4,
      admissions: 12.1,
      invoices: -3.2,
      refunds: 5.7,
      revenue: 18.9,
      occupancy: 2.4,
    },
  };
}

export function getMonthlyRevenue() {
  const months = ["Juil", "Août", "Sept", "Oct", "Nov", "Déc", "Jan", "Fév"];
  return months.map((month) => {
    const revenue = faker.number.int({ min: 4500000, max: 8500000 });
    const refunds = faker.number.int({ min: 800000, max: 2500000 });
    return { month, revenue, refunds, net: revenue - refunds };
  });
}

// ============== AUDIT LOGS ==============
const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

export const AUDIT_LOGS: AuditLogEntry[] = [
  { id: "aud-1", actorId: "usr-1", actorName: "Admin Système", actorRole: "ROLE_ADMIN_HOSPITAL", action: "LOGIN", entity: "settings", description: "Connexion au système", status: "SUCCESS", createdAt: daysAgo(0), ip: "192.168.1.100" },
  { id: "aud-2", actorId: "usr-2", actorName: "Amadou Diallo", actorRole: "ROLE_DOCTOR", action: "LOGIN", entity: "settings", description: "Connexion au système", status: "SUCCESS", createdAt: daysAgo(0), ip: "192.168.1.101" },
  { id: "aud-3", actorId: "usr-2", actorName: "Amadou Diallo", actorRole: "ROLE_DOCTOR", action: "CREATE", entity: "consultation", entityId: "cs-1", patientName: "Mamadou Sow", description: "Création consultation pour Mamadou Sow", status: "SUCCESS", createdAt: daysAgo(0), ip: "192.168.1.101" },
  { id: "aud-4", actorId: "usr-3", actorName: "Fatou Ndiaye", actorRole: "ROLE_RECEPTIONIST", action: "CREATE", entity: "patient", entityId: "pat-1", description: "Création dossier patient", status: "SUCCESS", createdAt: daysAgo(0), ip: "192.168.1.102" },
  { id: "aud-5", actorId: "usr-4", actorName: "Mariam Cissé", actorRole: "ROLE_TRIAGE", action: "UPDATE", entity: "triage", entityId: "tr-1", patientName: "Mamadou Sow", description: "Mise à jour triage pour Mamadou Sow", status: "SUCCESS", createdAt: daysAgo(0), ip: "192.168.1.103" },
  { id: "aud-6", actorId: "usr-5", actorName: "Ousmane Ba", actorRole: "ROLE_LABORATORY", action: "CREATE", entity: "laboratory", entityId: "lab-1", patientName: "Aïssatou Diallo", description: "Résultats d'analyse pour Aïssatou Diallo", status: "SUCCESS", createdAt: daysAgo(1), ip: "192.168.1.104" },
  { id: "aud-7", actorId: "usr-6", actorName: "Awa Mbaye", actorRole: "ROLE_BILLING", action: "CREATE", entity: "invoice", entityId: "inv-1", patientName: "Mamadou Sow", description: "Facture créée pour Mamadou Sow — 45 000 FCFA", status: "SUCCESS", createdAt: daysAgo(1), ip: "192.168.1.105" },
  { id: "aud-8", actorId: "usr-7", actorName: "Cheikh Fall", actorRole: "ROLE_CASHIER", action: "UPDATE", entity: "invoice", entityId: "inv-1", description: "Paiement enregistré — 45 000 FCFA", status: "SUCCESS", createdAt: daysAgo(1), ip: "192.168.1.106" },
  { id: "aud-9", actorId: "usr-2", actorName: "Amadou Diallo", actorRole: "ROLE_DOCTOR", action: "CREATE", entity: "prescription", entityId: "pres-1", patientName: "Aïssatou Diallo", description: "Prescription pour Aïssatou Diallo", status: "SUCCESS", createdAt: daysAgo(2), ip: "192.168.1.101" },
  { id: "aud-10", actorId: "usr-1", actorName: "Admin Système", actorRole: "ROLE_ADMIN_HOSPITAL", action: "CREATE", entity: "user", entityId: "usr-8", description: "Création utilisateur Dr. Souleymane Kane", status: "SUCCESS", createdAt: daysAgo(2), ip: "192.168.1.100" },
  { id: "aud-11", actorId: "usr-9", actorName: "Dr. Ndeye Thiam", actorRole: "ROLE_DOCTOR", action: "LOGIN", entity: "settings", status: "FAILURE", description: "Échec connexion — mot de passe invalide", createdAt: daysAgo(2), ip: "192.168.1.200" },
  { id: "aud-12", actorId: "usr-1", actorName: "Admin Système", actorRole: "ROLE_ADMIN_HOSPITAL", action: "DELETE", entity: "tarif", entityId: "tar-3", description: "Suppression logique tarif ACT-003", status: "SUCCESS", createdAt: daysAgo(3), ip: "192.168.1.100" },
  { id: "aud-13", actorId: "usr-6", actorName: "Awa Mbaye", actorRole: "ROLE_BILLING", action: "SUBMIT", entity: "refund", entityId: "ref-1", patientName: "Mamadou Sow", description: "Soumission remboursement — 36 000 FCFA vers NSIA", status: "SUCCESS", createdAt: daysAgo(3), ip: "192.168.1.105" },
  { id: "aud-14", actorId: "system", actorName: "Gateway", actorRole: "SYSTEM", action: "UPDATE", entity: "refund", entityId: "ref-1", description: "Remboursement approuvé par NSIA — 36 000 FCFA", status: "SUCCESS", createdAt: daysAgo(2), ip: "10.0.0.1" },
  { id: "aud-15", actorId: "usr-1", actorName: "Admin Système", actorRole: "ROLE_ADMIN_HOSPITAL", action: "EXPORT", entity: "report", description: "Export rapport mensuel Janvier 2026", status: "SUCCESS", createdAt: daysAgo(4), ip: "192.168.1.100" },
  { id: "aud-16", actorId: "usr-6", actorName: "Awa Mbaye", actorRole: "ROLE_BILLING", action: "VIEW", entity: "report", description: "Consultation rapport financier", status: "SUCCESS", createdAt: daysAgo(4), ip: "192.168.1.105" },
  { id: "aud-17", actorId: "usr-10", actorName: "Fatimata Sy", actorRole: "ROLE_NURSE", action: "CREATE", entity: "hospitalization", entityId: "hosp-1", patientName: "Oumar Fall", description: "Admission hospitalisation Oumar Fall — service Cardiologie", status: "SUCCESS", createdAt: daysAgo(5), ip: "192.168.1.107" },
  { id: "aud-18", actorId: "usr-1", actorName: "Admin Système", actorRole: "ROLE_ADMIN_HOSPITAL", action: "UPDATE", entity: "settings", description: "Modification paramètres généraux de l'hôpital", status: "SUCCESS", createdAt: daysAgo(5), ip: "192.168.1.100" },
  { id: "aud-19", actorId: "usr-3", actorName: "Fatou Ndiaye", actorRole: "ROLE_RECEPTIONIST", action: "UPDATE", entity: "patient", entityId: "pat-2", patientName: "Khady Dieng", description: "Mise à jour coordonnées patient Khady Dieng", status: "SUCCESS", createdAt: daysAgo(6), ip: "192.168.1.102" },
  { id: "aud-20", actorId: "usr-2", actorName: "Amadou Diallo", actorRole: "ROLE_DOCTOR", action: "LOGOUT", entity: "settings", description: "Déconnexion du système", status: "SUCCESS", createdAt: daysAgo(6), ip: "192.168.1.101" },
];

// ============== PHARMACY ==============
export const PHARMACY: PharmacyItem[] = [
  { id: "ph-1", code: "AMOX-500", name: "Amoxicilline", dosage: "500mg", form: "GELULE", category: "ANTIBIOTIQUE", stock: 1200, minStock: 200, unitPrice: 250, supplier: "PharmaLab Cameroun", expiryDate: "2027-06-15", location: "A-01", active: true, createdAt: "2024-01-15T00:00:00Z", updatedAt: "2026-06-28T00:00:00Z" },
  { id: "ph-2", code: "AMOX-250", name: "Amoxicilline", dosage: "250mg", form: "GELULE", category: "ANTIBIOTIQUE", stock: 800, minStock: 150, unitPrice: 180, supplier: "PharmaLab Cameroun", expiryDate: "2027-04-20", location: "A-02", active: true, createdAt: "2024-01-15T00:00:00Z", updatedAt: "2026-06-28T00:00:00Z" },
  { id: "ph-3", code: "PARA-500", name: "Paracétamol", dosage: "500mg", form: "COMPRIME", category: "ANALGESIQUE", stock: 5000, minStock: 500, unitPrice: 50, supplier: "Promopharm Cameroun", expiryDate: "2027-08-01", location: "B-01", active: true, createdAt: "2024-01-15T00:00:00Z", updatedAt: "2026-06-28T00:00:00Z" },
  { id: "ph-4", code: "PARA-1000", name: "Paracétamol", dosage: "1000mg", form: "COMPRIME", category: "ANALGESIQUE", stock: 3000, minStock: 400, unitPrice: 75, supplier: "Promopharm Cameroun", expiryDate: "2027-07-15", location: "B-02", active: true, createdAt: "2024-01-15T00:00:00Z", updatedAt: "2026-06-28T00:00:00Z" },
  { id: "ph-5", code: "IBU-400", name: "Ibuprofène", dosage: "400mg", form: "COMPRIME", category: "ANTI_INFLAMMATOIRE", stock: 2000, minStock: 300, unitPrice: 120, supplier: "PharmaLab Cameroun", expiryDate: "2027-05-30", location: "C-01", active: true, createdAt: "2024-01-15T00:00:00Z", updatedAt: "2026-06-28T00:00:00Z" },
  { id: "ph-6", code: "MET-850", name: "Metformine", dosage: "850mg", form: "COMPRIME", category: "ANTIDIABETIQUE", stock: 1500, minStock: 200, unitPrice: 90, supplier: "Sanofi Afrique", expiryDate: "2027-09-10", location: "D-01", active: true, createdAt: "2024-01-15T00:00:00Z", updatedAt: "2026-06-28T00:00:00Z" },
  { id: "ph-7", code: "AML-5", name: "Amlodipine", dosage: "5mg", form: "COMPRIME", category: "ANTIHYPERTENSEUR", stock: 2500, minStock: 400, unitPrice: 85, supplier: "Sanofi Afrique", expiryDate: "2027-10-05", location: "E-01", active: true, createdAt: "2024-01-15T00:00:00Z", updatedAt: "2026-06-28T00:00:00Z" },
  { id: "ph-8", code: "OMEP-20", name: "Oméprazole", dosage: "20mg", form: "GELULE", category: "AUTRE", stock: 1800, minStock: 250, unitPrice: 150, supplier: "Promopharm Cameroun", expiryDate: "2027-06-20", location: "F-01", active: true, createdAt: "2024-01-15T00:00:00Z", updatedAt: "2026-06-28T00:00:00Z" },
  { id: "ph-9", code: "DEXA-8", name: "Dexaméthasone", dosage: "8mg", form: "INJECTABLE", category: "ANTI_INFLAMMATOIRE", stock: 200, minStock: 50, unitPrice: 450, supplier: "PharmaLab Cameroun", expiryDate: "2027-03-15", location: "G-01", active: true, createdAt: "2024-01-15T00:00:00Z", updatedAt: "2026-06-28T00:00:00Z" },
  { id: "ph-10", code: "VITC-1000", name: "Vitamine C", dosage: "1000mg", form: "COMPRIME", category: "VITAMINE", stock: 3500, minStock: 500, unitPrice: 65, supplier: "Promopharm Cameroun", expiryDate: "2027-12-31", location: "H-01", active: true, createdAt: "2024-01-15T00:00:00Z", updatedAt: "2026-06-28T00:00:00Z" },
  { id: "ph-11", code: "CEF-500", name: "Ceftriaxone", dosage: "500mg", form: "INJECTABLE", category: "ANTIBIOTIQUE", stock: 150, minStock: 100, unitPrice: 1200, supplier: "Sanofi Afrique", expiryDate: "2027-02-28", location: "A-03", active: true, createdAt: "2024-01-15T00:00:00Z", updatedAt: "2026-06-28T00:00:00Z" },
  { id: "ph-12", code: "SALB-100", name: "Salbutamol", dosage: "100µg", form: "SOLUTION", category: "AUTRE", stock: 45, minStock: 50, unitPrice: 800, supplier: "PharmaLab Cameroun", expiryDate: "2026-12-15", location: "I-01", active: true, createdAt: "2024-01-15T00:00:00Z", updatedAt: "2026-06-28T00:00:00Z" },
];

// ============== DASHBOARD ==============
export function getKPI(): DashboardKPI {
  return {
    totalPatients: PATIENTS.length,
    todayAdmissions: faker.number.int({ min: 5, max: 20 }),
    pendingInvoices: INVOICES.filter(i => i.status === "ISSUED" || i.status === "PARTIALLY_PAID").length,
    pendingRefunds: REFUNDS.filter(r => r.status === "SUBMITTED" || r.status === "PROCESSING").length,
    monthlyRevenue: faker.number.int({ min: 15_000_000, max: 35_000_000 }),
    bedOccupancyRate: Math.round((MEDICAL_SERVICES.reduce((s, sv) => s + Math.floor(sv.capacity * 0.65), 0) / MEDICAL_SERVICES.reduce((s, sv) => s + sv.capacity, 0)) * 100),
    trends: { patients: 12, revenue: 8, occupancy: -3, refunds: 5 },
  };
}

export function getServiceOccupancy(): ServiceOccupancy[] {
  return MEDICAL_SERVICES.map(s => {
    const occupied = faker.number.int({ min: Math.floor(s.capacity * 0.4), max: s.capacity });
    return {
      service: s.name,
      occupied,
      total: s.capacity,
      rate: Math.round((occupied / s.capacity) * 100),
    };
  });
}