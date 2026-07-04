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
    insuranceCardNumber: 'NSIA-2026-001234',
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
    insuranceCardNumber: 'SAHAM-2026-001235',
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
    insuranceCardNumber: 'ACTIVA-2026-001236',
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
    insuranceCardNumber: 'NSIA-2026-001237',
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
  },
  // Cas 5 : Assuré CNAMGS (couverture fonctionnaire)
  {
    policyNumber: 'POL-2026-001238',
    subscriberId: 'SUB-006',
    subscriberName: 'Marie-Claire Essomba',
    insuranceProviderId: 'INS-CNAMGS-001',
    providerName: 'CNAMGS',
    insuranceCardNumber: 'CNAMGS-2026-001238',
    type: 'fonctionnaire',
    statut: 'active',
    dateDebut: new Date('2026-01-01'),
    dateFin: new Date('2026-12-31'),
    garanties: [
      { code: 'CONSULTATION', libelle: 'Consultation médicale', montantMax: 300000, pourcentage: 100 },
      { code: 'HOSPITALISATION', libelle: 'Hospitalisation', montantMax: 5000000, pourcentage: 100 },
      { code: 'PHARMACIE', libelle: 'Pharmacie', montantMax: 800000, pourcentage: 80 },
      { code: 'LABORATOIRE', libelle: 'Analyses & Laboratoire', montantMax: 500000, pourcentage: 100 },
    ],
    telephone: '+237 699 00 11 22',
    email: 'marie.essomba@gov.cm',
  },
  // Cas 6 : Police EXPIRÉE → NON_ASSURE car dateFin dépassée
  {
    policyNumber: 'POL-2025-009999',
    subscriberId: 'SUB-007',
    subscriberName: 'Paul Nguena',
    insuranceProviderId: 'INS-ASCOMA-001',
    providerName: 'Ascoma',
    insuranceCardNumber: 'ASCOMA-2025-009999',
    type: 'individuelle',
    statut: 'active',  // statut active mais dateFin passée
    dateDebut: new Date('2025-01-01'),
    dateFin: new Date('2025-12-31'),  // expirée
    garanties: [
      { code: 'CONSULTATION', libelle: 'Consultation médicale', montantMax: 200000, pourcentage: 70 },
    ],
    telephone: '+237 655 22 33 44',
    email: 'paul.nguena@email.com',
  },
  // Cas 7 : Police suspendue → NON_ASSURE (statut suspended)
  {
    policyNumber: 'POL-2026-002000',
    subscriberId: 'SUB-008',
    subscriberName: 'Fatou Diop',
    insuranceProviderId: 'INS-AXA-001',
    providerName: 'AXA Assurances',
    insuranceCardNumber: 'AXA-2026-002000',
    type: 'individuelle',
    statut: 'suspended',  // suspendue → findOne({statut:'active'}) ne la trouvera pas
    dateDebut: new Date('2026-01-01'),
    dateFin: new Date('2026-12-31'),
    garanties: [
      { code: 'CONSULTATION', libelle: 'Consultation médicale', montantMax: 400000, pourcentage: 75 },
    ],
    telephone: '+237 688 55 66 77',
    email: 'fatou.diop@email.com',
  },
];

const INSUREDS = [
  {
    insuredNumber: 'INS-2026-001',
    firstName: 'Amadou',
    lastName: 'Diallo',
    insuranceCardNumber: 'NSIA-2026-001234',
    policyNumber: 'POL-2026-001234',
    dateOfBirth: new Date('1985-03-15'),
    gender: 'M',
    email: 'amadou.diallo@email.com',
    phone: '+237 670 00 00 01',
    address: { street: '123 Rue Sylvani', city: 'Douala', state: 'Littoral', zipCode: 'BP 1234' },
    dateAffiliation: new Date('2026-01-01'),
    statut: 'actif',
    plafondGlobal: 5000000,
    consommationPlafond: 0,
    garantiesSouscrites: [
      { code: 'CONSULTATION', libelle: 'Consultation médicale', montantMax: 500000, pourcentage: 80 },
      { code: 'HOSPITALISATION', libelle: 'Hospitalisation', montantMax: 5000000, pourcentage: 70 },
      { code: 'PHARMACIE', libelle: 'Pharmacie', montantMax: 1000000, pourcentage: 60 },
      { code: 'LABORATOIRE', libelle: 'Analyses & Laboratoire', montantMax: 800000, pourcentage: 75 },
      { code: 'IMAGERIE', libelle: 'Imagerie médicale', montantMax: 1200000, pourcentage: 65 },
      { code: 'CHIRURGIE', libelle: 'Chirurgie', montantMax: 8000000, pourcentage: 85 },
    ],
  },
  {
    insuredNumber: 'INS-2026-002',
    firstName: 'Aïcha',
    lastName: 'Koné',
    insuranceCardNumber: 'SAHAM-2026-001235',
    policyNumber: 'POL-2026-001235',
    dateOfBirth: new Date('1990-07-22'),
    gender: 'F',
    email: 'aicha.kone@email.com',
    phone: '+237 690 11 22 33',
    address: { street: '456 Avenue Kennedy', city: 'Douala', state: 'Littoral', zipCode: 'BP 5678' },
    dateAffiliation: new Date('2026-01-01'),
    statut: 'actif',
    plafondGlobal: 5000000,
    consommationPlafond: 0,
    garantiesSouscrites: [
      { code: 'CONSULTATION', libelle: 'Consultation médicale', montantMax: 400000, pourcentage: 75 },
      { code: 'HOSPITALISATION', libelle: 'Hospitalisation', montantMax: 7000000, pourcentage: 80 },
      { code: 'PHARMACIE', libelle: 'Pharmacie', montantMax: 1500000, pourcentage: 70 },
      { code: 'MATERNITE', libelle: 'Maternité', montantMax: 3000000, pourcentage: 90 },
      { code: 'LABORATOIRE', libelle: 'Analyses & Laboratoire', montantMax: 600000, pourcentage: 70 },
    ],
  },
  {
    insuredNumber: 'INS-2026-003',
    firstName: 'Ibrahim',
    lastName: 'Traoré',
    insuranceCardNumber: 'ACTIVA-2026-001236',
    policyNumber: 'POL-2026-001236',
    dateOfBirth: new Date('1978-11-08'),
    gender: 'M',
    email: 'ibrahim.traore@email.com',
    phone: '+237 650 44 55 66',
    address: { street: '789 Rue de la Liberté', city: 'Yaoundé', state: 'Centre', zipCode: 'BP 9012' },
    dateAffiliation: new Date('2026-01-01'),
    statut: 'actif',
    plafondGlobal: 5000000,
    consommationPlafond: 0,
    garantiesSouscrites: [
      { code: 'CONSULTATION', libelle: 'Consultation médicale', montantMax: 600000, pourcentage: 85 },
      { code: 'HOSPITALISATION', libelle: 'Hospitalisation', montantMax: 6000000, pourcentage: 75 },
      { code: 'PHARMACIE', libelle: 'Pharmacie', montantMax: 1200000, pourcentage: 65 },
      { code: 'CHIRURGIE', libelle: 'Chirurgie', montantMax: 10000000, pourcentage: 90 },
    ],
  },
  {
    insuredNumber: 'INS-2026-004',
    firstName: 'Jean',
    lastName: 'Kamga',
    insuranceCardNumber: 'NSIA-2026-001237',
    policyNumber: 'POL-2026-001237',
    dateOfBirth: new Date('1982-05-30'),
    gender: 'M',
    email: 'jean.kamga@email.com',
    phone: '+237 677 88 99 00',
    address: { street: '321 Boulevard de la République', city: 'Yaoundé', state: 'Centre', zipCode: 'BP 3456' },
    dateAffiliation: new Date('2026-01-01'),
    statut: 'actif',
    plafondGlobal: 5000000,
    consommationPlafond: 0,
    garantiesSouscrites: [
      { code: 'CONSULTATION', libelle: 'Consultation médicale', montantMax: 1000000, pourcentage: 90 },
      { code: 'HOSPITALISATION', libelle: 'Hospitalisation', montantMax: 10000000, pourcentage: 90 },
      { code: 'PHARMACIE', libelle: 'Pharmacie', montantMax: 2000000, pourcentage: 80 },
    ],
  },
  {
    insuredNumber: 'INS-2026-005',
    firstName: 'Marie-Claire',
    lastName: 'Essonba',
    insuranceCardNumber: 'CNAMGS-2026-001238',
    policyNumber: 'POL-2026-001238',
    dateOfBirth: new Date('1988-09-14'),
    gender: 'F',
    email: 'marie.essomba@gov.cm',
    phone: '+237 699 00 11 22',
    address: { street: '654 Rue du Gouvernement', city: 'Yaoundé', state: 'Centre', zipCode: 'BP 7890' },
    dateAffiliation: new Date('2026-01-01'),
    statut: 'actif',
    plafondGlobal: 5000000,
    consommationPlafond: 0,
    garantiesSouscrites: [
      { code: 'CONSULTATION', libelle: 'Consultation médicale', montantMax: 300000, pourcentage: 100 },
      { code: 'HOSPITALISATION', libelle: 'Hospitalisation', montantMax: 5000000, pourcentage: 100 },
      { code: 'PHARMACIE', libelle: 'Pharmacie', montantMax: 800000, pourcentage: 80 },
      { code: 'LABORATOIRE', libelle: 'Analyses & Laboratoire', montantMax: 500000, pourcentage: 100 },
    ],
  },
  {
    insuredNumber: 'INS-2026-006',
    firstName: 'Paul',
    lastName: 'Nguena',
    insuranceCardNumber: 'ASCOMA-2025-009999',
    policyNumber: 'POL-2025-009999',
    dateOfBirth: new Date('1965-02-20'),
    gender: 'M',
    email: 'paul.nguena@email.com',
    phone: '+237 655 22 33 44',
    address: { street: '987 Rue du Commerce', city: 'Douala', state: 'Littoral', zipCode: 'BP 1234' },
    dateAffiliation: new Date('2025-01-01'),
    statut: 'inactif',
    plafondGlobal: 5000000,
    consommationPlafond: 0,
    garantiesSouscrites: [
      { code: 'CONSULTATION', libelle: 'Consultation médicale', montantMax: 200000, pourcentage: 70 },
    ],
  },
  {
    insuredNumber: 'INS-2026-007',
    firstName: 'Fatou',
    lastName: 'Diop',
    insuranceCardNumber: 'AXA-2026-002000',
    policyNumber: 'POL-2026-002000',
    dateOfBirth: new Date('1992-12-01'),
    gender: 'F',
    email: 'fatou.diop@email.com',
    phone: '+237 688 55 66 77',
    address: { street: '147 Avenue de l\'Indépendance', city: 'Douala', state: 'Littoral', zipCode: 'BP 5678' },
    dateAffiliation: new Date('2026-01-01'),
    statut: 'suspendu',
    plafondGlobal: 5000000,
    consommationPlafond: 0,
    garantiesSouscrites: [
      { code: 'CONSULTATION', libelle: 'Consultation médicale', montantMax: 400000, pourcentage: 75 },
    ],
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
    montantApprouve: 76500,
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
    montantApprouve: 44000,
    statut: 'remboursee',
    reviewedAt: new Date('2026-06-16'),
    paidAt: new Date('2026-06-18'),
    reviewedBy: 'agent-nsia-002',
    notes: 'Remboursement effectué via virement bancaire Hôpital Régional',
  },
  {
    claimNumber: 'CLM-2026-0004',
    invoiceId: 'inv-004',
    invoiceNumber: 'INV-2026-0005',
    patientId: 'MRN-2026-0001',
    patientName: 'Amadou Diallo',
    hospitalId: 'HOP-001',
    hospitalName: 'Hôpital Général de Douala',
    actes: [
      { acte: 'Consultation générale', code: 'CONS-005', description: 'Consultation médecine générale', montant: 25000, dateActe: new Date('2026-07-01') },
    ],
    montantTotal: 25000,
    montantApprouve: 0,
    statut: 'recue',
    notes: 'Demande reçue — à traiter',
  },
  {
    claimNumber: 'CLM-2026-0005',
    invoiceId: 'inv-005',
    invoiceNumber: 'INV-2026-0006',
    patientId: 'MRN-2026-0002',
    patientName: 'Aïcha Koné',
    hospitalId: 'HOP-001',
    hospitalName: 'Hôpital Général de Douala',
    actes: [
      { acte: 'Analyse sanguine', code: 'LAB-001', description: 'Bilan sanguin complet', montant: 18000, dateActe: new Date('2026-07-05') },
    ],
    montantTotal: 18000,
    montantApprouve: 0,
    statut: 'en_revision',
    notes: 'Analyse en cours — documentation reçue',
  },
  {
    claimNumber: 'CLM-2026-0006',
    invoiceId: 'inv-006',
    invoiceNumber: 'INV-2026-0007',
    patientId: 'MRN-2026-0003',
    patientName: 'Ibrahim Traoré',
    hospitalId: 'HOP-002',
    hospitalName: 'Hôpital Central de Yaoundé',
    actes: [
      { acte: 'Consultation cardiologie', code: 'CONS-003', description: 'Consultation cardiologue de contrôle', montant: 40000, dateActe: new Date('2026-07-10') },
      { acte: 'ECG', code: 'IMG-002', description: 'Électrocardiogramme', montant: 25000, dateActe: new Date('2026-07-10') },
      { acte: 'Écho cardiaque', code: 'IMG-003', description: 'Échocardiographie', montant: 25000, dateActe: new Date('2026-07-10') },
    ],
    montantTotal: 90000,
    montantApprouve: 76500,
    statut: 'approuvee',
    reviewedAt: new Date('2026-07-12'),
    reviewedBy: 'agent-activa-001',
    notes: 'Approuvé — couverture cardiologie à 85%',
  },
  {
    claimNumber: 'CLM-2026-0007',
    invoiceId: 'inv-007',
    invoiceNumber: 'INV-2026-0008',
    patientId: 'MRN-2026-0005',
    patientName: 'Jean Kamga',
    hospitalId: 'HOP-003',
    hospitalName: 'Hôpital Régional de Bamenda',
    actes: [
      { acte: 'Infiltration articulaire', code: 'ACT-005', description: 'Infiltration articulaire du genou', montant: 55000, dateActe: new Date('2026-07-15') },
    ],
    montantTotal: 55000,
    montantApprouve: 0,
    statut: 'rejetee',
    notes: 'Acte non couvert par la police',
  },
  {
    claimNumber: 'CLM-2026-0008',
    invoiceId: 'inv-008',
    invoiceNumber: 'INV-2026-0009',
    patientId: 'MRN-2026-0006',
    patientName: 'Fatou Bamba',
    hospitalId: 'HOP-002',
    hospitalName: 'Hôpital Central de Yaoundé',
    actes: [
      { acte: 'Consultation générale', code: 'CONS-005', description: 'Consultation médecine générale', montant: 15000, dateActe: new Date('2026-07-20') },
    ],
    montantTotal: 15000,
    montantApprouve: 15000,
    statut: 'remboursee',
    reviewedAt: new Date('2026-07-22'),
    paidAt: new Date('2026-07-24'),
    reviewedBy: 'agent-cnamgs-001',
    notes: 'Remboursement intégral — prise en charge CNAMGS 100%',
  },
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
    await db.dropCollection('insureds').catch(() => {});
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

    // Seed insureds
    const insuredsWithDates = INSUREDS.map((i) => ({
      ...i,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await db.collection('insureds').insertMany(insuredsWithDates);
    console.log(`✅ Seeded ${INSUREDS.length} insureds`);

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
    console.log(`   - ${INSUREDS.length} insureds`);
    console.log(`   - ${INSURANCE_CLAIMS.length} insurance claims`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
