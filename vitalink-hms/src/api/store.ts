// In-memory + localStorage backed store for the mock API.
// This file bridges MSW-style endpoints to the deterministic seed data.

import {
  PATIENTS, MEDICAL_RECORDS, CONSULTATIONS, MEDICAL_ACTS, INVOICES, REFUNDS,
  USERS, INSURANCE_COMPANIES, INSURANCE_CONTRACTS, MEDICAL_SERVICES, ACTS_CATALOG,
  HOSPITAL, computeDashboardKPI,
} from "@/mocks/seed";
import { faker } from "@/lib/faker";
import type {
  Patient, MedicalRecord, Consultation, MedicalAct, Invoice, Refund,
  User, MedicalService, ActCatalogItem,
  DashboardKPI, MonthlyRevenuePoint, ServiceOccupancy, Allergy, MedicalCondition,
} from "@/types";

// In-memory working copy (mutations persist for the session)
const state = {
  patients: [...PATIENTS],
  records: [...MEDICAL_RECORDS],
  consultations: [...CONSULTATIONS],
  acts: [...MEDICAL_ACTS],
  invoices: [...INVOICES],
  refunds: [...REFUNDS],
  users: [...USERS],
  services: [...MEDICAL_SERVICES],
  actsCatalog: [...ACTS_CATALOG],
};

let counter = {
  patients: PATIENTS.length, users: USERS.length, invoices: INVOICES.length,
  refunds: REFUNDS.length, consultations: CONSULTATIONS.length, acts: MEDICAL_ACTS.length,
  services: MEDICAL_SERVICES.length, actsCat: ACTS_CATALOG.length,
};

const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const now = () => new Date().toISOString();

// ============== PATIENTS ==============
export const getPatients = () => state.patients;
export const getPatient = (id: string) => state.patients.find(p => p.id === id);
export const createPatient = (p: Omit<Patient, "id" | "createdAt" | "updatedAt">) => {
  counter.patients++;
  const np: Patient = { ...p, id: `pat-${counter.patients}`, createdAt: now(), updatedAt: now() };
  state.patients = [np, ...state.patients];
  return np;
};
export const updatePatient = (id: string, patch: Partial<Patient>) => {
  state.patients = state.patients.map(p => p.id === id ? { ...p, ...patch, updatedAt: now() } : p);
  return state.patients.find(p => p.id === id);
};
export const deletePatient = (id: string) => {
  state.patients = state.patients.filter(p => p.id !== id);
  return { ok: true };
};

// ============== MEDICAL RECORDS ==============
export const getMedicalRecord = (patientId: string): MedicalRecord =>
  state.records.find(r => r.patientId === patientId) || {
    id: `rec-${patientId}`, patientId, allergies: [], conditions: [], notes: "",
    createdAt: now(), updatedAt: now(),
  } as MedicalRecord;

export const addAllergy = (patientId: string, a: Omit<Allergy, "id" | "patientId">) => {
  let rec = state.records.find(r => r.patientId === patientId);
  if (!rec) {
    rec = { id: `rec-${patientId}`, patientId, allergies: [], conditions: [], notes: "", createdAt: now(), updatedAt: now() };
    state.records = [...state.records, rec];
  }
  const allergy: Allergy = { ...a, id: id("all"), patientId };
  rec.allergies = [...rec.allergies, allergy];
  rec.updatedAt = now();
  return allergy;
};

export const addCondition = (patientId: string, c: Omit<MedicalCondition, "id" | "patientId">) => {
  let rec = state.records.find(r => r.patientId === patientId);
  if (!rec) {
    rec = { id: `rec-${patientId}`, patientId, allergies: [], conditions: [], notes: "", createdAt: now(), updatedAt: now() };
    state.records = [...state.records, rec];
  }
  const cond: MedicalCondition = { ...c, id: id("cond"), patientId };
  rec.conditions = [...rec.conditions, cond];
  rec.updatedAt = now();
  return cond;
};

// ============== CONSULTATIONS ==============
export const getConsultations = () => state.consultations;
export const getConsultation = (id: string) => state.consultations.find(c => c.id === id);
export const createConsultation = (c: Omit<Consultation, "id" | "createdAt" | "updatedAt">) => {
  counter.consultations++;
  const nc: Consultation = { ...c, id: `cons-${counter.consultations}`, createdAt: now(), updatedAt: now() };
  state.consultations = [nc, ...state.consultations];
  return nc;
};
export const updateConsultation = (id: string, patch: Partial<Consultation>) => {
  state.consultations = state.consultations.map(c => c.id === id ? { ...c, ...patch, updatedAt: now() } : c);
  return state.consultations.find(c => c.id === id);
};

// ============== ACTS ==============
export const getActs = () => state.acts;
export const getAct = (id: string) => state.acts.find(a => a.id === id);
export const createAct = (a: Omit<MedicalAct, "id" | "createdAt" | "updatedAt">) => {
  counter.acts++;
  const na: MedicalAct = { ...a, id: `ma-${counter.acts}`, createdAt: now(), updatedAt: now() };
  state.acts = [na, ...state.acts];
  return na;
};

// ============== INVOICES ==============
export const getInvoices = () => state.invoices;
export const getInvoice = (id: string) => state.invoices.find(i => i.id === id);
export const createInvoice = (i: Omit<Invoice, "id" | "number" | "createdAt" | "updatedAt">) => {
  counter.invoices++;
  const ni: Invoice = { ...i, id: `inv-${counter.invoices}`, number: `INV-2026-${String(counter.invoices).padStart(5, "0")}`, createdAt: now(), updatedAt: now() };
  state.invoices = [ni, ...state.invoices];
  return ni;
};
export const updateInvoice = (id: string, patch: Partial<Invoice>) => {
  state.invoices = state.invoices.map(i => i.id === id ? { ...i, ...patch, updatedAt: now() } : i);
  return state.invoices.find(i => i.id === id);
};

// ============== REFUNDS ==============
export const getRefunds = () => state.refunds;
export const getRefund = (id: string) => state.refunds.find(r => r.id === id);
export const submitRefund = (invoiceId: string) => {
  const inv = state.invoices.find(i => i.id === invoiceId);
  if (!inv) throw new Error("Invoice not found");
  counter.refunds++;
  const nr: Refund = {
    id: `ref-${counter.refunds}`,
    invoiceId: inv.id,
    invoiceNumber: inv.number,
    patientId: inv.patientId,
    patientName: inv.patientName,
    insuranceCompany: inv.insuranceCompany || "—",
    amount: inv.insuranceCover,
    status: "SUBMITTED",
    submittedAt: now(),
    reference: `REF-${Date.now().toString(36).toUpperCase()}`,
    createdAt: now(),
    updatedAt: now(),
  };
  state.refunds = [nr, ...state.refunds];
  return nr;
};
export const disputeRefund = (id: string, reason: string) => {
  state.refunds = state.refunds.map(r => r.id === id ? { ...r, status: "DISPUTED", disputeReason: reason, updatedAt: now() } : r);
  return state.refunds.find(r => r.id === id);
};

// ============== USERS ==============
export const getUsers = () => state.users;
export const createUser = (u: Omit<User, "id" | "createdAt" | "updatedAt">) => {
  counter.users++;
  const nu: User = { ...u, id: `user-${counter.users}`, createdAt: now(), updatedAt: now() };
  state.users = [nu, ...state.users];
  return nu;
};
export const updateUser = (id: string, patch: Partial<User>) => {
  state.users = state.users.map(u => u.id === id ? { ...u, ...patch, updatedAt: now() } : u);
  return state.users.find(u => u.id === id);
};
export const deleteUser = (id: string) => {
  state.users = state.users.filter(u => u.id !== id);
  return { ok: true };
};

// ============== INSURANCE ==============
export const getInsuranceCompanies = () => INSURANCE_COMPANIES;
export const getInsuranceContracts = () => INSURANCE_CONTRACTS;

// ============== SETTINGS ==============
export const getMedicalServices = () => state.services;
export const getActsCatalog = () => state.actsCatalog;
export const createService = (s: Omit<MedicalService, "id">) => {
  counter.services++;
  const ns: MedicalService = { ...s, id: `srv-${counter.services}` };
  state.services = [...state.services, ns];
  return ns;
};
export const updateService = (id: string, patch: Partial<MedicalService>) => {
  state.services = state.services.map(s => s.id === id ? { ...s, ...patch } : s);
  return state.services.find(s => s.id === id);
};
export const deleteService = (id: string) => {
  state.services = state.services.filter(s => s.id !== id);
  return { ok: true };
};
export const createActCatalog = (a: Omit<ActCatalogItem, "id">) => {
  counter.actsCat++;
  const na: ActCatalogItem = { ...a, id: `actc-${counter.actsCat}` };
  state.actsCatalog = [...state.actsCatalog, na];
  return na;
};
export const updateActCatalog = (id: string, patch: Partial<ActCatalogItem>) => {
  state.actsCatalog = state.actsCatalog.map(a => a.id === id ? { ...a, ...patch } : a);
  return state.actsCatalog.find(a => a.id === id);
};
export const deleteActCatalog = (id: string) => {
  state.actsCatalog = state.actsCatalog.filter(a => a.id !== id);
  return { ok: true };
};

// ============== DASHBOARD ==============
export const getKPI = (): DashboardKPI => computeDashboardKPI();
export const computeMonthlyRevenue = (): MonthlyRevenuePoint[] => {
  const months = ["Juil", "Août", "Sept", "Oct", "Nov", "Déc", "Jan", "Fév"];
  return months.map((month) => {
    const revenue = faker.number.int({ min: 4500000, max: 8500000 });
    const refunds = faker.number.int({ min: 800000, max: 2500000 });
    return { month, revenue, refunds, net: revenue - refunds };
  });
};
export const computeServiceOccupancy = (): ServiceOccupancy[] =>
  state.services.map(s => {
    const occupied = faker.number.int({ min: Math.floor(s.capacity * 0.4), max: s.capacity });
    return {
      service: s.name,
      occupied,
      total: s.capacity,
      rate: Math.round((occupied / s.capacity) * 100),
    };
  });

export { HOSPITAL };