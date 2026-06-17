/**
 * VitaLink HMS Database Seeder
 *
 * Run with: npx ts-node src/seeders/seed.ts
 * Or: npm run seed (add script to package.json)
 *
 * Populates vitalink_hms_db with test data for development.
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'vitalink_hms_db';

const PATIENTS = [
  {
    firstName: 'Amadou',
    lastName: 'Diallo',
    medicalRecordNumber: 'MRN-2026-0001',
    dateOfBirth: new Date('1985-03-15'),
    gender: 'M',
    phone: '+225 07 08 09 10',
    email: 'amadou.diallo@email.com',
    address: { street: '123 Rue de la Paix', city: 'Abidjan', state: 'Plateau', zipCode: '01001' },
    emergencyContact: { name: 'Fatoumata Diallo', phone: '+225 05 06 07 08', relationship: 'Épouse' },
    bloodType: 'O+',
    allergies: ['Pénicilline'],
    antecedents: ['Diabète type 2'],
    insuranceCardNumber: 'CARD-2026-0001',
    insuranceProvider: 'NSIA Assurances',
    status: 'active',
  },
  {
    firstName: 'Aïcha',
    lastName: 'Koné',
    medicalRecordNumber: 'MRN-2026-0002',
    dateOfBirth: new Date('1990-07-22'),
    gender: 'F',
    phone: '+225 01 02 03 04',
    email: 'aicha.kone@email.com',
    address: { street: '45 Boulevard de Marseille', city: 'Abidjan', state: 'Cocody', zipCode: '00225' },
    emergencyContact: { name: 'Moussa Koné', phone: '+225 05 06 07 09', relationship: 'Frère' },
    bloodType: 'A+',
    allergies: [],
    antecedents: ['Grossesse (G2P1)'],
    insuranceCardNumber: 'CARD-2026-0002',
    insuranceProvider: 'Saham Assurance',
    status: 'active',
  },
  {
    firstName: 'Ibrahim',
    lastName: 'Traoré',
    medicalRecordNumber: 'MRN-2026-0003',
    dateOfBirth: new Date('1975-11-08'),
    gender: 'M',
    phone: '+225 07 11 22 33',
    email: 'ibrahim.traore@email.com',
    address: { street: '78 Avenue Chardy', city: 'Abidjan', state: 'Marcory', zipCode: '00871' },
    emergencyContact: { name: 'Aminata Traoré', phone: '+225 05 44 55 66', relationship: 'Épouse' },
    bloodType: 'B-',
    allergies: ['Aspirine', 'Ibuprofène'],
    antecedents: ['Hypertension artérielle', 'Asthme'],
    insuranceCardNumber: 'CARD-2026-0003',
    insuranceProvider: 'NSIA Assurances',
    status: 'active',
  },
  {
    firstName: 'Fatou',
    lastName: 'Bamba',
    medicalRecordNumber: 'MRN-2026-0004',
    dateOfBirth: new Date('2000-01-30'),
    gender: 'F',
    phone: '+225 01 99 88 77',
    email: 'fatou.bamba@email.com',
    address: { street: '15 Rue des Jardins', city: 'Abidjan', state: 'Yopougon', zipCode: '00672' },
    emergencyContact: { name: 'Yao Bamba', phone: '+225 07 66 55 44', relationship: 'Père' },
    bloodType: 'AB+',
    allergies: [],
    antecedents: [],
    insuranceCardNumber: 'CARD-2026-0004',
    insuranceProvider: 'Saham Assurance',
    status: 'active',
  },
];

const INVOICES = [
  {
    invoiceNumber: 'INV-2026-0001',
    patientMedicalRecordNumber: 'MRN-2026-0001',
    patientName: 'Amadou Diallo',
    hospitalId: 'HOP-001',
    actes: [
      { acte: 'Consultation générale', code: 'CONS-001', description: 'Consultation médicale générale', montant: 25000, dateActe: new Date('2026-06-01') },
      { acte: 'Bilan sanguin', code: 'BIO-001', description: 'Bilan sanguin complet (NFS, glycémie, créatinine)', montant: 35000, dateActe: new Date('2026-06-01') },
    ],
    montantTotal: 60000,
    montantRembourse: 0,
    statut: 'brouillon',
    notes: 'Patient diabétique — suivi trimestriel',
  },
  {
    invoiceNumber: 'INV-2026-0002',
    patientMedicalRecordNumber: 'MRN-2026-0002',
    patientName: 'Aïcha Koné',
    hospitalId: 'HOP-001',
    actes: [
      { acte: 'Échographie obstétricale', code: 'IMG-001', description: 'Échographie du 3ème trimestre', montant: 45000, dateActe: new Date('2026-06-05') },
      { acte: 'Consultation prénatale', code: 'CONS-002', description: 'Consultation prénatale', montant: 20000, dateActe: new Date('2026-06-05') },
    ],
    montantTotal: 65000,
    montantRembourse: 0,
    statut: 'soumise',
    insuranceClaimId: 'CLM-2026-0001',
    notes: 'Grossesse à suivi normal',
  },
  {
    invoiceNumber: 'INV-2026-0003',
    patientMedicalRecordNumber: 'MRN-2026-0003',
    patientName: 'Ibrahim Traoré',
    hospitalId: 'HOP-001',
    actes: [
      { acte: 'Consultation cardiologie', code: 'CONS-003', description: 'Consultation cardiologue', montant: 50000, dateActe: new Date('2026-06-10') },
      { acte: 'ECG', code: 'IMG-002', description: 'Électrocardiogramme', montant: 30000, dateActe: new Date('2026-06-10') },
      { acte: 'Écho cardiaque', code: 'IMG-003', description: 'Échocardiographie', montant: 80000, dateActe: new Date('2026-06-10') },
    ],
    montantTotal: 160000,
    montantRembourse: 0,
    statut: 'approuvee',
    insuranceClaimId: 'CLM-2026-0002',
    processedAt: new Date('2026-06-12'),
    notes: 'Suivi HTA — contrôle cardiaque annuel',
  },
];

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');

    const db = client.db(DB_NAME);

    // Drop existing collections
    await db.dropCollection('patients').catch(() => {});
    await db.dropCollection('invoices').catch(() => {});
    await db.dropCollection('webhook_events').catch(() => {});

    // Seed patients
    const patientsWithDates = PATIENTS.map((p) => ({
      ...p,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await db.collection('patients').insertMany(patientsWithDates);
    console.log(`✅ Seeded ${PATIENTS.length} patients`);

    // Get patient IDs for invoice references
    const patients = await db.collection('patients').find().toArray();
    const patientMap = new Map(patients.map((p: any) => [p.medicalRecordNumber, p._id]));

    // Seed invoices
    const invoicesWithRefs = INVOICES.map((inv) => ({
      ...inv,
      patientId: patientMap.get(inv.patientMedicalRecordNumber),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await db.collection('invoices').insertMany(invoicesWithRefs);
    console.log(`✅ Seeded ${INVOICES.length} invoices`);

    console.log(`\n🎉 HMS database "${DB_NAME}" seeded successfully!`);
    console.log(`   - ${PATIENTS.length} patients`);
    console.log(`   - ${INVOICES.length} invoices`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
