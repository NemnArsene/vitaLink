export * from "./http";
export * from "./auth.service";
export * from "./patients.service";
export * from "./consultations.service";
export * from "./billing.service";
export * from "./refunds.service";
export * from "./personnel.service";
export * from "./reports.service";
export * from "./dashboard.service";
export * from "./prescriptions.service";
export * from "./import-export.service";
export * from "./messaging.service";
export * from "./settings.service";
export * from "./pharmacy.service";
export * from "./audit.service";
export * from "./written-reports.service";
export * from "./medical-records.service";
export * from "./acts.service";
export * from "./users.service";
export * from "./insurance.service";
// Mocks for unimplemented features can be routed to the old api client if needed,
// but all imports have been migrated to point to services.
