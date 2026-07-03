/**
 * VitaLink HMS Database Seeder
 *
 * Run with: npx ts-node src/seeders/seed.ts
 * Or: npm run seed
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
    phone: '+237 670 00 00 01',
    email: 'amadou.diallo@email.com',
    address: { street: '123 Rue Sylvani', city: 'Douala', state: 'Littoral', zipCode: 'BP 1234' },
    emergencyContact: { name: 'Fatoumata Diallo', phone: '+237 670 00 00 02', relationship: 'Épouse' },
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
    phone: '+237 690 11 22 33',
    email: 'aicha.kone@email.com',
    address: { street: '45 Boulevard Ahmadou Ahidjo', city: 'Yaoundé', state: 'Centre', zipCode: 'BP 5678' },
    emergencyContact: { name: 'Moussa Koné', phone: '+237 690 11 22 34', relationship: 'Frère' },
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
    phone: '+237 650 44 55 66',
    email: 'ibrahim.traore@email.com',
    address: { street: 'Avenue Kennedy', city: 'Yaoundé', state: 'Centre', zipCode: 'BP 8899' },
    emergencyContact: { name: 'Aminata Traoré', phone: '+237 650 44 55 67', relationship: 'Épouse' },
    bloodType: 'B-',
    allergies: ['Aspirine', 'Ibuprofène'],
    antecedents: ['Hypertension artérielle', 'Asthme'],
    insuranceCardNumber: 'CARD-2026-0003',
    insuranceProvider: 'Chanas Assurances',
    status: 'active',
  },
  {
    firstName: 'Fatou',
    lastName: 'Bamba',
    medicalRecordNumber: 'MRN-2026-0004',
    dateOfBirth: new Date('2000-01-30'),
    gender: 'F',
    phone: '+237 660 77 88 99',
    email: 'fatou.bamba@email.com',
    address: { street: 'Quartier Tam-Tam', city: 'Bafoussam', state: 'Ouest', zipCode: 'BP 1122' },
    emergencyContact: { name: 'Yao Bamba', phone: '+237 660 77 88 00', relationship: 'Père' },
    bloodType: 'AB+',
    allergies: [],
    antecedents: [],
    insuranceCardNumber: 'CARD-2026-0004',
    insuranceProvider: 'Activa Assurances',
    status: 'active',
  },
  {
    firstName: 'Jean',
    lastName: 'Kamga',
    medicalRecordNumber: 'MRN-2026-0005',
    dateOfBirth: new Date('1965-05-12'),
    gender: 'M',
    phone: '+237 677 88 99 00',
    email: 'jean.kamga@email.com',
    address: { street: 'Commercial Avenue', city: 'Bamenda', state: 'Nord-Ouest', zipCode: 'BP 3344' },
    emergencyContact: { name: 'Marie Kamga', phone: '+237 677 88 99 01', relationship: 'Épouse' },
    bloodType: 'O-',
    allergies: [],
    antecedents: ['Arthrose'],
    insuranceCardNumber: 'CARD-2026-0005',
    insuranceProvider: 'NSIA Assurances',
    status: 'active',
  }
];

const PERSONNEL = [
  // ─── Hôpital Général de Douala (entityId whitelisted) ───
  {
    employeeId: 'USR-HGD-001',
    firstName: 'Admin',
    lastName: 'Système',
    email: 'admin@hgd.cm',
    phone: '+237 670 00 01 00',
    role: 'ADMIN_HOPITAL',
    service: 'Administration',
    gender: 'M',
    entityId: '11111111-1111-1111-1111-111111111111',
    password: 'password',
    permissions: ['*'],
    statut: 'actif',
  },
  {
    employeeId: 'USR-HGD-002',
    firstName: 'Diallo',
    lastName: 'Amadou',
    email: 'medecin@hgd.cm',
    phone: '+237 670 00 02 00',
    role: 'MEDECIN',
    service: 'Cardiologie',
    specialty: 'Cardiologie',
    gender: 'M',
    entityId: '11111111-1111-1111-1111-111111111111',
    password: 'password',
    permissions: ['consultations.create', 'consultations.view', 'actes.create', 'prescriptions.create', 'patients.view'],
    statut: 'actif',
  },
  {
    employeeId: 'USR-HGD-003',
    firstName: 'Diop',
    lastName: 'Moussa',
    email: 'reception@hgd.cm',
    phone: '+237 670 00 03 00',
    role: 'RECEPTIONIST',
    service: 'Accueil',
    gender: 'M',
    entityId: '11111111-1111-1111-1111-111111111111',
    password: 'password',
    permissions: ['patients.create', 'patients.view', 'admissions.create'],
    statut: 'actif',
  },
  {
    employeeId: 'USR-HGD-004',
    firstName: 'Gueye',
    lastName: 'Aminata',
    email: 'triage@hgd.cm',
    phone: '+237 670 00 04 00',
    role: 'TRIAGE',
    service: 'Urgences',
    gender: 'F',
    entityId: '11111111-1111-1111-1111-111111111111',
    password: 'password',
    permissions: ['triage.create', 'triage.view'],
    statut: 'actif',
  },
  {
    employeeId: 'USR-HGD-005',
    firstName: 'Ndiaye',
    lastName: 'Ibrahima',
    email: 'laboratoire@hgd.cm',
    phone: '+237 670 00 05 00',
    role: 'LABORATORY',
    service: 'Laboratoire',
    gender: 'M',
    entityId: '11111111-1111-1111-1111-111111111111',
    password: 'password',
    permissions: ['analyses.create', 'analyses.view', 'resultats.create'],
    statut: 'actif',
  },
  {
    employeeId: 'USR-HGD-006',
    firstName: 'Fall',
    lastName: 'Khady',
    email: 'caissier@hgd.cm',
    phone: '+237 670 00 06 00',
    role: 'CASHIER',
    service: 'Caisse',
    gender: 'F',
    entityId: '11111111-1111-1111-1111-111111111111',
    password: 'password',
    permissions: ['paiements.create', 'paiements.view'],
    statut: 'actif',
  },
  {
    employeeId: 'USR-HGD-007',
    firstName: 'Ndiaye',
    lastName: 'Fatou',
    email: 'infirmier@hgd.cm',
    phone: '+237 670 00 07 00',
    role: 'NURSE',
    service: 'Pédiatrie',
    gender: 'F',
    entityId: '11111111-1111-1111-1111-111111111111',
    password: 'password',
    permissions: ['soins.create', 'soins.view', 'patients.view'],
    statut: 'actif',
  },
  {
    employeeId: 'USR-HGD-008',
    firstName: 'Ba',
    lastName: 'Ousmane',
    email: 'facturation@hgd.cm',
    phone: '+237 670 00 08 00',
    role: 'BILLING',
    service: 'Facturation',
    gender: 'M',
    entityId: '11111111-1111-1111-1111-111111111111',
    password: 'password',
    permissions: ['factures.create', 'factures.view', 'remboursements.view'],
    statut: 'actif',
  },
  {
    employeeId: 'USR-HGD-009',
    firstName: 'Fall',
    lastName: 'Cheikh',
    email: 'direction@hgd.cm',
    phone: '+237 670 00 09 00',
    role: 'DIRECTOR',
    service: 'Direction',
    gender: 'M',
    entityId: '11111111-1111-1111-1111-111111111111',
    password: 'password',
    permissions: ['*'],
    statut: 'actif',
  },
  // ─── Clinique Santé (entityId NON whitelisted → mode Standalone) ───
  {
    employeeId: 'USR-CLI-001',
    firstName: 'Admin',
    lastName: 'Indépendant',
    email: 'admin@cliniquesante.cm',
    phone: '+237 699 00 01 00',
    role: 'ADMIN_HOPITAL',
    service: 'Administration',
    gender: 'M',
    entityId: '99999999-9999-9999-9999-999999999999',
    password: 'password',
    permissions: ['*'],
    statut: 'actif',
  },
];

const INVOICES = [
  {
    invoiceNumber: 'INV-2026-0001',
    patientMedicalRecordNumber: 'MRN-2026-0001',
    patientName: 'Amadou Diallo',
    hospitalId: 'HOP-001',
    actes: [
      { acte: 'Consultation générale', code: 'CONS-001', description: 'Consultation médicale générale', montant: 15000, dateActe: new Date('2026-06-01') },
      { acte: 'Bilan sanguin', code: 'BIO-001', description: 'Bilan sanguin complet (NFS, glycémie, créatinine)', montant: 25000, dateActe: new Date('2026-06-01') },
    ],
    montantTotal: 40000,
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
      { acte: 'Échographie obstétricale', code: 'IMG-001', description: 'Échographie du 3ème trimestre', montant: 30000, dateActe: new Date('2026-06-05') },
      { acte: 'Consultation prénatale', code: 'CONS-002', description: 'Consultation prénatale', montant: 15000, dateActe: new Date('2026-06-05') },
    ],
    montantTotal: 45000,
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
      { acte: 'Consultation cardiologie', code: 'CONS-003', description: 'Consultation cardiologue', montant: 25000, dateActe: new Date('2026-06-10') },
      { acte: 'ECG', code: 'IMG-002', description: 'Électrocardiogramme', montant: 15000, dateActe: new Date('2026-06-10') },
      { acte: 'Écho cardiaque', code: 'IMG-003', description: 'Échocardiographie', montant: 50000, dateActe: new Date('2026-06-10') },
    ],
    montantTotal: 90000,
    montantRembourse: 0,
    statut: 'approuvee',
    insuranceClaimId: 'CLM-2026-0002',
    processedAt: new Date('2026-06-12'),
    notes: 'Suivi HTA — contrôle cardiaque annuel',
  },
  {
    invoiceNumber: 'INV-2026-0004',
    patientMedicalRecordNumber: 'MRN-2026-0005',
    patientName: 'Jean Kamga',
    hospitalId: 'HOP-001',
    actes: [
      { acte: 'Consultation rhumatologie', code: 'CONS-004', description: 'Consultation rhumatologue', montant: 20000, dateActe: new Date('2026-06-15') },
      { acte: 'Infiltration', code: 'ACT-005', description: 'Infiltration articulaire', montant: 35000, dateActe: new Date('2026-06-15') },
    ],
    montantTotal: 55000,
    montantRembourse: 44000,
    statut: 'payee',
    insuranceClaimId: 'CLM-2026-0003',
    processedAt: new Date('2026-06-18'),
    notes: 'Prise en charge validée par NSIA',
  }
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
    await db.dropCollection('personnel').catch(() => {});
    await db.dropCollection('webhook_events').catch(() => {});

    // Seed personnel (users)
    const personnelWithDates = PERSONNEL.map((p) => ({
      ...p,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await db.collection('personnel').insertMany(personnelWithDates);
    console.log(`✅ Seeded ${PERSONNEL.length} personnel`);

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
    console.log(`   - ${PERSONNEL.length} personnel`);
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
