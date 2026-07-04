# Plan Démo Remboursement — VitaLink

## Architecture : qui parle à qui ?

```
                    ┌──────────────────────────────────────────┐
                    │           FRONTEND HMS (:5173)           │
                    │  Patients | Consultations | Ordonnances  │
                    │  Billing | Refunds | PatientDetail       │
                    └──────┬────────────────────────┬──────────┘
                           │ coreHttpClient (:3001)  │
                           ▼                        ▼
┌────────────────────────────────────┐    ┌──────────────────────────────┐
│         HMS API (:3001)            │    │    GATEWAY API (:3000)       │
│  Patients ✓ | Consultations ✓     │    │  /eligibility/check → IMS   │
│  Prescriptions ✓ | Billing ✓     │    │  /claims → IMS              │
│  Eligibility → Gateway            │    │  /claims/:id/decision → HMS │
│  Billing.submit → Gateway         │    │                              │
└──────────┬─────────────────────────┘    └──────┬───────────────────────┘
           │ passe par la Gateway                 │
           ▼                                      ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         IMS API (:3002)                              │
│    EligibilityProvider | ClaimsProcessing | Policies | Insureds     │
└──────────────────────────────────────────────────────────────────────┘
```

**Règle :** Le frontend HMS parle UNIQUEMENT au HMS API (port 3001) pour les flux démo.
La Gateway est utilisée **en interne** par le HMS API pour communiquer avec l'IMS.

---

## Diagnostic des problèmes

| Module | Backend API | Frontend Service | Page | Statut |
|--------|------------|-----------------|------|--------|
| **Consultations** | ✅ OK (`@Put` ajouté) | ✅ OK (TanStack Query) | ✅ Appels API réels | ✅ OK |
| **Prescriptions** | ✅ OK | ✅ OK (créé) | ✅ OK (mocks → API) | ✅ OK |
| **Billing create/list** | ✅ OK | ✅ OK | ✅ Appels API réels | ✅ OK |
| **Billing submit** | ✅ OK (`submitToInsurance` → Gateway) | ✅ OK (ajouté) | ✅ OK (RefundsService → BillingService) | ✅ OK |
| **Patients** | ✅ OK | ✅ OK | ✅ Appels API réels | ✅ OK |
| **PatientDetail** | ✅ OK | ✅ OK | ✅ Appels API réels | ✅ OK |
| **Refunds** | ❌ Pas de endpoint `/refunds` | ⚠️ Via Gateway (casse) | ⚠️ Utilise Gateway | ⏸️ Skip pour démo |

---

## Phase 0 — Infrastructure & Seed Data

### 0.1 Correctifs backend

- [x] **ConsultationsController** : ajouter `@Put(':id')` à côté de `@Patch(':id')` pour que le frontend `PUT /consultations/:id` fonctionne
- [ ] Vérifier que `BillingService.submitToInsurance()` → `GatewayClientService.submitClaim()` → DTO aligné avec la Gateway

### 0.2 Mise à jour des seeds HMS

- [x] Ajouter 10 patients avec `insuranceCardNumber` alignés IMS
- [x] Ajouter 20 consultations liées aux patients
- [x] Ajouter 15 prescriptions liées aux consultations
- [x] Ajouter 10 factures (brouillon, soumise, approuvée, payee, rejetee, remboursee)
- [x] Mettre à jour les numéros de cartes d'assurance pour matcher les policies IMS

### 0.3 Mise à jour des seeds IMS

- [x] Ajouter 7 insureds (1 par policy, avec `consommationPlafond` à 0)
- [x] Garanties déjà cohérentes sur les policies
- [x] Ajouter 8 claims (recue, en_revision, approuvee, rejetee, remboursee)
- [x] Corriger statut `'payee'` → `'remboursee'` dans les claims existants

### 0.4 Mapping HMS ↔ IMS

| Patient HMS | Carte Assurance | Policy IMS | Insured IMS | Couverture |
|------------|----------------|------------|-------------|-----------|
| Amadou Diallo | NSIA-2026-001234 | POL-2026-001234 | INS-2026-001 | 80% |
| Aicha Kone | SAHAM-2026-001235 | POL-2026-001235 | INS-2026-002 | 90% |
| Ibrahim Traore | ACTIVA-2026-001236 | POL-2026-001236 | INS-2026-003 | 85% |
| Jean Kamga | NSIA-2026-001237 | POL-2026-001237 | INS-2026-004 | 90% |
| Fatou Bamba | CNAMGS-2026-001238 | POL-2026-001238 | INS-2026-005 | 100% |
| Paul Nguena | ASCOMA-2025-009999 | POL-2025-009999 | INS-2026-006 | EXPIRÉ → NON ASSURÉ |
| Fatou Diop | AXA-2026-002000 | POL-2026-002000 | INS-2026-007 | SUSPENDU → NON ASSURÉ |

### 0.5 Scripts de démarrage

- [ ] Créer un script `start-all.ps1` qui lance dans l'ordre :
  1. MongoDB (si local)
  2. `npm run seed` dans hms-api
  3. `npm run seed` dans ims-api
  4. `npm run start:dev` dans gateway
  5. `npm run start:dev` dans hms-api
  6. `npm run start:dev` dans ims-api
  7. `npm run dev` dans hms (frontend)
  8. `npm run dev` dans ims (frontend)

---

## Phase 1 — Flux d'Éligibilité (Patient → Vérification Assurance)

**Objectif :** Agent saisit un patient → Gateway interroge IMS → Retour visuel : assuré ✅ / non assuré ❌ + couverture

### Backend (✅ déjà fonctionnel)

- [x] `POST /api/v1/patients` → appelle `EligibilityService` → Gateway → IMS
- [x] `POST /api/v1/eligibility/check` (IMS) → lookup Policy par `insuranceCardNumber`
- [ ] **(Optionnel)** Vérifier aussi le plafond de l'assuré + retourner montant restant

### Frontend HMS

- [x] `PatientsService.create()` → appelle déjà `POST /api/v1/patients` (coreHttpClient)
- [x] `PatientsService.list()` → appelle déjà `GET /api/v1/patients`
- [x] `Patients.tsx` → utilise déjà TanStack Query avec services réels
- [ ] Afficher résultat éligibilité en temps réel dans la `CreatePatientModal`
- [ ] Afficher le badge dans le tableau : vert (ASSURE) / rouge (NON_ASSURE) / orange (EN_ATTENTE)
- [ ] `PatientDetail.tsx` — afficher détail couverture (provider, policyNumber, expiryDate, percentage)

**Fichiers :** `src/pages/Patients.tsx`, `src/pages/PatientDetail.tsx`

### Test

- [ ] Créer patient avec carte `NSIA-2026-001234` → Badge "Assuré ✅ (80%)"
- [ ] Créer patient avec carte `ASCOMA-2025-009999` → Badge "Non assuré ❌"
- [ ] Créer patient sans carte → "Non assuré ❌"

---

## Phase 2 — Consultation & Prescription (Médecin)

**Objectif :** Médecin liste ses patients du jour → ouvre dossier → diagnostic + prescription → aperçu ordonnance

### Backend HMS API (✅ déjà fonctionnel)

- [x] `GET /api/v1/consultations/doctor/:doctorName/daily`
- [x] `POST /api/v1/consultations`
- [x] `GET /api/v1/consultations/patient/:patientId`
- [x] `POST /api/v1/prescriptions`
- [x] `GET /api/v1/prescriptions/patient/:patientId`
- [x] `GET /api/v1/prescriptions`
- [x] **CORRECTIF :** Ajouter `@Put(':id')` dans `ConsultationsController` (le frontend appelle `PUT` mais le backend expose `@Patch`)

### Frontend Prescriptions

- [x] **CRÉER** `src/services/prescriptions.service.ts` (list, getById, getByPatient, create, invalidate)

### Frontend Ordonnances.tsx

- [x] Remplacer les mocks inline par des appels API réels :
  - `useQuery` → `PrescriptionsService.list()`
  - `useMutation` → `PrescriptionsService.create()`
  - `useQuery` → `PatientsService.list()` pour le sélecteur patient
- [x] Conserver l'aperçu / impression (généré côté client)
- [x] Ajout du sélecteur patient (dropdown) dans `NewPrescriptionModal`
- [x] Nom du médecin via `useAuthStore`

**Fichiers :** `src/pages/Ordonnances.tsx`, `src/services/prescriptions.service.ts`, `src/services/index.ts`

### Test

- [ ] Se connecter en médecin (`medecin@hgd.cm / password`)
- [ ] Créer consultation avec diagnostic
- [ ] Créer prescription avec médicaments
- [ ] Aperçu ordonnance imprimable


---

## Phase 3 — Facturation & Demande de Remboursement (Caissier)

**Objectif :** Caissier génère facture → calcul auto selon couverture → soumet à l'assurance via Gateway

### Backend HMS API (✅ déjà fonctionnel)

- [x] `POST /api/v1/billing/invoices` → créer facture (brouillon)
- [x] `POST /api/v1/billing/invoices/:id/submit` → soumettre à l'assurance
  - → `GatewayClientService.submitClaim()` → Gateway `POST /api/v1/claims` → IMS `POST /claims-processing`
- [x] `GET /api/v1/billing/invoices`
- [x] `GET /api/v1/billing/invoices/:id`

### Frontend BillingService

- [x] **AJOUTER** `submitToInsurance` dans `src/services/billing.service.ts`

### Frontend Billing.tsx

- [x] Remplacer `RefundsService.submit(invoiceId)` par `BillingService.submitToInsurance(id)`
- [x] Supprimer l'import de `RefundsService`
- [ ] Calcul automatique de la couverture :
  - Récupérer `insuranceCoveragePercentage` du patient
  - Part assurance = `montantTotal × coveragePercentage / 100`
  - Part patient = `montantTotal - partAssurance`
- [ ] Ajouter statut "Soumise" après soumission
- [ ] Afficher `insuranceClaimId` retourné par l'API après soumission

**Fichiers :** `src/services/billing.service.ts`, `src/pages/Billing.tsx`, `src/pages/Refunds.tsx` (si nécessaire)

### Test

- [ ] Se connecter en caissier/facturation (`facturation@hgd.cm / password`)
- [ ] Créer facture pour patient assuré (ex: consultation = 25 000 FCFA)
- [ ] Voir : part assurance (80%) = 20 000 FCFA, part patient = 5 000 FCFA
- [ ] Soumettre à l'assurance → statut "Soumise" + ID de remboursement

---

## Phase 4 — Traitement côté Assurance (IMS)

**Objectif :** Agent IMS voit les demandes → approuve/rejette → mise à jour plafond → notification HMS

### Backend IMS (✅ endpoints existants)

- [x] `GET /api/v1/claims-processing` → liste des demandes
- [x] `POST /api/v1/claims-processing` → créer demande
- [x] `POST /api/v1/claims-processing/:id/analyze` → mettre en révision
- [x] `POST /api/v1/claims-processing/:id/approve` → approuver
- [x] `POST /api/v1/claims-processing/:id/reject` → rejeter
- [x] `POST /api/v1/claims-processing/:id/pay` → payer/rembourser

### ⚠️ Correctifs nécessaires (IMS API)

- [ ] **Déduire le plafond lors de l'approbation** :
  `ClaimsProcessingService.approve()` → appeler `InsuredsService.updatePlafondConsumption()`
- [ ] **Vérifier le plafond avant approbation** :
  Récupérer l'assuré via policy → insured → vérifier plafond restant ≥ montantApprouve
- [ ] **Gateway notification → webhook HMS** (vérifier le chemin complet) :
  IMS approve → `GatewayClientService.notifyClaimDecision('approved')`
  → Gateway `POST /api/v1/claims/:id/decision` → ApiController.claimDecision()
  → `ProxyService.forwardRequest('hms', ...)` → HMS `POST /webhooks/gateway`
  → HMS WebhooksService → update invoice `statut = 'approuvee'`

### Frontend IMS

- [ ] `useApi.ts` — remplacer les stubs par des appels API réels :
  - `useClaims()` → `GET /api/v1/claims-processing` (via coreHttpClient IMS)
  - `useProcessClaim()` → `POST /api/v1/claims-processing/:id/approve` / `reject` / `pay` / `analyze`
  - `useKPIs()` → `GET /api/v1/reports/dashboard`
  - `useCharts()` → `GET /api/v1/reports/claims-overview`
- [ ] `Claims.tsx` — vérifier que les actions envoient aux bons endpoints
- [ ] `Dashboard.tsx` — connecter KPIs et graphiques aux vraies données

**Fichiers :** `src/hooks/useApi.ts`, `src/pages/Claims.tsx`, `src/pages/Dashboard.tsx`

### Test

- [ ] Se connecter à l'IMS (`directeur@ims.com / Directeur@123`)
- [ ] Voir la liste des demandes de remboursement
- [ ] Ouvrir une demande → détails (patient, montant, hôpital)
- [ ] Approuver avec un montant (ex: 20 000 FCFA)
- [ ] Vérifier que le plafond de l'assuré est déduit
- [ ] Vérifier que la facture côté HMS passe à "Approuvée"

---

## Phase 5 — Tests & Finalisation

### 5.1 Flux complet

- [ ] **1. Agent HMS** crée patient Amadou Diallo (carte: `NSIA-2026-001234`)
  - → Badge "Assuré ✅ (80%)" visible
- [ ] **2. Médecin HMS** consulte le patient, pose diagnostic, prescrit médicaments
  - → Ordonnance imprimable
- [ ] **3. Caissier HMS** génère facture (ex: consultation = 25 000 FCFA)
  - → Part assurance (80%) = 20 000 FCFA, Part patient = 5 000 FCFA
  - → Soumission à l'assurance
- [ ] **4. IMS** reçoit la demande → agent approuve 20 000 FCFA
  - → Plafond assuré déduit
  - → Webhook notifie HMS → facture passe "Approuvée"
- [ ] **5. IMS** effectue le paiement
  - → Facture HMS passe "Remboursée"

### 5.2 Correction des bugs

- [ ] Test éligibilité patient sans carte → `NON_ASSURE`
- [ ] Test soumission facture sans insurance → message clair
- [ ] Test refus IMS → rejet → facture HMS passe "Rejetée"
- [ ] Vérifier les messages d'erreur dans la chaîne Gateway (timeout, 401, etc.)

### 5.3 Jeu de données démo

| Patient | Carte | Résultat |
|---------|-------|----------|
| Amadou Diallo | `NSIA-2026-001234` | Assuré ✅ 80% |
| Aicha Kone | `SAHAM-2026-001235` | Assuré ✅ 90% |
| Fatou Bamba | `CNAMGS-2026-001238` | Assuré ✅ 100% |
| Paul Nguena | `ASCOMA-2025-009999` | Non assuré ❌ (expiré) |
| Fatou Diop | `AXA-2026-002000` | Non assuré ❌ (suspendu) |
| (aucune) | — | Non assuré ❌ |

### 5.4 Fichiers modifiés (récapitulatif)

| Projet | Fichier | Changement | Priorité | Statut |
|--------|---------|-----------|----------|--------|
| **hms-api** | `consultations.controller.ts` | Ajouter `@Put(':id')` | 🔴 Haute | ✅ |
| **hms-api** | `src/seeders/seed.ts` | + patients, consultations, prescriptions, factures | 🔴 Haute | ✅ |
| **ims-api** | `src/seeders/seed.ts` | + insureds, claims, fix 'payee' | 🔴 Haute | ✅ |
| **ims-api** | `claims-processing.service.ts` | Déduire plafond dans approve() | 🔴 Haute | ⏳ |
| **ims-api** | `insureds.service.ts` | Exposer updatePlafondConsumption() | 🔴 Haute | ⏳ |
| **ims-api** | `eligibility-provider.service.ts` | Optionnel: checker plafond | 🟡 Moyenne | ⏳ |
| **hms frontend** | `src/services/prescriptions.service.ts` | **CRÉER** le fichier | 🔴 Haute | ✅ |
| **hms frontend** | `src/services/billing.service.ts` | Ajouter submitToInsurance() | 🔴 Haute | ✅ |
| **hms frontend** | `src/services/index.ts` | Exporter prescriptions.service | 🔴 Haute | ✅ |
| **hms frontend** | `src/pages/Ordonnances.tsx` | Remplacer mocks par API réelle | 🔴 Haute | ✅ |
| **hms frontend** | `src/pages/Billing.tsx` | Fixer submit → BillingService | 🔴 Haute | ✅ |
| **hms frontend** | `src/pages/Consultations.tsx` | Fixer payload DTO (forbidNonWhitelisted) | 🔴 Haute | ✅ |
| **hms frontend** | `src/components/ui/DataTable.tsx` | key prop sur empty state tr | 🟡 Moyenne | ✅ |
| **hms frontend** | `src/pages/Patients.tsx` | Afficher couverture temps réel | 🟡 Moyenne | ⏳ |
| **hms frontend** | `src/pages/PatientDetail.tsx` | Afficher détail couverture | 🟡 Moyenne | ⏳ |
| **ims frontend** | `src/hooks/useApi.ts` | Stubs → appels API réels | 🔴 Haute | ⏳ |
| **ims frontend** | `src/pages/Claims.tsx` | Vérifier actions API | 🔴 Haute | ⏳ |
| **ims frontend** | `src/pages/Dashboard.tsx` | KPIs réels | 🟡 Moyenne | ⏳ |

---

## Résumé des blocs

| Phase | Dépend de | Statut |
|-------|-----------|--------|
| 0 — Correctifs backend + Seeds | — | ✅ Terminé |
| 1 — Éligibilité | Phase 0 | 🔴 À faire |
| 2 — Consultation + Prescription | Phase 0 | ✅ Terminé (backend + frontend) |
| 3 — Facturation | Phase 0 + 1 | ✅ Terminé (submit BillingService ✅, seeds ✅) |
| 4 — Traitement IMS | Phase 0 | 🔴 À faire |
| 5 — Tests finaux | Phases 0-4 | 🔴 À faire |
