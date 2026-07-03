import { coreHttpClient } from "./http";
import type { Patient } from "@/types";

const STORAGE_KEY = "hms-patients-cache";

// Normalize MongoDB raw document → frontend Patient
function normalizePatient(raw: any): Patient {
  // If already normalized (has id + birthDate string), return as-is
  if (raw.id && raw.birthDate && typeof raw.birthDate === "string" && raw.insuranceStatus !== undefined) return raw;

  const oid = raw._id?.$oid || raw._id || "";
  const birthDate = raw.dateOfBirth?.$date || raw.dateOfBirth || "";
  const createdAt = raw.createdAt?.$date || raw.createdAt || "";
  const updatedAt = raw.updatedAt?.$date || raw.updatedAt || "";

  return {
    id: String(oid),
    fileNumber: raw.medicalRecordNumber || "",
    firstName: raw.firstName || "",
    lastName: raw.lastName || "",
    gender: raw.gender || "M",
    birthDate,
    bloodGroup: (raw.bloodType || "O+") as Patient["bloodGroup"],
    phone: raw.phone || "",
    email: raw.email || "",
    address: typeof raw.address === "object" ? raw.address?.street || "" : raw.address || "",
    city: typeof raw.address === "object" ? raw.address?.city || "" : raw.city || "",
    insuranceNumber: raw.insuranceCardNumber || "",
    insuranceCompany: raw.insuranceProvider || "",
    insuranceStatus: raw.insuranceStatus as Patient["insuranceStatus"] || undefined,
    insuranceCoveragePercentage: raw.insuranceCoveragePercentage ?? undefined,
    emergencyContact: typeof raw.emergencyContact === "object" ? raw.emergencyContact?.name || "" : raw.emergencyContact || "",
    emergencyPhone: typeof raw.emergencyContact === "object" ? raw.emergencyContact?.phone || "" : raw.emergencyPhone || "",
    status: (raw.status || "active").toUpperCase() as Patient["status"],
    allergies: raw.allergies || [],
    antecedents: raw.antecedents || [],
    createdAt,
    updatedAt,
  };
}

function asArray(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.content)) return res.content;
  if (Array.isArray(res?.patients)) return res.patients;
  if (Array.isArray(res?.items)) return res.items;
  return [];
}

// Convert frontend Patient to backend DTO
function toApiPatient(dto: any) {
  return {
    firstName: dto.firstName || "",
    lastName: dto.lastName || "",
    medicalRecordNumber: dto.fileNumber || "",
    dateOfBirth: dto.birthDate || undefined,
    gender: dto.gender || "M",
    phone: dto.phone || "",
    email: dto.email || undefined,
    address: {
      street: dto.address || "",
      city: dto.city || "",
      state: "",
      zipCode: "",
    },
    emergencyContact: {
      name: dto.emergencyContact || "",
      phone: dto.emergencyPhone || "",
      relationship: "Proche",
    },
    bloodType: dto.bloodGroup || undefined,
    allergies: dto.allergies || [],
    antecedents: dto.antecedents || [],
    insuranceCardNumber: dto.insuranceNumber || undefined,
    insuranceProvider: dto.insuranceCompany || undefined,
  };
}

// localStorage cache (N+1 pattern)
function cachePatients(patients: Patient[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(patients)); } catch {}
}

function getCachedPatients(): Patient[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function getCachedPatient(id: string): Patient | null {
  const all = getCachedPatients();
  return all?.find(p => p.id === id) || null;
}

export const PatientsService = {
  list: async () => {
    const { data } = await coreHttpClient.get("/patients");
    const normalized = asArray(data.data).map(normalizePatient);
    cachePatients(normalized);
    return normalized;
  },

  getById: async (id: string) => {
    // N+1: try localStorage first, fallback to API
    const cached = getCachedPatient(id);
    if (cached) return cached;

    const { data } = await coreHttpClient.get(`/patients/${id}`);
    return normalizePatient(data.data);
  },

  create: async (dto: any) => {
    const apiDto = toApiPatient(dto);
    const { data } = await coreHttpClient.post("/patients", apiDto);
    return normalizePatient(data.data);
  },

  update: async (id: string, dto: any) => {
    const apiDto = toApiPatient(dto);
    const { data } = await coreHttpClient.put(`/patients/${id}`, apiDto);
    return normalizePatient(data.data);
  },

  remove: async (id: string) => {
    await coreHttpClient.delete(`/patients/${id}`);
  }
};
