# Analyse Architecturale : Plateforme Intégrée Assurance – Hôpital

> **Objet** : Analyse de criticité, recommandations d'architecture et choix stratégique entre une application unifiée ou deux applications distinctes pour une plateforme couvrant la gestion des assurances, des hôpitaux, des patients et des remboursements.

---

## 1. Analyse de Criticité du Projet

### 1.1 Pourquoi ce projet est stratégiquement critique

La mise en place d'une plateforme reliant assureurs et hôpitaux touche à des données **ultra-sensibles** (données médicales, financières, personnelles) et à des processus métier **fortement réglementés**. Voici les axes de criticité :

| Axe | Niveau de criticité | Justification |
|---|---|---|
| Sécurité des données patients | 🔴 Très élevé | Données médicales = données personnelles sensibles (RGPD, lois locales) |
| Fiabilité du module de remboursement | 🔴 Très élevé | Toute erreur de facturation impacte directement patients et assureurs |
| Interopérabilité assureur ↔ hôpital | 🟠 Élevé | Synchronisation en temps réel entre deux entités distinctes |
| Gestion des accès et des rôles | 🔴 Très élevé | Cloisonnement strict entre ce qu'un assureur et un hôpital peuvent voir |
| Traçabilité des actes médicaux | 🔴 Très élevé | Tout acte facturé doit être auditable et non répudiable |
| Disponibilité de la plateforme | 🟠 Élevé | Une panne impacte les soins et les remboursements |

---

## 2. Architecture Optimale

### 2.1 Principes fondamentaux à respecter

Quelle que soit l'option choisie (1 ou 2 applications), l'architecture doit respecter les principes suivants :

**a) Séparation des domaines métier (Domain-Driven Design)**
- Domaine Assurance : gestion des contrats, portefeuilles patients, réseaux d'hôpitaux agréés
- Domaine Hôpital : dossier patient, soins, facturation
- Domaine Remboursement : interface commune, traitement des demandes, validation, paiement

**b) Base de données partagée mais cloisonnée**
- Une seule base de données relationnelle (ex. PostgreSQL) avec des schémas séparés par entité
- Accès aux données gouverné par des politiques de sécurité au niveau base (Row-Level Security)
- Aucun acteur ne peut accéder aux tables de l'autre directement

**c) API centrale (Backend for Frontend – BFF)**
- Une API REST ou GraphQL centrale orchestre tous les échanges
- Les deux interfaces (assureur et hôpital) consomment cette API
- Le module de remboursement est un service interne de cette API

**d) Authentification et habilitations**
- Système d'authentification centralisé (OAuth2 / OpenID Connect)
- Gestion des rôles : `ROLE_ASSUREUR`, `ROLE_HOPITAL_ADMIN`, `ROLE_MEDECIN`, `ROLE_FACTURATION`, etc.
- JWT avec expiration courte + Refresh Token

### 2.2 Schéma d'architecture cible

```
┌─────────────────────────────────────────────────────────────────────┐
│                        COUCHE PRÉSENTATION                          │
│  ┌──────────────────────────┐   ┌──────────────────────────────┐   │
│  │  Interface Assureur (Web)│   │  Interface Hôpital (Web/App) │   │
│  └────────────┬─────────────┘   └──────────────┬───────────────┘   │
└───────────────┼──────────────────────────────────┼───────────────────┘
                │                                  │
                ▼                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     API GATEWAY / BFF (NGINX + Auth)                │
│            Authentification · Rate limiting · Routage               │
└───────────────────────────────────────────────────────────────────-─┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
┌─────────────┐       ┌───────────────┐       ┌───────────────────┐
│  Service    │       │   Service     │       │  Service          │
│  Assurance  │       │   Hôpital     │       │  Remboursement    │
│             │       │               │       │  (Facturation)    │
└──────┬──────┘       └───────┬───────┘       └────────┬──────────┘
       │                      │                        │
       └──────────────────────┴────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   BASE DE DONNÉES   │
                    │   PostgreSQL        │
                    │  ┌───────────────┐  │
                    │  │ schema_assur  │  │
                    │  │ schema_hopital│  │
                    │  │ schema_rembrs │  │
                    │  │ schema_audit  │  │
                    │  └───────────────┘  │
                    └─────────────────────┘
```

---

## 3. Option 1 vs Option 2 : Analyse Comparative

### 3.1 Option A — Une seule application (Monolithe modulaire)

**Principe** : Une seule base de code, deux interfaces (tableaux de bord) différentes selon le rôle de l'utilisateur connecté.

#### ✅ Avantages

- **Cohérence des données** : pas de synchronisation entre systèmes, tout est en temps réel
- **Développement plus rapide** au démarrage (MVP)
- **Déploiement simplifié** : un seul pipeline CI/CD, une seule infrastructure
- **Module de remboursement naturellement intégré** : la facture hôpital et la demande assureur partagent le même contexte
- **Coût d'hébergement réduit** initialement
- **Maintenance unifiée** : une seule équipe technique peut tout gérer

#### ❌ Inconvénients

- **Couplage des domaines** : une erreur dans le module assurance peut impacter le module hôpital
- **Scalabilité limitée** : si les hôpitaux génèrent beaucoup plus de charge que les assureurs, on ne peut pas scaler indépendamment
- **Risque de fuite de données accru** si le cloisonnement n'est pas rigoureusement implémenté
- **Évolution complexe** à long terme si les besoins des deux acteurs divergent fortement

#### 🎯 Recommandé si :
- Vous êtes en phase MVP / lancement
- Budget et équipe limités
- Moins de 5 assureurs et moins de 20 hôpitaux à l'ouverture
- Délai de mise sur le marché court

---

### 3.2 Option B — Deux applications distinctes (Architecture découplée)

**Principe** : Une application dédiée aux assureurs, une autre dédiée aux hôpitaux. Les deux partagent une base de données commune et communiquent via une API centrale.

#### ✅ Avantages

- **Scalabilité indépendante** : l'interface hôpital peut gérer des pics de charge (urgences) sans impacter les assureurs
- **Sécurité renforcée** : surface d'attaque réduite pour chaque acteur
- **Déploiements indépendants** : une mise à jour du portail assureur n'oblige pas à redéployer le portail hôpital
- **UX optimisée** pour chaque métier : l'interface hôpital peut être très différente (mobile, tablette en salle) de celle de l'assureur (desktop, reporting)
- **Équipes indépendantes** peuvent travailler en parallèle
- **Conformité réglementaire facilitée** : les audits peuvent cibler chaque application séparément

#### ❌ Inconvénients

- **Complexité accrue** : deux projets à maintenir, deux pipelines de déploiement
- **Coût de développement plus élevé** au démarrage
- **Cohérence des données** dépend de la qualité de l'API centrale
- **Gestion des versions d'API** critique pour éviter les incompatibilités

#### 🎯 Recommandé si :
- Vous avez une vision à long terme et une roadmap ambitieuse
- Vous prévoyez une forte croissance du nombre d'hôpitaux et d'assureurs
- L'application hôpital doit être disponible en mode tablette / mobile au chevet du patient
- Réglementation locale impose une séparation des systèmes

---

### 3.3 Tableau de décision comparatif

| Critère | Option A (1 Application) | Option B (2 Applications) |
|---|---|---|
| Délai de mise en production | ⚡ Rapide | 🐢 Plus long |
| Coût initial | 💰 Faible | 💰💰 Élevé |
| Scalabilité | ⭐⭐ Limitée | ⭐⭐⭐⭐ Excellente |
| Sécurité & cloisonnement | ⭐⭐⭐ Bonne | ⭐⭐⭐⭐⭐ Excellente |
| Maintenance long terme | ⭐⭐ Complexe | ⭐⭐⭐⭐ Modulaire |
| UX par métier | ⭐⭐ Générique | ⭐⭐⭐⭐⭐ Spécialisée |
| Complexité technique | ⭐⭐ Faible | ⭐⭐⭐⭐ Élevée |
| Idéal pour MVP | ✅ Oui | ❌ Moins adapté |
| Idéal pour scale-up | ❌ Moins adapté | ✅ Oui |

---

## 4. Module de Remboursement : Architecture Détaillée

Ce module est le **point névralgique** de la plateforme. Il doit garantir la traçabilité complète de chaque acte médical jusqu'au remboursement.

### 4.1 Flux de remboursement

```
HÔPITAL                          PLATEFORME                      ASSUREUR
   │                                  │                               │
   │  1. Enregistrement acte médical  │                               │
   │ ─────────────────────────────►  │                               │
   │                                  │                               │
   │  2. Génération facture           │                               │
   │ ─────────────────────────────►  │                               │
   │                                  │  3. Notification assureur     │
   │                                  │ ─────────────────────────►   │
   │                                  │                               │
   │                                  │  4. Validation / Rejet        │
   │                                  │ ◄─────────────────────────   │
   │                                  │                               │
   │  5. Statut remboursement         │                               │
   │ ◄─────────────────────────────  │                               │
   │                                  │                               │
   │  6. Virement ou litige           │                               │
   │ ◄────────────────────────────────────────────────────────────   │
```

### 4.2 Entités du module remboursement

```
PATIENT
  └── SÉJOUR / CONSULTATION
        ├── ACTES_MÉDICAUX (codifiés, ex. CIM-10 ou CCAM)
        ├── MÉDICAMENTS
        ├── EXAMENS
        └── FACTURE
              ├── Montant total
              ├── Part patient
              ├── Part assurance
              └── DEMANDE_REMBOURSEMENT
                    ├── Statut : EN_ATTENTE | APPROUVÉ | REJETÉ | LITIGE
                    ├── Date soumission
                    ├── Date traitement
                    └── JOURNAL_AUDIT (immuable)
```

### 4.3 Règles métier critiques

- **Toute facture est immuable** une fois validée (on crée un avoir en cas d'erreur, jamais de modification directe)
- **Journal d'audit en append-only** : chaque changement de statut est loggé avec horodatage, acteur et motif
- **Alertes automatiques** : si une demande n'est pas traitée sous X jours, l'assureur et l'hôpital reçoivent une notification
- **Gestion des plafonds de couverture** : le système vérifie en temps réel si le patient est encore couvert avant de valider l'acte

---

## 5. Fonctionnalités par Module et par Acteur

### 5.1 Module Assureur

| Fonctionnalité | Description |
|---|---|
| Gestion des contrats | Création, modification, suspension de polices d'assurance |
| Enrôlement patient | Ajout d'un patient, association à un contrat, vérification d'éligibilité |
| Réseau d'hôpitaux | Ajout/retrait d'un hôpital du réseau agréé |
| Gestion des garanties | Définir ce qui est couvert (soins, médicaments, actes spéciaux) |
| Traitement des remboursements | Visualiser, approuver, rejeter ou mettre en litige une demande |
| Reporting & Analytics | Tableaux de bord : taux de sinistralité, coûts par hôpital, etc. |
| Paramétrage des tarifs | Taux de remboursement par type d'acte |
| Communication | Messagerie interne avec les hôpitaux partenaires |

### 5.2 Module Hôpital

| Fonctionnalité | Description |
|---|---|
| Gestion des patients | Admission, dossier médical, historique des soins |
| Vérification d'assurance | Confirmer en temps réel la couverture d'un patient avant les soins |
| Gestion des actes | Saisie des actes médicaux avec codes nomenclature |
| Facturation | Génération automatique de factures vers le patient et l'assureur |
| Suivi des remboursements | Voir le statut des demandes envoyées à chaque assureur |
| Gestion du personnel | Médecins, infirmiers, administrateurs par service |
| Gestion des lits / services | Occupation en temps réel |
| Alertes & Notifications | Rappels de relance pour demandes non traitées |

### 5.3 Module Remboursement (partagé)

| Fonctionnalité | Côté Hôpital | Côté Assureur |
|---|---|---|
| Soumettre une demande | ✅ | ❌ |
| Visualiser les demandes | ✅ (les siennes) | ✅ (toutes ses polices) |
| Approuver / Rejeter | ❌ | ✅ |
| Déclencher un litige | ✅ | ✅ |
| Consulter l'audit trail | ✅ (limité) | ✅ (limité) |
| Export comptable | ✅ | ✅ |

---

## 6. Recommandation Finale

### 6.1 Approche conseillée : Architecture hybride progressive

La recommandation est de **commencer avec une seule application bien modulaire**, mais en concevant dès le départ l'architecture comme si on allait la découper en deux plus tard. Cette approche est appelée **"Modular Monolith to Microservices"**.

**Phase 1 — MVP (0 à 12 mois)**
- 1 application web (React / Vue.js) avec routing conditionnel selon le rôle
- 1 API backend (Node.js / Django / Laravel) avec modules séparés
- 1 base de données PostgreSQL avec schémas séparés
- Déploiement sur un seul serveur cloud (ex. AWS, Azure ou OVH)

**Phase 2 — Croissance (12 à 24 mois)**
- Séparation de l'application en 2 frontends indépendants
- L'API centrale reste partagée mais les endpoints sont versionnés
- Ajout de files de messages (RabbitMQ / Kafka) pour le module remboursement asynchrone

**Phase 3 — Scale (24 mois+)**
- Architecture microservices complète si la volumétrie le justifie
- Déploiement Kubernetes
- Monitoring avancé (Prometheus / Grafana)

### 6.2 Stack technique recommandée

| Couche | Technologie recommandée |
|---|---|
| Frontend Assureur | React.js (Desktop-first) |
| Frontend Hôpital | React.js ou React Native (Tablette/Mobile) |
| API Backend | Node.js (NestJS) ou Python (FastAPI) |
| Base de données | PostgreSQL + Redis (cache sessions) |
| Authentification | Keycloak (OAuth2 + OIDC) |
| Notifications | Firebase Cloud Messaging ou SendGrid |
| File de messages | RabbitMQ (remboursements asynchrones) |
| Hébergement | AWS / Azure / OVH Cloud |
| CI/CD | GitHub Actions ou GitLab CI |
| Monitoring | Sentry + Grafana |

---

## 7. Points de Vigilance et Risques

| Risque | Impact | Mitigation |
|---|---|---|
| Fuite de données patient | 🔴 Critique | Chiffrement AES-256, RLS PostgreSQL, audits réguliers |
| Erreur de facturation | 🔴 Critique | Factures immuables, double validation, audit trail |
| Indisponibilité plateforme | 🟠 Élevé | Architecture HA (Haute disponibilité), backups automatiques |
| Mauvaise gestion des rôles | 🔴 Critique | Tests de pénétration, revue des permissions régulière |
| Incompatibilité réglementaire | 🟠 Élevé | Consultation juridique locale avant démarrage |
| Adoption par les hôpitaux | 🟡 Moyen | UX simplifiée, formation, support dédié |

---

*Document produit le 13 juin 2026 — Analyse architecturale confidentielle.*
