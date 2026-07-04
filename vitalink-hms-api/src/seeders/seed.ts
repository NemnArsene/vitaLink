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
    insuranceCardNumber: 'NSIA-2026-001234',
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
    insuranceCardNumber: 'SAHAM-2026-001235',
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
    insuranceCardNumber: 'ACTIVA-2026-001236',
    insuranceProvider: 'Activa Assurances',
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
    insuranceCardNumber: 'CNAMGS-2026-001238',
    insuranceProvider: 'CNAMGS',
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
    insuranceCardNumber: 'NSIA-2026-001237',
    insuranceProvider: 'NSIA Assurances',
    status: 'active',
  },
  {
    firstName: 'Fatou',
    lastName: 'Diop',
    medicalRecordNumber: 'MRN-2026-0006',
    dateOfBirth: new Date('1988-09-14'),
    gender: 'F',
    phone: '+237 670 00 00 06',
    email: 'fatou.diop@email.com',
    address: { street: 'Address', city: 'Douala', state: '', zipCode: 'BP 0000' },
    emergencyContact: { name: 'Contact Name', phone: '+237 670 00 00 06', relationship: 'Proche' },
    bloodType: 'A+',
    allergies: [],
    antecedents: [],
    insuranceCardNumber: 'AXA-2026-002000',
    insuranceProvider: 'AXA Assurances',
    status: 'active',
  },
  {
    firstName: 'Paul',
    lastName: 'Nguena',
    medicalRecordNumber: 'MRN-2026-0007',
    dateOfBirth: new Date('1972-04-21'),
    gender: 'M',
    phone: '+237 670 00 00 07',
    email: 'paul.nguena@email.com',
    address: { street: 'Address', city: 'Yaoundé', state: '', zipCode: 'BP 0000' },
    emergencyContact: { name: 'Contact Name', phone: '+237 670 00 00 07', relationship: 'Proche' },
    bloodType: 'O+',
    allergies: [],
    antecedents: ['Hypertension'],
    insuranceCardNumber: 'ASCOMA-2025-009999',
    insuranceProvider: 'Ascoma',
    status: 'active',
  },
  {
    firstName: 'Marie-Claire',
    lastName: 'Essomba',
    medicalRecordNumber: 'MRN-2026-0008',
    dateOfBirth: new Date('1992-11-30'),
    gender: 'F',
    phone: '+237 670 00 00 08',
    email: 'mc.essomba@gov.cm',
    address: { street: 'Address', city: 'Yaoundé', state: '', zipCode: 'BP 0000' },
    emergencyContact: { name: 'Contact Name', phone: '+237 670 00 00 08', relationship: 'Proche' },
    bloodType: 'AB+',
    allergies: ['Sulfamides'],
    antecedents: [],
    insuranceCardNumber: 'CNAMGS-2026-0006',
    insuranceProvider: 'CNAMGS',
    status: 'active',
  },
  {
    firstName: 'Ousmane',
    lastName: 'Diallo',
    medicalRecordNumber: 'MRN-2026-0009',
    dateOfBirth: new Date('1995-06-18'),
    gender: 'M',
    phone: '+237 670 00 00 09',
    email: 'ousmane.diallo@email.com',
    address: { street: 'Address', city: 'Douala', state: '', zipCode: 'BP 0000' },
    emergencyContact: { name: 'Contact Name', phone: '+237 670 00 00 09', relationship: 'Proche' },
    bloodType: 'B+',
    allergies: [],
    antecedents: [],
    insuranceCardNumber: 'NSIA-2026-001239',
    insuranceProvider: 'NSIA Assurances',
    status: 'active',
  },
  {
    firstName: 'Aminata',
    lastName: 'Sow',
    medicalRecordNumber: 'MRN-2026-0010',
    dateOfBirth: new Date('1983-02-08'),
    gender: 'F',
    phone: '+237 670 00 00 10',
    email: 'aminata.sow@email.com',
    address: { street: 'Address', city: 'Bamenda', state: '', zipCode: 'BP 0000' },
    emergencyContact: { name: 'Contact Name', phone: '+237 670 00 00 10', relationship: 'Proche' },
    bloodType: 'O-',
    allergies: ['Pénicilline'],
    antecedents: ['Asthme'],
    insuranceCardNumber: 'SAHAM-2026-001240',
    insuranceProvider: 'Saham Assurance',
    status: 'active',
  },
];

const PERSONNEL = [
  // --- Hôpital Général de Douala (entityId whitelisted) ---
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
  // --- Clinique Santé (entityId NON whitelisted -> mode Standalone) ---
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

const CONSULTATIONS = [
  { patientMedicalRecordNumber: 'MRN-2026-0001', patientName: 'Amadou Diallo', doctorName: 'Dr. Amadou Diallo', reason: 'Fièvre persistante', diagnostic: 'Infection respiratoire aiguë', consultationDate: new Date('2026-06-01'), status: 'completed' },
  { patientMedicalRecordNumber: 'MRN-2026-0002', patientName: 'Aïcha Koné', doctorName: 'Dr. Moussa Diop', reason: 'Suivi grossesse', diagnostic: null, consultationDate: new Date('2026-06-02'), status: 'active' },
  { patientMedicalRecordNumber: 'MRN-2026-0003', patientName: 'Ibrahim Traoré', doctorName: 'Dr. Amadou Diallo', reason: 'Douleur thoracique', diagnostic: 'Angine de poitrine suspectée', consultationDate: new Date('2026-06-03'), status: 'completed' },
  { patientMedicalRecordNumber: 'MRN-2026-0004', patientName: 'Fatou Bamba', doctorName: 'Dr. Moussa Diop', reason: 'Examen annuel', diagnostic: null, consultationDate: new Date('2026-06-04'), status: 'active' },
  { patientMedicalRecordNumber: 'MRN-2026-0005', patientName: 'Jean Kamga', doctorName: 'Dr. Amadou Diallo', reason: 'Douleur articulaire', diagnostic: 'Poussée d\'arthrose', consultationDate: new Date('2026-06-05'), status: 'completed' },
  { patientMedicalRecordNumber: 'MRN-2026-0006', patientName: 'Fatou Diop', doctorName: 'Dr. Moussa Diop', reason: 'Maux de tête fréquents', diagnostic: 'Migraine chronique', consultationDate: new Date('2026-06-06'), status: 'active' },
  { patientMedicalRecordNumber: 'MRN-2026-0007', patientName: 'Paul Nguena', doctorName: 'Dr. Amadou Diallo', reason: 'Contrôle tension artérielle', diagnostic: 'Hypertension stade 1', consultationDate: new Date('2026-06-07'), status: 'completed' },
  { patientMedicalRecordNumber: 'MRN-2026-0001', patientName: 'Amadou Diallo', doctorName: 'Dr. Moussa Diop', reason: 'Suivi diabète', diagnostic: null, consultationDate: new Date('2026-06-08'), status: 'active' },
  { patientMedicalRecordNumber: 'MRN-2026-0008', patientName: 'Marie-Claire Essomba', doctorName: 'Dr. Amadou Diallo', reason: 'Toux persistante', diagnostic: 'Bronchite aiguë', consultationDate: new Date('2026-06-09'), status: 'completed' },
  { patientMedicalRecordNumber: 'MRN-2026-0002', patientName: 'Aïcha Koné', doctorName: 'Dr. Moussa Diop', reason: 'Contrôle prénatal', diagnostic: 'Grossesse normale', consultationDate: new Date('2026-06-10'), status: 'active' },
  { patientMedicalRecordNumber: 'MRN-2026-0003', patientName: 'Ibrahim Traoré', doctorName: 'Dr. Amadou Diallo', reason: 'Essoufflement', diagnostic: 'Insuffisance cardiaque légère', consultationDate: new Date('2026-06-11'), status: 'completed' },
  { patientMedicalRecordNumber: 'MRN-2026-0009', patientName: 'Ousmane Diallo', doctorName: 'Dr. Moussa Diop', reason: 'Douleur abdominale', diagnostic: 'Gastrite', consultationDate: new Date('2026-06-12'), status: 'active' },
  { patientMedicalRecordNumber: 'MRN-2026-0004', patientName: 'Fatou Bamba', doctorName: 'Dr. Amadou Diallo', reason: 'Fièvre et courbatures', diagnostic: 'Paludisme simple', consultationDate: new Date('2026-06-13'), status: 'completed' },
  { patientMedicalRecordNumber: 'MRN-2026-0005', patientName: 'Jean Kamga', doctorName: 'Dr. Moussa Diop', reason: 'Suivi arthrose', diagnostic: null, consultationDate: new Date('2026-06-14'), status: 'active' },
  { patientMedicalRecordNumber: 'MRN-2026-0010', patientName: 'Aminata Sow', doctorName: 'Dr. Amadou Diallo', reason: 'Crise d\'asthme', diagnostic: 'Crise d\'asthme modérée', consultationDate: new Date('2026-06-15'), status: 'completed' },
  { patientMedicalRecordNumber: 'MRN-2026-0007', patientName: 'Paul Nguena', doctorName: 'Dr. Moussa Diop', reason: 'Contrôle HTA', diagnostic: 'Hypertension stade 1', consultationDate: new Date('2026-06-16'), status: 'active' },
  { patientMedicalRecordNumber: 'MRN-2026-0006', patientName: 'Fatou Diop', doctorName: 'Dr. Amadou Diallo', reason: 'Douleur lombaire', diagnostic: 'Lombalgie commune', consultationDate: new Date('2026-06-17'), status: 'completed' },
  { patientMedicalRecordNumber: 'MRN-2026-0008', patientName: 'Marie-Claire Essomba', doctorName: 'Dr. Moussa Diop', reason: 'Suivi post-infectieux', diagnostic: null, consultationDate: new Date('2026-06-18'), status: 'active' },
  { patientMedicalRecordNumber: 'MRN-2026-0001', patientName: 'Amadou Diallo', doctorName: 'Dr. Amadou Diallo', reason: 'Bilan annuel', diagnostic: 'Bon état général', consultationDate: new Date('2026-06-20'), status: 'completed' },
  { patientMedicalRecordNumber: 'MRN-2026-0009', patientName: 'Ousmane Diallo', doctorName: 'Dr. Moussa Diop', reason: 'Consultation préopératoire', diagnostic: null, consultationDate: new Date('2026-06-22'), status: 'active' },
];

const PRESCRIPTIONS = [
  { patientMedicalRecordNumber: 'MRN-2026-0001', patientName: 'Amadou Diallo', doctorName: 'Dr. Amadou Diallo', diagnosis: 'Infection respiratoire aiguë', prescriptionDate: new Date('2026-06-01'), isValid: true, medicaments: [{ medicament: 'Amoxicilline 500mg', dosage: '1 comprimé', frequence: '3x/jour', duree: '7 jours' }, { medicament: 'Paracétamol 500mg', dosage: '1 comprimé', frequence: '3x/jour', duree: '5 jours' }] },
  { patientMedicalRecordNumber: 'MRN-2026-0003', patientName: 'Ibrahim Traoré', doctorName: 'Dr. Amadou Diallo', diagnosis: 'Angine de poitrine suspectée', prescriptionDate: new Date('2026-06-03'), isValid: true, medicaments: [{ medicament: 'Aspirine 100mg', dosage: '1 comprimé', frequence: '1x/jour', duree: '30 jours' }, { medicament: 'Atorvastatine 20mg', dosage: '1 comprimé', frequence: '1x/jour', duree: '30 jours' }] },
  { patientMedicalRecordNumber: 'MRN-2026-0004', patientName: 'Fatou Bamba', doctorName: 'Dr. Moussa Diop', diagnosis: 'Paludisme simple', prescriptionDate: new Date('2026-06-13'), isValid: true, medicaments: [{ medicament: 'Artéméther-Luméfantrine 80/480mg', dosage: '4 comprimés', frequence: '2x/jour', duree: '3 jours' }, { medicament: 'Paracétamol 500mg', dosage: '1 comprimé', frequence: '3x/jour', duree: '3 jours' }] },
  { patientMedicalRecordNumber: 'MRN-2026-0005', patientName: 'Jean Kamga', doctorName: 'Dr. Amadou Diallo', diagnosis: 'Poussée d\'arthrose', prescriptionDate: new Date('2026-06-05'), isValid: true, medicaments: [{ medicament: 'Ibuprofène 400mg', dosage: '1 comprimé', frequence: '3x/jour', duree: '7 jours' }, { medicament: 'Paracétamol 500mg', dosage: '1 comprimé', frequence: '3x/jour', duree: '5 jours' }] },
  { patientMedicalRecordNumber: 'MRN-2026-0006', patientName: 'Fatou Diop', doctorName: 'Dr. Moussa Diop', diagnosis: 'Migraine chronique', prescriptionDate: new Date('2026-06-06'), isValid: true, medicaments: [{ medicament: 'Sumatriptan 50mg', dosage: '1 comprimé', frequence: 'à la demande', duree: '5 jours' }] },
  { patientMedicalRecordNumber: 'MRN-2026-0007', patientName: 'Paul Nguena', doctorName: 'Dr. Amadou Diallo', diagnosis: 'Hypertension stade 1', prescriptionDate: new Date('2026-06-07'), isValid: true, medicaments: [{ medicament: 'Metformine 850mg', dosage: '1 comprimé', frequence: '2x/jour', duree: '30 jours' }] },
  { patientMedicalRecordNumber: 'MRN-2026-0008', patientName: 'Marie-Claire Essomba', doctorName: 'Dr. Amadou Diallo', diagnosis: 'Bronchite aiguë', prescriptionDate: new Date('2026-06-09'), isValid: true, medicaments: [{ medicament: 'Amoxicilline 1g', dosage: '1 comprimé', frequence: '2x/jour', duree: '7 jours' }, { medicament: 'Oxomémazine sirop', dosage: '1 cuillère', frequence: '3x/jour', duree: '5 jours' }, { medicament: 'Paracétamol 500mg', dosage: '1 comprimé', frequence: '3x/jour', duree: '3 jours' }] },
  { patientMedicalRecordNumber: 'MRN-2026-0001', patientName: 'Amadou Diallo', doctorName: 'Dr. Moussa Diop', diagnosis: 'Suivi diabète', prescriptionDate: new Date('2026-06-08'), isValid: true, medicaments: [{ medicament: 'Metformine 850mg', dosage: '1 comprimé', frequence: '2x/jour', duree: '90 jours' }, { medicament: 'Glibenclamide 5mg', dosage: '1 comprimé', frequence: '1x/jour', duree: '90 jours' }] },
  { patientMedicalRecordNumber: 'MRN-2026-0003', patientName: 'Ibrahim Traoré', doctorName: 'Dr. Amadou Diallo', diagnosis: 'Insuffisance cardiaque légère', prescriptionDate: new Date('2026-06-11'), isValid: true, medicaments: [{ medicament: 'Furosémide 40mg', dosage: '1 comprimé', frequence: '1x/jour', duree: '30 jours' }, { medicament: 'Ramipril 5mg', dosage: '1 comprimé', frequence: '1x/jour', duree: '30 jours' }, { medicament: 'Bisoprolol 2.5mg', dosage: '1 comprimé', frequence: '1x/jour', duree: '30 jours' }] },
  { patientMedicalRecordNumber: 'MRN-2026-0009', patientName: 'Ousmane Diallo', doctorName: 'Dr. Moussa Diop', diagnosis: 'Gastrite', prescriptionDate: new Date('2026-06-12'), isValid: true, medicaments: [{ medicament: 'Oméprazole 20mg', dosage: '1 gélule', frequence: '1x/jour', duree: '14 jours' }] },
  { patientMedicalRecordNumber: 'MRN-2026-0010', patientName: 'Aminata Sow', doctorName: 'Dr. Amadou Diallo', diagnosis: 'Crise d\'asthme modérée', prescriptionDate: new Date('2026-06-15'), isValid: true, medicaments: [{ medicament: 'Salbutamol inhalé 100µg', dosage: '2 bouffées', frequence: 'à la demande', duree: '10 jours' }, { medicament: 'Prednisolone 40mg', dosage: '1 comprimé', frequence: '1x/jour', duree: '5 jours' }] },
  { patientMedicalRecordNumber: 'MRN-2026-0007', patientName: 'Paul Nguena', doctorName: 'Dr. Moussa Diop', diagnosis: 'Hypertension stade 1', prescriptionDate: new Date('2026-06-16'), isValid: true, medicaments: [{ medicament: 'Amlodipine 5mg', dosage: '1 comprimé', frequence: '1x/jour', duree: '30 jours' }] },
  { patientMedicalRecordNumber: 'MRN-2026-0006', patientName: 'Fatou Diop', doctorName: 'Dr. Amadou Diallo', diagnosis: 'Lombalgie commune', prescriptionDate: new Date('2026-06-17'), isValid: true, medicaments: [{ medicament: 'Diclofénac 75mg', dosage: '1 comprimé', frequence: '2x/jour', duree: '5 jours' }, { medicament: 'Détenteur musculaire', dosage: '1 comprimé', frequence: '3x/jour', duree: '5 jours' }] },
  { patientMedicalRecordNumber: 'MRN-2026-0002', patientName: 'Aïcha Koné', doctorName: 'Dr. Moussa Diop', diagnosis: 'Supplémentation prénatale', prescriptionDate: new Date('2026-06-10'), isValid: true, medicaments: [{ medicament: 'Acide folique 5mg', dosage: '1 comprimé', frequence: '1x/jour', duree: '30 jours' }, { medicament: 'Fer 200mg', dosage: '1 comprimé', frequence: '1x/jour', duree: '30 jours' }] },
  { patientMedicalRecordNumber: 'MRN-2026-0001', patientName: 'Amadou Diallo', doctorName: 'Dr. Amadou Diallo', diagnosis: 'Bilan annuel', prescriptionDate: new Date('2026-06-20'), isValid: true, medicaments: [{ medicament: 'Multivitamines', dosage: '1 comprimé', frequence: '1x/jour', duree: '30 jours' }] },
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
  },
  {
    invoiceNumber: 'INV-2026-0005',
    patientMedicalRecordNumber: 'MRN-2026-0004',
    patientName: 'Fatou Bamba',
    hospitalId: 'HOP-001',
    actes: [
      { acte: 'Consultation générale', code: 'CONS-001', description: 'Consultation médicale générale', montant: 12000, dateActe: new Date('2026-06-04') },
      { acte: 'Bilan sanguin', code: 'BIO-001', description: 'Bilan sanguin complet', montant: 18000, dateActe: new Date('2026-06-04') },
    ],
    montantTotal: 30000,
    montantRembourse: 0,
    statut: 'brouillon',
    notes: 'Examen annuel de routine',
  },
  {
    invoiceNumber: 'INV-2026-0006',
    patientMedicalRecordNumber: 'MRN-2026-0006',
    patientName: 'Fatou Diop',
    hospitalId: 'HOP-001',
    actes: [
      { acte: 'Consultation générale', code: 'CONS-001', description: 'Consultation médicale générale', montant: 15000, dateActe: new Date('2026-06-06') },
      { acte: 'IRM cérébrale', code: 'IMG-004', description: 'IRM cérébrale avec contraste', montant: 80000, dateActe: new Date('2026-06-06') },
    ],
    montantTotal: 95000,
    montantRembourse: 0,
    statut: 'soumise',
    insuranceClaimId: 'CLM-2026-0004',
    notes: 'Migraine chronique — IRM prescrite',
  },
  {
    invoiceNumber: 'INV-2026-0007',
    patientMedicalRecordNumber: 'MRN-2026-0007',
    patientName: 'Paul Nguena',
    hospitalId: 'HOP-001',
    actes: [
      { acte: 'Consultation cardiologie', code: 'CONS-003', description: 'Consultation cardiologue', montant: 20000, dateActe: new Date('2026-06-07') },
      { acte: 'ECG', code: 'IMG-002', description: 'Électrocardiogramme', montant: 15000, dateActe: new Date('2026-06-07') },
      { acte: 'Bilan sanguin', code: 'BIO-001', description: 'Bilan sanguin complet', montant: 25000, dateActe: new Date('2026-06-07') },
    ],
    montantTotal: 60000,
    montantRembourse: 0,
    statut: 'approuvee',
    insuranceClaimId: 'CLM-2026-0005',
    processedAt: new Date('2026-06-09'),
    notes: 'HTA — bilan initial complet',
  },
  {
    invoiceNumber: 'INV-2026-0008',
    patientMedicalRecordNumber: 'MRN-2026-0008',
    patientName: 'Marie-Claire Essomba',
    hospitalId: 'HOP-001',
    actes: [
      { acte: 'Consultation générale', code: 'CONS-001', description: 'Consultation médicale générale', montant: 15000, dateActe: new Date('2026-06-09') },
      { acte: 'Radio pulmonaire', code: 'IMG-005', description: 'Radiographie pulmonaire', montant: 25000, dateActe: new Date('2026-06-09') },
      { acte: 'Bilan sanguin', code: 'BIO-001', description: 'Bilan sanguin (NFS, CRP)', montant: 20000, dateActe: new Date('2026-06-09') },
    ],
    montantTotal: 60000,
    montantRembourse: 48000,
    statut: 'payee',
    insuranceClaimId: 'CLM-2026-0006',
    processedAt: new Date('2026-06-12'),
    notes: 'Bronchite aiguë — prise en charge CNAMGS',
  },
  {
    invoiceNumber: 'INV-2026-0009',
    patientMedicalRecordNumber: 'MRN-2026-0009',
    patientName: 'Ousmane Diallo',
    hospitalId: 'HOP-001',
    actes: [
      { acte: 'Consultation générale', code: 'CONS-001', description: 'Consultation médicale générale', montant: 15000, dateActe: new Date('2026-06-12') },
      { acte: 'Échographie abdominale', code: 'IMG-006', description: 'Échographie abdominale complète', montant: 30000, dateActe: new Date('2026-06-12') },
    ],
    montantTotal: 45000,
    montantRembourse: 0,
    statut: 'rejetee',
    insuranceClaimId: 'CLM-2026-0007',
    notes: 'Réclamation rejetée — dossier incomplet',
  },
  {
    invoiceNumber: 'INV-2026-0010',
    patientMedicalRecordNumber: 'MRN-2026-0010',
    patientName: 'Aminata Sow',
    hospitalId: 'HOP-001',
    actes: [
      { acte: 'Consultation urgences', code: 'CONS-005', description: 'Consultation urgences', montant: 25000, dateActe: new Date('2026-06-15') },
      { acte: 'Oxygénothérapie', code: 'SOIN-001', description: 'Oxygénothérapie 2h', montant: 15000, dateActe: new Date('2026-06-15') },
      { acte: 'Bilan sanguin', code: 'BIO-001', description: 'Bilan sanguin (gaz du sang)', montant: 20000, dateActe: new Date('2026-06-15') },
    ],
    montantTotal: 60000,
    montantRembourse: 54000,
    statut: 'remboursee',
    insuranceClaimId: 'CLM-2026-0008',
    processedAt: new Date('2026-06-22'),
    notes: 'Crise d\'asthme — remboursement Saham',
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
    await db.dropCollection('personnel').catch(() => {});
    await db.dropCollection('webhook_events').catch(() => {});
    await db.dropCollection('consultations').catch(() => {});
    await db.dropCollection('prescriptions').catch(() => {});

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

    // Get patient IDs for references
    const patients = await db.collection('patients').find().toArray();
    const patientMap = new Map(patients.map((p: any) => [p.medicalRecordNumber, p._id]));

    // Seed consultations
    const consultationsWithRefs = CONSULTATIONS.map((c) => ({
      ...c,
      patientId: patientMap.get(c.patientMedicalRecordNumber),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await db.collection('consultations').insertMany(consultationsWithRefs);
    console.log(`✅ Seeded ${CONSULTATIONS.length} consultations`);

    // Seed prescriptions
    const prescriptionsWithRefs = PRESCRIPTIONS.map((p) => ({
      ...p,
      patientId: patientMap.get(p.patientMedicalRecordNumber),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await db.collection('prescriptions').insertMany(prescriptionsWithRefs);
    console.log(`✅ Seeded ${PRESCRIPTIONS.length} prescriptions`);

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
    console.log(`   - ${CONSULTATIONS.length} consultations`);
    console.log(`   - ${PRESCRIPTIONS.length} prescriptions`);
    console.log(`   - ${INVOICES.length} invoices`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
