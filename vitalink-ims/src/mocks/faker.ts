import { faker } from "@faker-js/faker/locale/fr";
import type {
  Insured,
  Contract,
  Guarantee,
  Hospital,
  Convention,
  ReimbursementClaim,
  User,
  Role,
  DashboardKPI,
  ActivityLog,
  Notification,
  ClaimHistoryEntry,
  ChartDataPoint,
} from "../types";

faker.seed(42); // Deterministic data

// ============= Users & Roles =============
export const ROLES: { id: Role; label: string; description: string; permissions: string[] }[] = [
  {
    id: "ROLE_SUPER_ADMIN",
    label: "Super Administrateur",
    description: "Accès complet à toutes les fonctionnalités",
    permissions: ["*"],
  },
  {
    id: "ROLE_INSURANCE_AGENT",
    label: "Agent d'assurance",
    description: "Gestion des assurés, contrats et remboursements",
    permissions: [
      "insureds.read", "insureds.write",
      "contracts.read", "contracts.write",
      "claims.read", "claims.write",
      "hospitals.read",
    ],
  },
  {
    id: "ROLE_SUPERVISOR",
    label: "Superviseur",
    description: "Validation et supervision des opérations",
    permissions: [
      "insureds.read", "insureds.write",
      "contracts.read", "contracts.write", "contracts.suspend",
      "claims.read", "claims.write", "claims.validate", "claims.reject",
      "hospitals.read", "hospitals.write",
      "reports.read",
      "users.read",
    ],
  },
  {
    id: "ROLE_DIRECTOR",
    label: "Directeur",
    description: "Vision stratégique et reporting",
    permissions: [
      "*",
    ],
  },
  {
    id: "ROLE_AUDITOR",
    label: "Auditeur",
    description: "Consultation des logs et historique",
    permissions: [
      "insureds.read",
      "contracts.read",
      "claims.read",
      "hospitals.read",
      "reports.read",
      "audit.read",
      "users.read",
    ],
  },
];

const departments = ["Production", "Sinistres", "Commercial", "IT", "Finance", "Direction", "Audit"];

export function generateUsers(count = 12): User[] {
  const roles: Role[] = [
    "ROLE_SUPER_ADMIN",
    "ROLE_INSURANCE_AGENT",
    "ROLE_INSURANCE_AGENT",
    "ROLE_INSURANCE_AGENT",
    "ROLE_INSURANCE_AGENT",
    "ROLE_SUPERVISOR",
    "ROLE_SUPERVISOR",
    "ROLE_SUPERVISOR",
    "ROLE_DIRECTOR",
    "ROLE_DIRECTOR",
    "ROLE_AUDITOR",
    "ROLE_AUDITOR",
  ];

  return Array.from({ length: count }, (_, i) => {
    const role = roles[i % roles.length];
    const roleDef = ROLES.find((r) => r.id === role)!;
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return {
      id: `USR-${String(i + 1).padStart(4, "0")}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      fullName: `${firstName} ${lastName}`,
      role,
      avatar: undefined,
      department: faker.helpers.arrayElement(departments),
      active: faker.datatype.boolean({ probability: 0.92 }),
      lastLogin: faker.date.recent({ days: 30 }).toISOString(),
      permissions: roleDef.permissions,
      createdAt: faker.date.past({ years: 3 }).toISOString(),
    };
  });
}

// ============= Garanties =============
export function generateGuarantees(): Guarantee[] {
  const definitions: Omit<Guarantee, "id" | "usedAmount">[] = [
    {
      code: "HOSP-STD",
      name: "Hospitalisation Standard",
      description: "Frais de séjour, chambre, soins généraux lors d'une hospitalisation",
      type: "hospitalization",
      ceiling: 50000,
      copayPercent: 10,
      waitingDays: 30,
      exclusions: ["Chirurgie esthétique", "Soins à l'étranger"],
      included: true,
      icon: "Building2",
    },
    {
      code: "CONS-GEN",
      name: "Consultations Généralistes",
      description: "Visites chez médecins généralistes et spécialistes",
      type: "consultation",
      ceiling: 5000,
      copayPercent: 20,
      waitingDays: 0,
      exclusions: ["Psychologie non conventionnée"],
      included: true,
      icon: "Stethoscope",
    },
    {
      code: "PHAR-STD",
      name: "Pharmacie",
      description: "Médicaments remboursables et traitements prescrits",
      type: "pharmacy",
      ceiling: 3000,
      copayPercent: 30,
      waitingDays: 0,
      exclusions: ["Médicaments non remboursables", "Homéopathie"],
      included: true,
      icon: "Pill",
    },
    {
      code: "DENT-STD",
      name: "Dentaire",
      description: "Soins dentaires, prothèses, orthodontie",
      type: "dental",
      ceiling: 4000,
      copayPercent: 25,
      waitingDays: 90,
      exclusions: ["Implants esthétiques"],
      included: true,
      icon: "Smile",
    },
    {
      code: "OPT-STD",
      name: "Optique",
      description: "Lunettes, lentilles, chirurgie réfractive",
      type: "optical",
      ceiling: 1500,
      copayPercent: 20,
      waitingDays: 180,
      exclusions: ["Lunettes de soleil"],
      included: true,
      icon: "Glasses",
    },
    {
      code: "MAT-STD",
      name: "Maternité",
      description: "Suivi grossesse, accouchement, post-natal",
      type: "maternity",
      ceiling: 8000,
      copayPercent: 10,
      waitingDays: 270,
      exclusions: ["Procréation médicalement assistée"],
      included: true,
      icon: "Baby",
    },
    {
      code: "LAB-STD",
      name: "Laboratoire & Analyses",
      description: "Analyses médicales, prises de sang, examens biologiques",
      type: "laboratory",
      ceiling: 2500,
      copayPercent: 15,
      waitingDays: 0,
      exclusions: [],
      included: true,
      icon: "TestTube",
    },
    {
      code: "IMG-STD",
      name: "Imagerie Médicale",
      description: "Radiologie, IRM, scanner, échographie",
      type: "imaging",
      ceiling: 3500,
      copayPercent: 15,
      waitingDays: 0,
      exclusions: [],
      included: true,
      icon: "ScanLine",
    },
  ];

  return definitions.map((g, i) => ({
    ...g,
    id: `GRT-${String(i + 1).padStart(3, "0")}`,
    usedAmount: faker.number.int({ min: 200, max: g.ceiling * 0.6 }),
  }));
}

// ============= Hôpitaux =============
const hospitalTypes: Hospital["type"][] = ["public", "private", "clinic", "university"];
const cities = ["Paris", "Lyon", "Marseille", "Toulouse", "Bordeaux", "Nice", "Nantes", "Strasbourg", "Lille", "Rennes"];

export function generateHospitals(count = 15): Hospital[] {
  return Array.from({ length: count }, (_, i) => {
    const type = faker.helpers.arrayElement(hospitalTypes);
    const tier = ((i % 3) + 1) as 1 | 2 | 3;
    const city = faker.helpers.arrayElement(cities);
    const namePrefix = type === "university" ? "CHU" : type === "clinic" ? "Clinique" : type === "private" ? "Hôpital Privé" : "Centre Hospitalier";

    return {
      id: `HOP-${String(i + 1).padStart(3, "0")}`,
      name: `${namePrefix} ${faker.person.lastName()}`,
      code: `H${String(i + 1).padStart(3, "0")}`,
      type,
      tier,
      address: faker.location.streetAddress(),
      city,
      postalCode: faker.location.zipCode(),
      phone: faker.phone.number(),
      email: faker.internet.email().toLowerCase(),
      director: `Dr. ${faker.person.fullName()}`,
      bedCapacity: faker.number.int({ min: 50, max: 1500 }),
      specialties: faker.helpers.arrayElements(
        ["Cardiologie", "Neurologie", "Pédiatrie", "Oncologie", "Chirurgie", "Maternité", "Urgences", "Orthopédie", "Dermatologie"],
        { min: 3, max: 6 }
      ),
      conventionId: `CONV-${String(i + 1).padStart(4, "0")}`,
      conventionStatus: faker.helpers.arrayElement(["active", "active", "active", "pending", "terminated"]) as Convention["status"],
      pricingDiscount: faker.number.int({ min: 5, max: 25 }),
      rating: Number(faker.number.float({ min: 3.2, max: 4.9, fractionDigits: 1 }).toFixed(1)),
      totalClaims: faker.number.int({ min: 50, max: 1500 }),
      averageProcessingDays: faker.number.int({ min: 1, max: 12 }),
      joinDate: faker.date.past({ years: 5 }).toISOString(),
      active: faker.datatype.boolean({ probability: 0.93 }),
    };
  });
}

export function generateConventions(hospitals: Hospital[]): Convention[] {
  return hospitals.map((h) => ({
    id: h.conventionId,
    reference: `CONV-${faker.string.alphanumeric(6).toUpperCase()}`,
    hospitalId: h.id,
    startDate: faker.date.past({ years: 2 }).toISOString(),
    endDate: faker.date.future({ years: 1 }).toISOString(),
    discountRate: h.pricingDiscount,
    paymentTerms: faker.helpers.arrayElement(["30 jours", "45 jours", "60 jours", "Fin de mois"]),
    status: h.conventionStatus,
    documentsCount: faker.number.int({ min: 3, max: 15 }),
  }));
}

// ============= Assurés =============
export function generateInsureds(count = 50): Insured[] {
  return Array.from({ length: count }, (_, i) => {
    const gender = faker.helpers.arrayElement(["M", "F"]) as "M" | "F";
    const firstName = faker.person.firstName(gender === "M" ? "male" : "female");
    const lastName = faker.person.lastName();
    const birthDate = faker.date.between({ from: "1940-01-01", to: "2005-12-31" });
    const joinDate = faker.date.past({ years: 5 });

    return {
      id: `ASS-${String(i + 1).padStart(4, "0")}`,
      matricule: `MAT${faker.string.numeric(8)}`,
      firstName,
      lastName,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      phone: faker.phone.number(),
      birthDate: birthDate.toISOString(),
      gender,
      maritalStatus: faker.helpers.arrayElement(["single", "married", "divorced", "widowed"]) as Insured["maritalStatus"],
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      postalCode: faker.location.zipCode(),
      socialSecurityNumber: `2 ${faker.string.numeric(2)} ${faker.string.numeric(2)} ${faker.string.numeric(2)} ${faker.string.numeric(3)} ${faker.string.numeric(2)}`,
      contractId: `CTR-${String((i % 100) + 1).padStart(4, "0")}`,
      joinDate: joinDate.toISOString(),
      status: faker.helpers.weightedArrayElement([
        { value: "active", weight: 75 },
        { value: "suspended", weight: 8 },
        { value: "terminated", weight: 7 },
        { value: "pending", weight: 10 },
      ]) as Insured["status"],
      dependents: faker.number.int({ min: 0, max: 5 }),
      totalReimbursements: faker.number.int({ min: 0, max: 25000 }),
      lastClaimDate: faker.datatype.boolean({ probability: 0.7 }) ? faker.date.recent({ days: 180 }).toISOString() : undefined,
      riskScore: faker.number.int({ min: 5, max: 85 }),
      notes: faker.datatype.boolean({ probability: 0.2 }) ? faker.lorem.sentence() : undefined,
    };
  });
}

// ============= Contrats =============
const products = ["Santé Essentielle", "Santé Confort", "Santé Premium", "Santé Famille", "Santé Senior", "Santé Entreprise"];

export function generateContracts(insureds: Insured[], count = 100): Contract[] {
  return Array.from({ length: count }, (_, i) => {
    const insured = insureds[i % insureds.length];
    const type = faker.helpers.arrayElement(["individual", "family", "group", "enterprise"]) as Contract["type"];
    const startDate = faker.date.past({ years: 3 });
    const monthlyPremium = faker.number.int({ min: 30, max: 350 });
    const coverageAmount = faker.number.int({ min: 50000, max: 500000 });

    return {
      id: `CTR-${String(i + 1).padStart(4, "0")}`,
      reference: `CONTRAT-${faker.string.alphanumeric(8).toUpperCase()}`,
      type,
      insuredId: insured.id,
      productName: faker.helpers.arrayElement(products),
      startDate: startDate.toISOString(),
      endDate: faker.date.future({ years: 1, refDate: startDate }).toISOString(),
      monthlyPremium,
      annualPremium: monthlyPremium * 12,
      coverageAmount,
      remainingCoverage: faker.number.int({ min: coverageAmount * 0.2, max: coverageAmount * 0.9 }),
      status: faker.helpers.weightedArrayElement([
        { value: "active", weight: 70 },
        { value: "suspended", weight: 10 },
        { value: "terminated", weight: 8 },
        { value: "expired", weight: 5 },
        { value: "pending", weight: 7 },
      ]) as Contract["status"],
      paymentFrequency: faker.helpers.arrayElement(["monthly", "quarterly", "annual"]) as Contract["paymentFrequency"],
      guarantees: faker.helpers.arrayElements(["GRT-001", "GRT-002", "GRT-003", "GRT-004", "GRT-005", "GRT-006", "GRT-007", "GRT-008"], { min: 4, max: 8 }),
      deductible: faker.helpers.arrayElement([0, 50, 100, 200, 500]),
      commission: faker.number.int({ min: 5, max: 25 }),
      agentId: `USR-${String((i % 12) + 1).padStart(4, "0")}`,
      notes: faker.datatype.boolean({ probability: 0.15 }) ? faker.lorem.sentence() : undefined,
    };
  });
}

// ============= Remboursements =============
const medicalActs = [
  { code: "CS-CARDIO", name: "Consultation cardiologie", basePrice: 70 },
  { code: "HOSP-CHIR", name: "Hospitalisation chirurgicale", basePrice: 4500 },
  { code: "PHAR-ANTIBIO", name: "Traitement antibiotique 7j", basePrice: 45 },
  { code: "DENT-COUR", name: "Soins dentaires courants", basePrice: 120 },
  { code: "OPT-MONTE", name: "Monture + verres correcteurs", basePrice: 350 },
  { code: "MAT-ECHO", name: "Échographie obstétricale", basePrice: 95 },
  { code: "LAB-BILAN", name: "Bilan sanguin complet", basePrice: 65 },
  { code: "IMG-IRM", name: "IRM cérébrale", basePrice: 380 },
  { code: "CONS-DERMA", name: "Consultation dermatologie", basePrice: 60 },
  { code: "HOSP-MED", name: "Hospitalisation médecine", basePrice: 2200 },
  { code: "PHAR-CHRON", name: "Traitement chronique mensuel", basePrice: 180 },
  { code: "URG-CONS", name: "Consultation urgences", basePrice: 85 },
  { code: "CHIR-ORTHO", name: "Chirurgie orthopédique", basePrice: 7800 },
  { code: "DENT-IMPL", name: "Implant dentaire unitaire", basePrice: 1400 },
  { code: "MAT-ACCOU", name: "Forfait accouchement", basePrice: 3200 },
];

export function generateClaims(insureds: Insured[], hospitals: Hospital[], count = 300): ReimbursementClaim[] {
  return Array.from({ length: count }, (_, i) => {
    const insured = insureds[i % insureds.length];
    const hospital = hospitals[i % hospitals.length];
    const act = faker.helpers.arrayElement(medicalActs);
    const status = faker.helpers.weightedArrayElement([
      { value: "received", weight: 12 },
      { value: "under_review", weight: 18 },
      { value: "approved", weight: 35 },
      { value: "rejected", weight: 10 },
      { value: "disputed", weight: 5 },
      { value: "paid", weight: 20 },
    ]) as ReimbursementClaim["status"];
    const claimedAmount = act.basePrice * faker.number.float({ min: 1, max: 1.4, fractionDigits: 2 });
    const approvedAmount = status === "rejected" ? 0 : status === "paid" || status === "approved" ? claimedAmount * 0.85 : claimedAmount * 0.7;

    const submissionDate = faker.date.recent({ days: 60 });
    const treatmentDate = faker.date.recent({ days: 90, refDate: submissionDate });
    const processingDays = faker.number.int({ min: 1, max: 15 });

    const history: ClaimHistoryEntry[] = [
      {
        date: submissionDate.toISOString(),
        actor: `${hospital.name} - Système`,
        action: "Demande soumise",
        comment: "Soumission automatique via API Gateway",
      },
    ];

    if (["under_review", "approved", "rejected", "disputed", "paid"].includes(status)) {
      history.push({
        date: new Date(submissionDate.getTime() + 1000 * 60 * 60 * 6).toISOString(),
        actor: faker.person.fullName(),
        action: "Prise en charge",
        comment: "Demande affectée à un gestionnaire",
      });
    }
    if (["approved", "paid"].includes(status)) {
      history.push({
        date: new Date(submissionDate.getTime() + 1000 * 60 * 60 * 24).toISOString(),
        actor: faker.person.fullName(),
        action: "Validation",
        comment: "Pièces conformes, demande approuvée",
      });
    }
    if (status === "paid") {
      history.push({
        date: new Date(submissionDate.getTime() + 1000 * 60 * 60 * 24 * 3).toISOString(),
        actor: "Système",
        action: "Paiement effectué",
        comment: `Virement bancaire de ${approvedAmount.toFixed(2)}€`,
      });
    }
    if (status === "rejected") {
      history.push({
        date: new Date(submissionDate.getTime() + 1000 * 60 * 60 * 24).toISOString(),
        actor: faker.person.fullName(),
        action: "Rejet",
        comment: faker.helpers.arrayElement([
          "Pièces justificatives manquantes",
          "Acte non couvert par le contrat",
          "Plafond annuel atteint",
          "Délai de déclaration dépassé",
        ]),
      });
    }
    if (status === "disputed") {
      history.push({
        date: new Date(submissionDate.getTime() + 1000 * 60 * 60 * 24 * 2).toISOString(),
        actor: faker.person.fullName(),
        action: "Litige ouvert",
        comment: "Assuré conteste la décision",
      });
    }

    return {
      id: `RMB-${String(i + 1).padStart(5, "0")}`,
      reference: `REM-${faker.string.alphanumeric(10).toUpperCase()}`,
      insuredId: insured.id,
      contractId: insured.contractId,
      hospitalId: hospital.id,
      submissionDate: submissionDate.toISOString(),
      treatmentDate: treatmentDate.toISOString(),
      medicalAct: act.name,
      medicalActCode: act.code,
      description: faker.lorem.sentence(),
      claimedAmount: Math.round(claimedAmount * 100) / 100,
      approvedAmount: Math.round(approvedAmount * 100) / 100,
      copayAmount: Math.round((claimedAmount * 0.15) * 100) / 100,
      status,
      priority: faker.helpers.arrayElement(["low", "normal", "high", "urgent"]) as ReimbursementClaim["priority"],
      assignedTo: status !== "received" ? `USR-${String((i % 12) + 1).padStart(4, "0")}` : undefined,
      documents: faker.helpers.arrayElements(["Facture", "Ordonnance", "Compte-rendu", "Radio", "Analyse"], { min: 1, max: 4 }),
      diagnosis: faker.helpers.arrayElement([
        "Hypertension artérielle",
        "Grippe saisonnière",
        "Fracture du poignet",
        "Gastro-entérite",
        "Appendicite aiguë",
        "Cataracte",
        "Sciatique",
        "Bronchite chronique",
        "Diabète type 2",
        "Migraine chronique",
      ]),
      rejectionReason: status === "rejected" ? faker.helpers.arrayElement([
        "Pièces justificatives manquantes",
        "Acte hors périmètre contractuel",
        "Carence non respectée",
      ]) : undefined,
      disputeReason: status === "disputed" ? "Assuré conteste le montant du remboursement" : undefined,
      processingDays,
      slaDeadline: new Date(submissionDate.getTime() + 1000 * 60 * 60 * 24 * 5).toISOString(),
      history,
    };
  });
}

// ============= KPI Dashboard =============
export function generateDashboardKPIs(insureds: Insured[], contracts: Contract[], hospitals: Hospital[], claims: ReimbursementClaim[]): DashboardKPI[] {
  const activeInsureds = insureds.filter((i) => i.status === "active").length;
  const activeContracts = contracts.filter((c) => c.status === "active").length;
  const pendingClaims = claims.filter((c) => ["received", "under_review"].includes(c.status)).length;
  const totalClaims = claims.length;
  const totalApproved = claims.filter((c) => ["approved", "paid"].includes(c.status)).reduce((s, c) => s + c.approvedAmount, 0);
  const totalClaimed = claims.reduce((s, c) => s + c.claimedAmount, 0);
  const sinistralite = (totalApproved / totalClaimed) * 100;
  const monthlyCosts = contracts.reduce((s, c) => s + c.monthlyPremium, 0);

  return [
    {
      label: "Assurés actifs",
      value: activeInsureds,
      format: "number",
      change: 8.4,
      trend: "up",
      icon: "Users",
      color: "brand",
    },
    {
      label: "Contrats actifs",
      value: activeContracts,
      format: "number",
      change: 3.2,
      trend: "up",
      icon: "FileText",
      color: "emerald",
    },
    {
      label: "Hôpitaux partenaires",
      value: hospitals.length,
      format: "number",
      change: 0,
      trend: "stable",
      icon: "Building2",
      color: "violet",
    },
    {
      label: "Demandes en attente",
      value: pendingClaims,
      format: "number",
      change: -12.6,
      trend: "down",
      icon: "Clock",
      color: "amber",
    },
    {
      label: "Taux sinistralité",
      value: Math.round(sinistralite * 10) / 10,
      format: "percent",
      change: 2.1,
      trend: "up",
      icon: "TrendingUp",
      color: "rose",
    },
    {
      label: "Coûts mensuels",
      value: monthlyCosts,
      format: "currency",
      change: 5.7,
      trend: "up",
      icon: "Wallet",
      color: "cyan",
    },
    {
      label: "Demandes traitées",
      value: totalClaims,
      format: "number",
      change: 15.3,
      trend: "up",
      icon: "CheckCircle2",
      color: "emerald",
    },
    {
      label: "Délai moyen",
      value: 3.4,
      format: "number",
      change: -8.1,
      trend: "down",
      icon: "Timer",
      color: "brand",
    },
  ];
}

// ============= Chart Data =============
export function generateChartData(): {
  monthlyClaims: ChartDataPoint[];
  claimsByType: ChartDataPoint[];
  claimsByStatus: ChartDataPoint[];
  revenueEvolution: ChartDataPoint[];
  hospitalRanking: ChartDataPoint[];
} {
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

  return {
    monthlyClaims: months.map((m) => ({
      date: m,
      value: faker.number.int({ min: 120, max: 380 }),
    })),
    claimsByType: [
      { date: "Hospitalisation", value: 45, category: "hosp" },
      { date: "Consultation", value: 28, category: "cons" },
      { date: "Pharmacie", value: 18, category: "phar" },
      { date: "Dentaire", value: 12, category: "dent" },
      { date: "Optique", value: 8, category: "opt" },
      { date: "Maternité", value: 5, category: "mat" },
      { date: "Laboratoire", value: 22, category: "lab" },
      { date: "Imagerie", value: 15, category: "img" },
    ],
    claimsByStatus: [
      { date: "Reçues", value: 38, category: "received" },
      { date: "En cours", value: 54, category: "review" },
      { date: "Approuvées", value: 105, category: "approved" },
      { date: "Rejetées", value: 30, category: "rejected" },
      { date: "Litiges", value: 15, category: "disputed" },
      { date: "Payées", value: 58, category: "paid" },
    ],
    revenueEvolution: months.map((m, i) => ({
      date: m,
      value: 280000 + i * 15000 + faker.number.int({ min: -20000, max: 30000 }),
    })),
    hospitalRanking: faker.helpers
      .arrayElements(
        [
          "CHU Lyon",
          "Hôpital Privé Paris",
          "Clinique Saint-Michel",
          "CHU Bordeaux",
          "Clinique du Nord",
          "Centre Hospitalier Marseille",
          "Clinique Pasteur",
        ],
        5
      )
      .map((name, i) => ({
        date: name,
        value: faker.number.int({ min: 80, max: 250 }),
        category: String(i + 1),
      })),
  };
}

// ============= Activity Log =============
export function generateActivityLog(count = 25): ActivityLog[] {
  const actions = [
    { action: "a validé la demande REM-XXX", module: "claims", severity: "success" as const },
    { action: "a rejeté la demande REM-XXX", module: "claims", severity: "warning" as const },
    { action: "a créé un nouvel assuré", module: "insureds", severity: "info" as const },
    { action: "a suspendu le contrat CTR-XXX", module: "contracts", severity: "warning" as const },
    { action: "a modifié les paramètres de garantie", module: "guarantees", severity: "info" as const },
    { action: "a ajouté un hôpital partenaire", module: "hospitals", severity: "success" as const },
    { action: "a exporté le rapport mensuel", module: "reports", severity: "info" as const },
    { action: "a ouvert un litige sur REM-XXX", module: "claims", severity: "error" as const },
    { action: "a renouvellé la convention CONV-XXX", module: "conventions", severity: "success" as const },
    { action: "s'est connecté au système", module: "auth", severity: "info" as const },
  ];

  return Array.from({ length: count }, (_, i) => {
    const actionDef = faker.helpers.arrayElement(actions);
    return {
      id: `LOG-${String(i + 1).padStart(5, "0")}`,
      timestamp: faker.date.recent({ days: 7 }).toISOString(),
      actor: faker.person.fullName(),
      action: actionDef.action,
      module: actionDef.module,
      severity: actionDef.severity,
    };
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function generateNotifications(count = 8): Notification[] {
  const defs = [
    { title: "Demande urgente", message: "3 demandes en attente depuis plus de 48h", type: "warning" as const, module: "claims" },
    { title: "Convention à renouveler", message: "Convention avec CHU Lyon expire dans 30 jours", type: "info" as const, module: "hospitals" },
    { title: "Paiement effectué", message: "Lot de 12 remboursements traités avec succès", type: "success" as const, module: "claims" },
    { title: "Plafond atteint", message: "5 assurés ont atteint 80% de leur plafond annuel", type: "warning" as const, module: "guarantees" },
    { title: "Litige ouvert", message: "Assuré ASS-0023 conteste le rejet REM-00045", type: "error" as const, module: "claims" },
    { title: "Rapport disponible", message: "Le rapport mensuel d'octobre est prêt à être exporté", type: "info" as const, module: "reports" },
    { title: "Nouveau contrat", message: "12 nouveaux contrats signés cette semaine", type: "success" as const, module: "contracts" },
    { title: "SLA dépassé", message: "Une demande a dépassé le délai contractuel", type: "error" as const, module: "claims" },
  ];

  return defs.slice(0, count).map((d, i) => ({
    id: `NOT-${String(i + 1).padStart(3, "0")}`,
    ...d,
    read: faker.datatype.boolean({ probability: 0.4 }),
    timestamp: faker.date.recent({ days: 3 }).toISOString(),
  }));
}