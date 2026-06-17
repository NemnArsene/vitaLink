# Architecture d'Intégration - VitaLink Platform

## Vue d'ensemble

La plateforme VitaLink utilise une architecture **Gateway-centric** où la Gateway (`vitalink-gateway`, port 3000) est le point d'entrée unique pour tous les clients (frontends, services externes). Les deux APIs métier (`vitalink-hms-api`, port 3001 et `vitalink-ims-api`, port 3002) communiquent entre elles **uniquement via la Gateway**.

---

## Principe Architecture : Gateway Stateless

**La Gateway n'a PAS de base de données.** C'est un reverse proxy purement stateless.

| Composant | Base de données | Rôle |
|---|---|---|
| **Gateway** | ❌ Aucune | Route les requêtes, auth JWT, forward webhooks |
| **HMS API** | `vitalink_hms_db` | Patients, factures, actes médicaux |
| **IMS API** | `vitalink_ims_db` | Polices, demandes remboursement, éligibilité |

La Gateway vérifie les tokens JWT (stateless) et les scopes (`scope:hospital` / `scope:insurance`), puis forward les requêtes vers la bonne API métier via HTTP. Elle ne stocke aucune donnée métier.

---

## Flux de communication

### 1. Requêtes synchrones (HTTP REST)

```
Frontend HMS (5173) ──► Gateway:3000/api/v1/hms/* ──► HMS API:3001
Frontend IMS (5174) ──► Gateway:3000/api/v1/ims/* ──► IMS API:3002
```

La Gateway agit comme un **reverse proxy** :
- Elle authentifie les requêtes via JWT
- Elle vérifie les scopes (`scope:hospital`, `scope:insurance`)
- Elle transmet la requête au service approprié avec un token de service
- Elle retourne la réponse au client

### 2. Webhooks asynchrones (POST HTTP)

```
HMS API ──► Gateway:3000/api/v1/webhooks/ims ──► IMS API:3002/webhooks/gateway
IMS API ──► Gateway:3000/api/v1/webhooks/hms ──► HMS API:3001/webhooks/gateway
```

Quand un service doit notifier l'autre :
1. Le service émet un webhook vers la Gateway
2. La Gateway forward le webhook vers le service cible
3. Le service cible traite l'événement (approuve, rejette, etc.)

### 3. Flux complet : Demande de remboursement

```
1. Frontend HMS ──POST /api/v1/hms/billing/invoices──► Gateway ──► HMS API
   → HMS crée la facture

2. Frontend HMS ──POST /api/v1/hms/billing/invoices/:id/submit──► Gateway ──► HMS API
   → HMS soumet la facture → forward claim vers IMS via Gateway

3. Frontend IMS ──GET /api/v1/ims/claims-processing──► Gateway ──► IMS API
   → IMS liste les demandes en attente

4. Frontend IMS ──POST /api/v1/ims/claims-processing/:id/approve──► Gateway ──► IMS API
   → IMS approuve → notifie HMS via webhook → Gateway forward vers HMS
   → HMS met à jour le statut de la facture

5. Frontend HMS ──GET /api/v1/hms/billing/invoices──► Gateway ──► HMS API
   → HMS affiche les factures avec le nouveau statut
```

---

## Routes Proxy (Gateway → APIs)

### Routes vers HMS API (`http://localhost:3001`)

| Route Gateway | Route HMS | Description |
|---|---|---|
| `GET /api/v1/hms/patients` | `GET /patients` | Liste des patients |
| `GET /api/v1/hms/patients/:id` | `GET /patients/:id` | Détail patient |
| `POST /api/v1/hms/patients` | `POST /patients` | Créer patient |
| `PUT /api/v1/hms/patients/:id` | `PUT /patients/:id` | Modifier patient |
| `GET /api/v1/hms/billing/invoices` | `GET /billing/invoices` | Liste factures |
| `POST /api/v1/hms/billing/invoices` | `POST /billing/invoices` | Créer facture |
| `POST /api/v1/hms/billing/invoices/:id/submit` | `POST /billing/invoices/:id/submit` | Soumettre à l'assurance |
| `POST /api/v1/hms/eligibility/check` | `POST /eligibility/check` | Vérifier éligibilité |
| `GET /api/v1/hms/health` | `GET /health` | Health check |

### Routes vers IMS API (`http://localhost:3002`)

| Route Gateway | Route IMS | Description |
|---|---|---|
| `GET /api/v1/ims/policies` | `GET /policies` | Liste polices |
| `GET /api/v1/ims/policies/:id` | `GET /policies/:id` | Détail police |
| `POST /api/v1/ims/policies` | `POST /policies` | Créer police |
| `GET /api/v1/ims/claims-processing` | `GET /claims-processing` | Liste claims |
| `POST /api/v1/ims/claims-processing/:id/approve` | `POST /claims-processing/:id/approve` | Approuver claim |
| `POST /api/v1/ims/claims-processing/:id/reject` | `POST /claims-processing/:id/reject` | Rejeter claim |
| `POST /api/v1/ims/eligibility/check` | `POST /eligibility/check` | Vérifier éligibilité |
| `GET /api/v1/ims/health` | `GET /health` | Health check |

### Routes Webhooks

| Route Gateway | Cible | Description |
|---|---|---|
| `POST /api/v1/webhooks/hms` | `POST /webhooks/gateway` sur HMS | Webhook → HMS |
| `POST /api/v1/webhooks/ims` | `POST /webhooks/gateway` sur IMS | Webhook → IMS |

---

## Authentification inter-services

Chaque API génère un JWT de service pour communiquer avec la Gateway :

```typescript
// HMS API → Gateway (scope:hospital)
{
  sub: 'hms-service',
  scope: 'scope:hospital',
  entityId: 'hms-001',
  entityType: 'hospital',
  permissions: ['claims:write', 'eligibility:read']
}

// IMS API → Gateway (scope:insurance)
{
  sub: 'ims-service',
  scope: 'scope:insurance',
  entityId: 'ims-001',
  entityType: 'insurance',
  permissions: ['claims:write', 'claims:read']
}
```

Le secret JWT (`SERVICE_JWT_SECRET`) est partagé entre les 3 services.

---

## Variables d'environnement

### Gateway (stateless — pas de DB)
```env
PORT=3000
HMS_API_URL=http://localhost:3001
IMS_API_URL=http://localhost:3002
SERVICE_JWT_SECRET=shared-jwt-secret
```

### HMS API
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=vitalink_hms_db
GATEWAY_URL=http://localhost:3000
GATEWAY_JWT_SECRET=shared-jwt-secret
```

### IMS API
```env
PORT=3002
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=vitalink_ims_db
GATEWAY_URL=http://localhost:3000
GATEWAY_JWT_SECRET=shared-jwt-secret
```

---

## Seeders (données de test)

Pour peupler les bases de données avec des données de test :

```bash
# Seed HMS (patients + factures)
cd vitalink-hms-api && npm run seed

# Seed IMS (polices + demandes)
cd vitalink-ims-api && npm run seed
```

### Données HMS seedées
- 4 patients (Amadou Diallo, Aïcha Koné, Ibrahim Traoré, Fatou Bamba)
- 3 factures (brouillon, soumise, approuvée) avec des actes médicaux réalistes

### Données IMS seedées
- 3 polices (NSIA Assurances, Saham Assurance) avec garanties détaillées
- 2 demandes de remboursement (reçue, approuvée)

---

## Intégration Frontend

### vitalink-hms-mvp (Frontend Hôpital — port 5173)
- Proxy Vite : `/api` → `http://localhost:3000` (Gateway)
- Services dans `src/services/` :
  - `api.ts` — Client Axios avec intercepteur JWT
  - `patientService.ts` — CRUD patients
  - `billingService.ts` — Facturation et soumission
  - `eligibilityService.ts` — Vérification couverture
  - `authService.tsx` — Context d'authentification

### vitalink-ims-mvp (Frontend Assurance — port 5174)
- Proxy Vite : `/api` → `http://localhost:3000` (Gateway)
- Services dans `src/services/` :
  - `api.ts` — Client Axios avec intercepteur JWT
  - `policyService.ts` — Gestion polices
  - `claimsService.ts` — Traitement demandes
  - `eligibilityService.ts` — Vérification éligibilité
  - `authService.tsx` — Context d'authentification

---

## Ordre de démarrage

```bash
# 1. MongoDB (doit tourner en premier)
mongod

# 2. Seed les données de test
cd vitalink-hms-api && npm run seed
cd vitalink-ims-api && npm run seed

# 3. Gateway (point d'entrée central — pas de DB)
cd vitalink-gateway && npm run start:dev

# 4. APIs métier
cd vitalink-hms-api && npm run start:dev   # port 3001
cd vitalink-ims-api && npm run start:dev   # port 3002

# 5. Frontends
cd vitalink-hms-mvp && npm run dev         # port 5173
cd vitalink-ims-mvp && npm run dev         # port 5174
```
