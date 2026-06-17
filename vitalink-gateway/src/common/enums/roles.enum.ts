// ============================================================================
// RBAC Scopes — Centralized across Hospital & Insurance platforms
// ============================================================================

export enum Scope {
  HOSPITAL = 'scope:hospital',
  INSURANCE = 'scope:insurance',
  ADMIN = 'scope:admin',
  AUDITOR = 'scope:auditor',
}

export enum PlatformRole {
  // Hospital roles
  AGENT_ACCUEIL = 'agent_accueil',
  INFIRMIERE_TRIAGE = 'infirmiere_triage',
  MEDECIN = 'medecin',
  INFIRMIER_SOINS = 'infirmier_soins',
  LABORANTIN = 'laborantin',
  PHARMACIEN = 'pharmacien',
  RESPONSABLE_FACTURATION = 'responsable_facturation',
  ADMIN_HOPITAL = 'admin_hopital',
  DIRECTEUR_HOPITAL = 'directeur_hopital',

  // Insurance roles
  AGENT_ASSURANCE = 'agent_assurance',
  SOUSCRIPTEUR = 'souscripteur',
  DIRECTEUR_ASSURANCE = 'directeur_assurance',
  ACTUAIRE = 'actuaire',
  ADMIN_IT = 'admin_it',

  // Gateway roles
  GATEWAY_ADMIN = 'gateway_admin',
}

export function getScopeForRole(role: PlatformRole): Scope {
  const hospitalRoles: PlatformRole[] = [
    PlatformRole.AGENT_ACCUEIL,
    PlatformRole.INFIRMIERE_TRIAGE,
    PlatformRole.MEDECIN,
    PlatformRole.INFIRMIER_SOINS,
    PlatformRole.LABORANTIN,
    PlatformRole.PHARMACIEN,
    PlatformRole.RESPONSABLE_FACTURATION,
    PlatformRole.ADMIN_HOPITAL,
    PlatformRole.DIRECTEUR_HOPITAL,
  ];

  const insuranceRoles: PlatformRole[] = [
    PlatformRole.AGENT_ASSURANCE,
    PlatformRole.SOUSCRIPTEUR,
    PlatformRole.DIRECTEUR_ASSURANCE,
    PlatformRole.ACTUAIRE,
    PlatformRole.ADMIN_IT,
  ];

  if (hospitalRoles.includes(role)) return Scope.HOSPITAL;
  if (insuranceRoles.includes(role)) return Scope.INSURANCE;
  if (role === PlatformRole.GATEWAY_ADMIN) return Scope.ADMIN;
  return Scope.AUDITOR;
}
