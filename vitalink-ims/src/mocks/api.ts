import {
  generateInsureds,
  generateContracts,
  generateGuarantees,
  generateHospitals,
  generateConventions,
  generateClaims,
  generateUsers,
  generateDashboardKPIs,
  generateChartData,
  generateActivityLog,
  generateNotifications,
} from "./faker";
import type {
  Insured,
  Contract,
  Guarantee,
  Hospital,
  Convention,
  ReimbursementClaim,
  User,
  DashboardKPI,
  ActivityLog,
  Notification,
} from "../types";

// Simulated network latency
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory database
const db = {
  insureds: generateInsureds(50),
  contracts: [] as Contract[],
  guarantees: generateGuarantees(),
  hospitals: generateHospitals(15),
  conventions: [] as Convention[],
  claims: [] as ReimbursementClaim[],
  users: generateUsers(12),
  activity: generateActivityLog(30),
  notifications: generateNotifications(8),
};

// Initialize relationships
db.contracts = generateContracts(db.insureds, 100);
db.conventions = generateConventions(db.hospitals);
db.claims = generateClaims(db.insureds, db.hospitals, 300);

function logActivity(action: string, module: string) {
  const entry: ActivityLog = {
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: "Sophie Morel",
    action,
    module,
    severity: "info",
  };
  db.activity = [entry, ...db.activity].slice(0, 50);
}

// ============= API =============
export const api = {
  insureds: {
    list: async (): Promise<Insured[]> => {
      await delay();
      return [...db.insureds];
    },
    get: async (id: string): Promise<Insured | undefined> => {
      await delay();
      return db.insureds.find((i) => i.id === id);
    },
    create: async (data: Partial<Insured>): Promise<Insured> => {
      await delay();
      const newInsured: Insured = {
        id: `ASS-${String(db.insureds.length + 1).padStart(4, "0")}`,
        matricule: `MAT${Date.now().toString().slice(-8)}`,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        birthDate: new Date().toISOString(),
        gender: "M",
        maritalStatus: "single",
        address: "",
        city: "",
        postalCode: "",
        socialSecurityNumber: "",
        contractId: "",
        joinDate: new Date().toISOString(),
        status: "pending",
        dependents: 0,
        totalReimbursements: 0,
        riskScore: 10,
        ...data,
      } as Insured;
      db.insureds = [newInsured, ...db.insureds];
      logActivity(`a créé l'assuré ${newInsured.firstName} ${newInsured.lastName}`, "insureds");
      return newInsured;
    },
    update: async (id: string, data: Partial<Insured>): Promise<Insured> => {
      await delay();
      const idx = db.insureds.findIndex((i) => i.id === id);
      if (idx === -1) throw new Error("Not found");
      db.insureds[idx] = { ...db.insureds[idx], ...data };
      logActivity(`a modifié l'assuré ${db.insureds[idx].firstName} ${db.insureds[idx].lastName}`, "insureds");
      return db.insureds[idx];
    },
    delete: async (id: string): Promise<void> => {
      await delay();
      db.insureds = db.insureds.filter((i) => i.id !== id);
      logActivity(`a supprimé un assuré`, "insureds");
    },
  },

  contracts: {
    list: async (): Promise<Contract[]> => {
      await delay();
      return [...db.contracts];
    },
    create: async (data: Partial<Contract>): Promise<Contract> => {
      await delay();
      const newContract: Contract = {
        id: `CTR-${String(db.contracts.length + 1).padStart(4, "0")}`,
        reference: `CONTRAT-${Date.now()}`,
        type: "individual",
        insuredId: "",
        productName: "Santé Essentielle",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 86400000).toISOString(),
        monthlyPremium: 50,
        annualPremium: 600,
        coverageAmount: 100000,
        remainingCoverage: 100000,
        status: "pending",
        paymentFrequency: "monthly",
        guarantees: ["GRT-001", "GRT-002", "GRT-003"],
        deductible: 0,
        commission: 10,
        agentId: "USR-0001",
        ...data,
      } as Contract;
      db.contracts = [newContract, ...db.contracts];
      logActivity(`a créé le contrat ${newContract.reference}`, "contracts");
      return newContract;
    },
    update: async (id: string, data: Partial<Contract>): Promise<Contract> => {
      await delay();
      const idx = db.contracts.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error("Not found");
      db.contracts[idx] = { ...db.contracts[idx], ...data };
      logActivity(`a modifié le contrat ${db.contracts[idx].reference}`, "contracts");
      return db.contracts[idx];
    },
    delete: async (id: string): Promise<void> => {
      await delay();
      db.contracts = db.contracts.filter((c) => c.id !== id);
      logActivity(`a supprimé un contrat`, "contracts");
    },
  },

  guarantees: {
    list: async (): Promise<Guarantee[]> => {
      await delay();
      return [...db.guarantees];
    },
    update: async (id: string, data: Partial<Guarantee>): Promise<Guarantee> => {
      await delay();
      const idx = db.guarantees.findIndex((g) => g.id === id);
      if (idx === -1) throw new Error("Not found");
      db.guarantees[idx] = { ...db.guarantees[idx], ...data };
      logActivity(`a modifié la garantie ${db.guarantees[idx].name}`, "guarantees");
      return db.guarantees[idx];
    },
  },

  hospitals: {
    list: async (): Promise<Hospital[]> => {
      await delay();
      return [...db.hospitals];
    },
    get: async (id: string): Promise<Hospital | undefined> => {
      await delay();
      return db.hospitals.find((h) => h.id === id);
    },
    update: async (id: string, data: Partial<Hospital>): Promise<Hospital> => {
      await delay();
      const idx = db.hospitals.findIndex((h) => h.id === id);
      if (idx === -1) throw new Error("Not found");
      db.hospitals[idx] = { ...db.hospitals[idx], ...data };
      return db.hospitals[idx];
    },
  },

  conventions: {
    list: async (): Promise<Convention[]> => {
      await delay();
      return [...db.conventions];
    },
  },

  claims: {
    list: async (): Promise<ReimbursementClaim[]> => {
      await delay();
      return [...db.claims];
    },
    get: async (id: string): Promise<ReimbursementClaim | undefined> => {
      await delay();
      return db.claims.find((c) => c.id === id);
    },
    update: async (id: string, data: Partial<ReimbursementClaim>): Promise<ReimbursementClaim> => {
      await delay();
      const idx = db.claims.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error("Not found");
      db.claims[idx] = { ...db.claims[idx], ...data };
      return db.claims[idx];
    },
    process: async (id: string, action: "approve" | "reject" | "dispute" | "pay", comment?: string): Promise<ReimbursementClaim> => {
      await delay(400);
      const idx = db.claims.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error("Not found");

      const claim = db.claims[idx];
      const now = new Date().toISOString();
      const newHistory = [
        ...claim.history,
        {
          date: now,
          actor: "Sophie Morel",
          action:
            action === "approve" ? "Validation" :
            action === "reject" ? "Rejet" :
            action === "pay" ? "Paiement" : "Litige",
          comment: comment || `Action: ${action}`,
        },
      ];

      const statusMap = {
        approve: "approved",
        reject: "rejected",
        dispute: "disputed",
        pay: "paid",
      } as const;

      db.claims[idx] = {
        ...claim,
        status: statusMap[action],
        history: newHistory,
      };

      logActivity(`a traité la demande ${claim.reference}`, "claims");
      return db.claims[idx];
    },
  },

  users: {
    list: async (): Promise<User[]> => {
      await delay();
      return [...db.users];
    },
  },

  activity: {
    list: async (): Promise<ActivityLog[]> => {
      await delay();
      return [...db.activity];
    },
  },

  notifications: {
    list: async (): Promise<Notification[]> => {
      await delay();
      return [...db.notifications];
    },
  },

  dashboard: {
    kpis: async (): Promise<DashboardKPI[]> => {
      await delay();
      return generateDashboardKPIs(db.insureds, db.contracts, db.hospitals, db.claims);
    },
    charts: async () => {
      await delay();
      return generateChartData();
    },
  },
};