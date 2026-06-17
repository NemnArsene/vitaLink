# Implémentation des APIs HMS et IMS (Architecture Découplée)

Ce plan décrit la création des deux APIs backend pour l'Hôpital (HMS) et l'Assurance (IMS) en utilisant **NestJS**. Conformément aux spécifications, nous utiliserons **MongoDB** (avec des bases de données séparées), deux applications distinctes (`vitalink-hms-api` et `vitalink-ims-api`), et des **Webhooks HTTP** pour la communication asynchrone orchestrée par la Gateway.

---

## Architecture Cible

1. **Gateway (`vitalink-gateway`) :** Point d'entrée central **stateless** (pas de DB). Route les requêtes HTTP vers les bonnes APIs, auth JWT, forward webhooks.
2. **HMS API (`vitalink-hms-api`) :** API dédiée à la gestion hospitalière. MongoDB (`vitalink_hms_db`). Port 3001.
3. **IMS API (`vitalink-ims-api`) :** API dédiée à la gestion de l'assurance. MongoDB (`vitalink_ims_db`). Port 3002.

---

## Étapes de Développement

### 1. ✅ Initialisation des Projets (PHASE 1 TERMINÉE)

#### Structure créée
- `vitalink-hms-api` — Application NestJS 11 complète (port 3001)
- `vitalink-ims-api` — Application NestJS 11 complète (port 3002)

#### Modules implémentés (HMS)
- **patients** — CRUD complet avec schema Mongoose, DTOs validés, contrôleurs
- **billing** — Gestion des factures/actes médicaux, soumission à l'assurance via Gateway
- **eligibility** — Vérification de couverture via le Gateway
- **gateway-client** — Wrapper Http sécurisé (JWT `scope:hospital`) vers la Gateway
- **webhooks** — Endpoint `POST /webhooks/gateway` pour recevoir les notifications
- **health** — Health check + readiness check (MongoDB)

#### Modules implémentés (IMS)
- **policies** — CRUD polices d'assurance, souscripteurs, garanties
- **claims-processing** — Visualisation/validation/rejet des demandes de remboursement
- **eligibility-provider** — Logique d'éligibilité pour les assurés
- **gateway-client** — Wrapper Http sécurisé (JWT `scope:insurance`) vers la Gateway
- **webhooks** — Endpoint `POST /webhooks/gateway` pour recevoir les nouvelles demandes
- **health** — Health check + readiness check (MongoDB)

#### Validation
- ✅ TypeScript: `tsc --noEmit` passe sans erreur (les deux projets)
- ✅ Code review: Architecture cohérente avec le Gateway

---

### 2. ✅ Intégration Gateway (PHASE 2 TERMINÉE)

#### Gateway Stateless
- **Aucune base de données MongoDB** pour la Gateway
- Auth JWT stateless (pas de stockage refresh tokens)
- ProxyModule : routage HTTP vers HMS/IMS

#### ProxyModule
- **ProxyService** — Service centralisé de routage HTTP vers HMS/IMS avec JWT inter-services
- **HmsProxyController** — Catch-all `@All('*')` → forward vers `http://localhost:3001`
- **ImsProxyController** — Catch-all `@All('*')` → forward vers `http://localhost:3002`
- **WebhookProxyController** — Routes `POST /webhooks/hms` et `POST /webhooks/ims`

#### Routes proxy
| Route Gateway | Cible | Description |
|---|---|---|
| `/api/v1/hms/*` | HMS API:3001/* | Toutes les routes HMS |
| `/api/v1/ims/*` | IMS API:3002/* | Toutes les routes IMS |
| `/api/v1/webhooks/hms` | HMS API:3001/webhooks/gateway | Webhook → HMS |
| `/api/v1/webhooks/ims` | IMS API:3002/webhooks/gateway | Webhook → IMS |

#### Configuration
- `HMS_API_URL=http://localhost:3001` dans `.env` et `configuration.ts`
- `IMS_API_URL=http://localhost:3002` dans `.env` et `configuration.ts`
- `SERVICE_JWT_SECRET` — Secret partagé pour JWT inter-services

#### Validation
- ✅ TypeScript: `tsc --noEmit` passe sans erreur dans le Gateway
- ✅ Code review: ProxyModule bien structuré

---

### 3. ✅ Intégration Frontends + Seeders (PHASE 3 TERMINÉE)

#### Frontend Hôpital (`vitalink-hms-mvp` — port 5173)
- **`src/services/`** — Dossier de services API :
  - `api.ts` — Client Axios avec intercepteur JWT et proxy Vite → Gateway
  - `authService.tsx` — Context d'authentification (login/logout/useAuth)
  - `patientService.ts` — CRUD patients (getAll, getById, create, update, remove)
  - `billingService.ts` — Facturation (getAll, getById, create, submit)
  - `eligibilityService.ts` — Vérification d'éligibilité
  - `index.ts` — Exports centralisés
- **Pages** : Dashboard, Patients, PatientDetail, Billing, Eligibility, Login

#### Frontend Assurance (`vitalink-ims-mvp` — port 5174)
- **`src/services/`** — Dossier de services API :
  - `api.ts` — Client Axios avec intercepteur JWT et proxy Vite → Gateway
  - `authService.tsx` — Context d'authentification (login/logout/useAuth)
  - `policyService.ts` — CRUD polices (getAll, getById, create, update, remove)
  - `claimsService.ts` — Traitement demandes (getAll, getById, approve, reject)
  - `eligibilityService.ts` — Vérification d'éligibilité
  - `index.ts` — Exports centralisés
- **Pages** : Dashboard, Policies, Claims, Eligibility, Login

#### Seeders (données de test)
- **HMS** (`npm run seed`) — 4 patients + 3 factures avec actes médicaux
- **IMS** (`npm run seed`) — 3 polices avec garanties + 2 demandes de remboursement

#### Validation
- ✅ npm install: packages installés dans chaque frontend
- ✅ TypeScript: `tsc --noEmit` passe sans erreur dans les deux APIs
- ✅ Architecture: Services séparés par domaine métier

---

### 4. 🔲 Tests & Déploiement (Phase 4 - À faire)

#### Automated Tests
- Tests unitaires (Jest) pour le ProxyModule et les gateway-client services
- Tests E2E pour les webhooks

### Vérification manuelle
```bash
# 1. Lancer MongoDB
mongod

# 2. Seeder les données
cd vitalink-hms-api && npm run seed
cd vitalink-ims-api && npm run seed

# 3. Démarrer tous les services
cd vitalink-gateway && npm run start:dev    # port 3000
cd vitalink-hms-api && npm run start:dev   # port 3001
cd vitalink-ims-api && npm run start:dev   # port 3002
cd vitalink-hms && npm run dev         # port 5173
cd vitalink-ims && npm run dev         # port 5174

# 4. Tester le flux complet
```

#### Documentation
- `integration_architecture.md` — Architecture d'intégration complète
