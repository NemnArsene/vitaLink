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
