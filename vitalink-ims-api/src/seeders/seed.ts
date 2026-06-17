/**
 * VitaLink IMS Database Seeder
 *
 * Run with: npx ts-node src/seeders/seed.ts
 * Or: npm run seed (add script to package.json)
 *
 * Populates vitalink_ims_db with test data for development.
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'vitalink_ims_db';

const POLICIES = [
  {
    policyNumber: 'POL-2026-001234',
    subscriberId: 'SUB-001',
    subscriberName: 'Amadou Diallo',
    insuranceProviderId: 'INS-NSIA-001',
    providerName: 'NSIA Assurances',
    insuranceCardNumber: 'CARD-2026-0001',
    type: 'individuelle',
    statut: 'active',
    dateDebut: new Date('2026-01-01'),
    dateFin: new Date('2026-12-31'),
    garanties: [
      { code: 'CONSULTATION', libelle: 'Consultation médicale', montantMax: 500000, pourcentage: 80 },
      { code: 'HOSPITALISATION', libelle: 'Hospitalisation', montantMax: 5000000, pourcentage: 70 },
      { code: 'PHARMACIE', libelle: 'Pharmacie', montantMax: 1000000, pourcentage: 60 },
      { code: 'LABORATOIRE', libelle: 'Analyses & Laboratoire', montantMax: 800000, pourcentage: 75 },
      { code: 'IMAGERIE', libelle: 'Imagerie médicale', montantMax: 1200000, pourcentage: 65 },
      { code: 'CHIRURGIE', libelle: 'Chirurgie', montantMax: 8000000, pourcentage: 85 },
    ],
    telephone: '+225 07 08 09 10',
    email: 'amadou.diallo@email.com',
  },
  {
    policyNumber: 'POL-2026-001235',
    subscriberId: 'SUB-002',
    subscriberName: 'Aïcha Koné',
    insuranceProviderId: 'INS-SAHAM-001',
    providerName: 'Saham Assurance',
    insuranceCardNumber: 'CARD-2026-0002',
    type: 'familiale',
    statut: 'active',
    dateDebut: new Date('2026-01-01'),
    dateFin: new Date('2026-12-31'),
    garanties: [
      { code: 'CONSULTATION', libelle: 'Consultation médicale', montantMax: 400000, pourcentage: 75 },
      { code: 'HOSPITALISATION', libelle: 'Hospitalisation', montantMax: 7000000, pourcentage: 80 },
      { code: 'PHARMACIE', libelle: 'Pharmacie', montantMax: 1500000, pourcentage: 70 },
      { code: 'MATERNITE', libelle: 'Maternité', montantMax: 3000000, pourcentage: 90 },
      { code: 'LABORATOIRE', libelle: 'Analyses & Laboratoire', montantMax: 600000, pourcentage: 70 },
    ],
    telephone: '+225 01 02 03 04',
    email: 'aicha.kone@email.com',
  },
  {
    policyNumber: 'POL-2026-001236',
    subscriberId: 'SUB-003',
    subscriberName: 'Ibrahim Traoré',
    insuranceProviderId: 'INS-NSIA-001',
    providerName: 'NSIA Assurances',
    insuranceCardNumber: 'CARD-2026-0003',
    type: 'individuelle',
    statut: 'active',
    dateDebut: new Date('2026-01-01'),
    dateFin: new Date('2026-12-31'),
    garanties: [
      { code: 'CONSULTATION', libelle: 'Consultation médicale', montantMax: 600000, pourcentage: 85 },
      { code: 'HOSPITALISATION', libelle: 'Hospitalisation', montantMax: 6000000, pourcentage: 75 },
      { code: 'PHARMACIE', libelle: 'Pharmacie', montantMax: 1200000, pourcentage: 65 },
      { code: 'CHIRURGIE', libelle: 'Chirurgie', montantMax: 10000000, pourcentage: 90 },
    ],
    telephone: '+225 07 11 22 33',
    email: 'ibrahim.traore@email.com',
  },
];

const INSURANCE_CLAIMS = [
  {
    claimNumber: 'CLM-2026-0001',
    invoiceId: 'inv-001',
    invoiceNumber: 'INV-2026-0002',
    patientId: 'MRN-2026-0002',
    patientName: 'Aïcha Koné',
    hospitalId: 'HOP-001',
    actes: [
      { acte: 'Échographie obstétricale', code: 'IMG-001', description: 'Échographie du 3ème trimestre', montant: 45000, dateActe: new Date('2026-06-05') },
      { acte: 'Consultation prénatale', code: 'CONS-002', description: 'Consultation prénatale', montant: 20000, dateActe: new Date('2026-06-05') },
    ],
    montantTotal: 65000,
    montantApprouve: 0,
    statut: 'recue',
    notes: 'Demande reçue de l\'hôpital — à traiter',
  },
  {
    claimNumber: 'CLM-2026-0002',
    invoiceId: 'inv-002',
    invoiceNumber: 'INV-2026-0003',
    patientId: 'MRN-2026-0003',
    patientName: 'Ibrahim Traoré',
    hospitalId: 'HOP-001',
    actes: [
      { acte: 'Consultation cardiologie', code: 'CONS-003', description: 'Consultation cardiologue', montant: 50000, dateActe: new Date('2026-06-10') },
      { acte: 'ECG', code: 'IMG-002', description: 'Électrocardiogramme', montant: 30000, dateActe: new Date('2026-06-10') },
      { acte: 'Écho cardiaque', code: 'IMG-003', description: 'Échocardiographie', montant: 80000, dateActe: new Date('2026-06-10') },
    ],
    montantTotal: 160000,
    montantApprouve: 140000,
    statut: 'approuvee',
    reviewedAt: new Date('2026-06-12'),
    reviewedBy: 'agent-nsia-001',
    notes: 'Approuvé — couverture HTA confirmée à 87.5%',
  },
];

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');

    const db = client.db(DB_NAME);

    // Drop existing collections
    await db.dropCollection('policies').catch(() => {});
    await db.dropCollection('insurance_claims').catch(() => {});
    await db.dropCollection('webhook_events').catch(() => {});

    // Seed policies
    const policiesWithDates = POLICIES.map((p) => ({
      ...p,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await db.collection('policies').insertMany(policiesWithDates);
    console.log(`✅ Seeded ${POLICIES.length} policies`);

    // Seed insurance claims
    const claimsWithDates = INSURANCE_CLAIMS.map((c) => ({
      ...c,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await db.collection('insurance_claims').insertMany(claimsWithDates);
    console.log(`✅ Seeded ${INSURANCE_CLAIMS.length} insurance claims`);

    console.log(`\n🎉 IMS database "${DB_NAME}" seeded successfully!`);
    console.log(`   - ${POLICIES.length} policies`);
    console.log(`   - ${INSURANCE_CLAIMS.length} insurance claims`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
