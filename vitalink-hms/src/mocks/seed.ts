import { faker } from "@/lib/faker";
import type {
  Patient, User, Doctor, Consultation, MedicalAct, Invoice, Refund,
  MedicalRecord, InsuranceCompany, InsuranceContract,
  MedicalService, ActCatalogItem, Hospital, Allergy, MedicalCondition
} from "@/types";

// ============== HOSPITAL ==============
export const HOSPITAL: Hospital = {
  id: "hosp-001",
  name: "Hôpital Central de Dakar",
  code: "HCD-001",
  city: "Dakar",
  country: "Sénégal",
  address: "Avenue Cheikh Anta Diop, Dakar",
  phone: "+221 33 821 00 00",
  email: "contact@hcd.sn",
  totalBeds: 250,
  availableBeds: 38,
  createdAt: "2020-01-01T00:00:00Z",
  updatedAt: new Date().toISOString(),
};

// ============== INSURANCE COMPANIES ==============
export const INSURANCE_COMPANIES: InsuranceCompany[] = [
  { id: "ins-1", name: "NSIA Assurances", code: "NSIA", apiEndpoint: "https://api.nsia.africa/v1", status: "ACTIVE", contactEmail: "pro@nsia.africa", contactPhone: "+221 33 869 12 12" },
  { id: "ins-2", name: "SUNU Assurances", code: "SUNU", apiEndpoint: "https://api.sunu-assurances.com/v1", status: "ACTIVE", contactEmail: "sante@sunu.com", contactPhone: "+221 33 839 85 85" },
  { id: "ins-3", name: "AXA Afrique", code: "AXA", apiEndpoint: "https://api.axa-afrique.com/v1", status: "ACTIVE", contactEmail: "health@axa-afrique.com", contactPhone: "+221 33 849 90 90" },
  { id: "ins-4", name: "Allianz Africa", code: "ALZ", apiEndpoint: "https://api.allianz.africa/v1", status: "ACTIVE", contactEmail: "corp@allianz.africa", contactPhone: "+221 33 822 11 11" },
  { id: "ins-5", name: "CNSS Sénégal", code: "CNSS", apiEndpoint: "https://api.cnss.sn/v1", status: "ACTIVE", contactEmail: "info@cnss.sn", contactPhone: "+221 33 821 50 50" },
];

export const INSURANCE_CONTRACTS: InsuranceContract[] = [
  { id: "ctr-1", companyId: "ins-1", companyName: "NSIA Assurances", contractNumber: "CTR-NSIA-2024-001", startDate: "2024-01-01", endDate: "2026-12-31", coverageRate: 80, status: "ACTIVE" },
  { id: "ctr-2", companyId: "ins-2", companyName: "SUNU Assurances", contractNumber: "CTR-SUNU-2024-002", startDate: "2024-03-01", endDate: "2026-02-28", coverageRate: 75, status: "ACTIVE" },
  { id: "ctr-3", companyId: "ins-3", companyName: "AXA Afrique", contractNumber: "CTR-AXA-2024-003", startDate: "2024-06-01", endDate: "2025-12-31", coverageRate: 85, status: "ACTIVE" },
  { id: "ctr-4", companyId: "ins-5", companyName: "CNSS Sénégal", contractNumber: "CTR-CNSS-2024-004", startDate: "2024-01-01", endDate: "2027-12-31", coverageRate: 90, status: "ACTIVE" },
];

// ============== MEDICAL SERVICES ==============
export const MEDICAL_SERVICES: MedicalService[] = [
  { id: "srv-1", code: "CARDIO", name: "Cardiologie", description: "Service de cardiologie et soins du cœur", head: "Dr. Aïssatou Diallo", capacity: 32, active: true },
  { id: "srv-2", code: "PEDIA", name: "Pédiatrie", description: "Soins médicaux pour enfants", head: "Dr. Mamadou Sow", capacity: 45, active: true },
  { id: "srv-3", code: "URGENCE", name: "Urgences", description: "Service d'accueil des urgences", head: "Dr. Fatou Ndiaye", capacity: 28, active: true },
  { id: "srv-4", code: "CHIR", name: "Chirurgie Générale", description: "Bloc opératoire et chirurgie", head: "Dr. Ousmane Ba", capacity: 38, active: true },
  { id: "srv-5", code: "MATERN", name: "Maternité", description: "Gynécologie-obstétrique", head: "Dr. Mariama Cissé", capacity: 30, active: true },
  { id: "srv-6", code: "NEURO", name: "Neurologie", description: "Soins du système nerveux", head: "Dr. Cheikh Fall", capacity: 22, active: true },
  { id: "srv-7", code: "ONCO", name: "Oncologie", description: "Traitement des cancers", head: "Dr. Awa Mbaye", capacity: 18, active: true },
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
  ...DOCTORS.map(d => ({ ...d, role: "ROLE_DOCTOR" as const })),
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
  // Admin
  {
    id: "admin-1",
    firstName: "Aïssatou",
    lastName: "Diallo",
    email: "admin@hcd.sn",
    role: "ROLE_ADMIN_HOSPITAL" as const,
    service: "Administration",
    phone: "+221 77 123 45 67",
    active: true,
    createdAt: "2020-01-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  },
  // Director
  {
    id: "dir-1",
    firstName: "Mamadou",
    lastName: "Sow",
    email: "directeur@hcd.sn",
    role: "ROLE_DIRECTOR" as const,
    service: "Direction",
    phone: "+221 77 234 56 78",
    active: true,
    createdAt: "2019-01-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  },
];

// ============== PATIENTS ==============
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
const cities = ["Dakar", "Thiès", "Saint-Louis", "Mbour", "Ziguinchor", "Kaolack", "Touba", "Rufisque"];

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

export function getServiceOccupancy() {
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