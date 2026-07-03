// MSW-style mock API client using local storage + in-memory delays.
// Simulates an asynchronous network for TanStack Query.

import * as db from "./store";
import type {
  Patient, Consultation, MedicalAct, Invoice,
  User, MedicalRecord, MedicalService, ActCatalogItem, DashboardKPI, MonthlyRevenuePoint, ServiceOccupancy,
  AuditLogEntry, PharmacyItem,
} from "@/types";

// Simulate network latency
const delay = (ms = 250) => new Promise<void>(r => setTimeout(r, ms));

// -------- Patients --------
export const PatientsAPI = {
  async list(params?: { q?: string; status?: string; insurance?: string }) {
    await delay();
    let list = db.getPatients();
    if (params?.q) {
      const q = params.q.toLowerCase();
      list = list.filter(p =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.fileNumber.toLowerCase().includes(q) ||
        p.phone.includes(q)
      );
    }
    if (params?.status && params.status !== "ALL") list = list.filter(p => p.status === params.status);
    if (params?.insurance && params.insurance !== "ALL") list = list.filter(p => p.insuranceCompany === params.insurance);
    return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  async get(id: string) { await delay(); return db.getPatient(id); },
  async create(p: Omit<Patient, "id" | "createdAt" | "updatedAt">) { await delay(); return db.createPatient(p); },
  async update(id: string, p: Partial<Patient>) { await delay(); return db.updatePatient(id, p); },
  async remove(id: string) { await delay(); return db.deletePatient(id); },
};

// -------- Medical Records --------
export const MedicalRecordsAPI = {
  async getByPatient(patientId: string): Promise<MedicalRecord> { await delay(); return db.getMedicalRecord(patientId); },
  async addAllergy(patientId: string, a: Omit<any, "id" | "patientId">) { await delay(); return db.addAllergy(patientId, a); },
  async addCondition(patientId: string, c: Omit<any, "id" | "patientId">) { await delay(); return db.addCondition(patientId, c); },
};

// -------- Consultations --------
export const ConsultationsAPI = {
  async list() { await delay(); return db.getConsultations(); },
  async get(id: string) { await delay(); return db.getConsultation(id); },
  async create(c: Omit<Consultation, "id" | "createdAt" | "updatedAt">) { await delay(); return db.createConsultation(c); },
  async update(id: string, patch: Partial<Consultation>) { await delay(); return db.updateConsultation(id, patch); },
};

// -------- Medical Acts --------
export const ActsAPI = {
  async list() { await delay(); return db.getActs(); },
  async get(id: string) { await delay(); return db.getAct(id); },
  async create(a: Omit<MedicalAct, "id" | "createdAt" | "updatedAt">) { await delay(); return db.createAct(a); },
};

// -------- Billing --------
export const InvoicesAPI = {
  async list() { await delay(); return db.getInvoices(); },
  async get(id: string) { await delay(); return db.getInvoice(id); },
  async create(i: Omit<Invoice, "id" | "number" | "createdAt" | "updatedAt">) { await delay(); return db.createInvoice(i); },
  async update(id: string, patch: Partial<Invoice>) { await delay(); return db.updateInvoice(id, patch); },
};

// -------- Refunds --------
export const RefundsAPI = {
  async list() { await delay(); return db.getRefunds(); },
  async get(id: string) { await delay(); return db.getRefund(id); },
  async submit(invoiceId: string) { await delay(); return db.submitRefund(invoiceId); },
  async dispute(id: string, reason: string) { await delay(); return db.disputeRefund(id, reason); },
};

// -------- Users --------
export const UsersAPI = {
  async list() { await delay(); return db.getUsers(); },
  async create(u: Omit<User, "id" | "createdAt" | "updatedAt">) { await delay(); return db.createUser(u); },
  async update(id: string, patch: Partial<User>) { await delay(); return db.updateUser(id, patch); },
  async remove(id: string) { await delay(); return db.deleteUser(id); },
};

// -------- Insurance --------
export const InsuranceAPI = {
  async companies() { await delay(); return db.getInsuranceCompanies(); },
  async contracts() { await delay(); return db.getInsuranceContracts(); },
};

// -------- Settings --------
export const SettingsAPI = {
  async services() { await delay(); return db.getMedicalServices(); },
  async acts() { await delay(); return db.getActsCatalog(); },
  async createService(s: Omit<MedicalService, "id">) { await delay(); return db.createService(s); },
  async updateService(id: string, patch: Partial<MedicalService>) { await delay(); return db.updateService(id, patch); },
  async removeService(id: string) { await delay(); return db.deleteService(id); },
  async createAct(a: Omit<ActCatalogItem, "id">) { await delay(); return db.createActCatalog(a); },
  async updateAct(id: string, patch: Partial<ActCatalogItem>) { await delay(); return db.updateActCatalog(id, patch); },
  async removeAct(id: string) { await delay(); return db.deleteActCatalog(id); },
};

// -------- Dashboard --------
export const DashboardAPI = {
  async kpi(): Promise<DashboardKPI> { await delay(); return db.getKPI(); },
  async revenue(): Promise<MonthlyRevenuePoint[]> { await delay(); return db.computeMonthlyRevenue(); },
  async occupancy(): Promise<ServiceOccupancy[]> { await delay(); return db.computeServiceOccupancy(); },
};

// -------- Pharmacy --------
export const PharmacyAPI = {
  async list(): Promise<PharmacyItem[]> { await delay(); return db.getPharmacy(); },
  async get(id: string): Promise<PharmacyItem> { await delay(); return db.getPharmacyItem(id); },
  async updateStock(id: string, stock: number): Promise<PharmacyItem> { await delay(); return db.updatePharmacyStock(id, stock); },
};

// -------- Audit Logs --------
export const AuditAPI = {
  async list(params?: { actorId?: string; action?: string; entity?: string; startDate?: string; endDate?: string }): Promise<AuditLogEntry[]> { await delay(); return db.getAuditLogs(params); },
  async stats(): Promise<{ total: number; byAction: Record<string, number>; successCount: number; failureCount: number }> { await delay(); return db.getAuditStats(); },
};

// Simulated API Gateway forward to insurance (mocked)
export const GatewayAPI = {
  async submitToInsurance(_refundId: string) {
    await delay(800);
    return { success: true, gatewayRef: `GW-${Date.now()}`, receivedAt: new Date().toISOString() };
  },
};