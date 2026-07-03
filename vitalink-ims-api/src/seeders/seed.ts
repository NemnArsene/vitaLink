/**
 * VitaLink IMS Database Seeder
 *
 * Run with: npx ts-node src/seeders/seed.ts
 * Or: npm run seed
 *
 * Populates vitalink_ims_db with test data for development.
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'vitalink_ims_db';

const PARTNER_HOSPITALS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Hôpital Général de Douala',
    code: 'HGD-001',
    region: 'Littoral',
    city: 'Douala',
    address: 'Avenue des Palmiers',
    status: 'active',
    contactEmail: 'contact@hgd.cm',
    contactPhone: '+237 600 00 00 00'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Hôpital Central de Yaoundé',
    code: 'HCY-002',
    region: 'Centre',
    city: 'Yaoundé',
    address: 'Quartier de l\'Hôpital',
    status: 'active',
    contactEmail: 'contact@hcy.cm',
    contactPhone: '+237 611 11 11 11'
  }
];

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
    telephone: '+237 670 00 00 01',
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
    telephone: '+237 690 11 22 33',
    email: 'aicha.kone@email.com',
  },
  {
    policyNumber: 'POL-2026-001236',
    subscriberId: 'SUB-003',
    subscriberName: 'Ibrahim Traoré',
    insuranceProviderId: 'INS-ACTIVA-001',
    providerName: 'Activa Assurances',
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
    telephone: '+237 650 44 55 66',
    email: 'ibrahim.traore@email.com',
  },
  {
    policyNumber: 'POL-2026-001237',
    subscriberId: 'SUB-005',
    subscriberName: 'Jean Kamga',
    insuranceProviderId: 'INS-NSIA-001',
    providerName: 'NSIA Assurances',
    insuranceCardNumber: 'CARD-2026-0005',
    type: 'entreprise',
    statut: 'active',
    dateDebut: new Date('2026-01-01'),
    dateFin: new Date('2026-12-31'),
    garanties: [
      { code: 'CONSULTATION', libelle: 'Consultation médicale', montantMax: 1000000, pourcentage: 90 },
      { code: 'HOSPITALISATION', libelle: 'Hospitalisation', montantMax: 10000000, pourcentage: 90 },
      { code: 'PHARMACIE', libelle: 'Pharmacie', montantMax: 2000000, pourcentage: 80 },
    ],
    telephone: '+237 677 88 99 00',
    email: 'jean.kamga@email.com',
  }
];

const INSURANCE_CLAIMS = [
  {
    claimNumber: 'CLM-2026-0001',
    invoiceId: 'inv-001',
    invoiceNumber: 'INV-2026-0002',
    patientId: 'MRN-2026-0002',
    patientName: 'Aïcha Koné',
    hospitalId: 'HOP-001',
    hospitalName: 'Hôpital Général de Douala',
    actes: [
      { acte: 'Échographie obstétricale', code: 'IMG-001', description: 'Échographie du 3ème trimestre', montant: 30000, dateActe: new Date('2026-06-05') },
      { acte: 'Consultation prénatale', code: 'CONS-002', description: 'Consultation prénatale', montant: 15000, dateActe: new Date('2026-06-05') },
    ],
    montantTotal: 45000,
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
    hospitalId: 'HOP-002',
    hospitalName: 'Hôpital Central de Yaoundé',
    actes: [
      { acte: 'Consultation cardiologie', code: 'CONS-003', description: 'Consultation cardiologue', montant: 25000, dateActe: new Date('2026-06-10') },
      { acte: 'ECG', code: 'IMG-002', description: 'Électrocardiogramme', montant: 15000, dateActe: new Date('2026-06-10') },
      { acte: 'Écho cardiaque', code: 'IMG-003', description: 'Échocardiographie', montant: 50000, dateActe: new Date('2026-06-10') },
    ],
    montantTotal: 90000,
    montantApprouve: 76500, // 85% de 90000
    statut: 'approuvee',
    reviewedAt: new Date('2026-06-12'),
    reviewedBy: 'agent-nsia-001',
    notes: 'Approuvé — couverture HTA confirmée à 85%',
  },
  {
    claimNumber: 'CLM-2026-0003',
    invoiceId: 'inv-003',
    invoiceNumber: 'INV-2026-0004',
    patientId: 'MRN-2026-0005',
    patientName: 'Jean Kamga',
    hospitalId: 'HOP-003',
    hospitalName: 'Hôpital Régional de Bamenda',
    actes: [
      { acte: 'Consultation rhumatologie', code: 'CONS-004', description: 'Consultation rhumatologue', montant: 20000, dateActe: new Date('2026-06-15') },
      { acte: 'Infiltration', code: 'ACT-005', description: 'Infiltration articulaire', montant: 35000, dateActe: new Date('2026-06-15') },
    ],
    montantTotal: 55000,
    montantApprouve: 44000, // 80% de 55000 (Actes spéciaux)
    statut: 'payee',
    reviewedAt: new Date('2026-06-16'),
    paidAt: new Date('2026-06-18'),
    reviewedBy: 'agent-nsia-002',
    notes: 'Remboursement effectué via virement bancaire Hôpital Régional',
  }
];

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');

    const db = client.db(DB_NAME);

    // Drop existing collections
    await db.dropCollection('partner_hospitals').catch(() => {});
    await db.dropCollection('policies').catch(() => {});
    await db.dropCollection('insurance_claims').catch(() => {});
    await db.dropCollection('webhook_events').catch(() => {});

    // Seed partner hospitals
    const hospitalsWithDates = PARTNER_HOSPITALS.map((h) => ({
      ...h,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await db.collection('partner_hospitals').insertMany(hospitalsWithDates);
    console.log(`✅ Seeded ${PARTNER_HOSPITALS.length} partner hospitals`);

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
    console.log(`   - ${PARTNER_HOSPITALS.length} partner hospitals`);
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
