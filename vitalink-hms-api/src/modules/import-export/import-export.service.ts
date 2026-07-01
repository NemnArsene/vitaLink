import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient, PatientDocument } from '../patients/schemas/patient.schema';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface ImportResult {
  imported: number;
  errors: { row: number; message: string }[];
  totalRows: number;
}

@Injectable()
export class ImportExportService implements OnModuleInit {
  private readonly logger = new Logger(ImportExportService.name);

  constructor(
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
  ) {}

  onModuleInit() {
    const dir = path.resolve('./uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      this.logger.log(`Uploads directory created: ${dir}`);
    }
  }

  async importPatientsFromCsv(filePath: string, userId?: string): Promise<ImportResult> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(l => l.trim());
    const result: ImportResult = { imported: 0, errors: [], totalRows: 0 };

    if (lines.length < 2) {
      return result;
    }

    const headers = this.parseCsvLine(lines[0]);
    const rows = lines.slice(1);
    result.totalRows = rows.length;

    const fieldMap = this.buildFieldMap(headers);
    const batch: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const values = this.parseCsvLine(rows[i]);
        const patient = this.rowToPatient(fieldMap, values);

        if (!patient.firstName || !patient.lastName || !patient.medicalRecordNumber) {
          result.errors.push({ row: i + 2, message: 'firstName, lastName et medicalRecordNumber sont requis' });
          continue;
        }

        batch.push({
          ...patient,
          createdBy: userId || 'import',
          updatedBy: userId || 'import',
        });

        if (batch.length >= 50) {
          await this.insertBatch(batch, result);
          batch.length = 0;
        }
      } catch (err) {
        result.errors.push({ row: i + 2, message: err.message });
      }
    }

    if (batch.length > 0) {
      await this.insertBatch(batch, result);
    }

    fs.unlink(filePath, () => {});

    return result;
  }

  private async insertBatch(batch: any[], result: ImportResult): Promise<void> {
    try {
      await this.patientModel.insertMany(batch, { ordered: false });
      result.imported += batch.length;
    } catch (err: any) {
      if (err.writeErrors) {
        const writeErrors = err.writeErrors as any[];
        const insertedCount = err.insertedCount || 0;
        result.imported += insertedCount;
        for (const we of writeErrors) {
          result.errors.push({ row: -1, message: `Erreur écriture: ${we.errmsg || we.message}` });
        }
      } else {
        result.errors.push({ row: -1, message: err.message });
      }
    }
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }

  private buildFieldMap(headers: string[]): { csvCol: string; patientField: string }[] {
    const knownFields: Record<string, string> = {
      'prenom': 'firstName',
      'firstName': 'firstName',
      'first_name': 'firstName',
      'firstname': 'firstName',
      'nom': 'lastName',
      'lastName': 'lastName',
      'last_name': 'lastName',
      'lastname': 'lastName',
      'ndossier': 'medicalRecordNumber',
      'n_dossier': 'medicalRecordNumber',
      'medicalRecordNumber': 'medicalRecordNumber',
      'medical_record_number': 'medicalRecordNumber',
      'mrn': 'medicalRecordNumber',
      'fileNumber': 'medicalRecordNumber',
      'dateNaissance': 'dateOfBirth',
      'date_naissance': 'dateOfBirth',
      'dateOfBirth': 'dateOfBirth',
      'date_of_birth': 'dateOfBirth',
      'dob': 'dateOfBirth',
      'sexe': 'gender',
      'gender': 'gender',
      'telephone': 'phone',
      'phone': 'phone',
      'email': 'email',
      'adresse': 'address.street',
      'street': 'address.street',
      'ville': 'address.city',
      'city': 'address.city',
      'codePostal': 'address.zipCode',
      'zipCode': 'address.zipCode',
      'zip_code': 'address.zipCode',
      'groupeSanguin': 'bloodType',
      'bloodType': 'bloodType',
      'blood_type': 'bloodType',
      'allergies': 'allergies',
      'antecedents': 'antecedents',
      'antecedent': 'antecedents',
      'noAssurance': 'insuranceCardNumber',
      'insuranceCardNumber': 'insuranceCardNumber',
      'insurance_card_number': 'insuranceCardNumber',
      'assurance': 'insuranceProvider',
      'insuranceProvider': 'insuranceProvider',
      'insurance_provider': 'insuranceProvider',
      'statut': 'status',
      'status': 'status',
      'contactUrgence_nom': 'emergencyContact.name',
      'emergency_name': 'emergencyContact.name',
      'contactUrgence_phone': 'emergencyContact.phone',
      'emergency_phone': 'emergencyContact.phone',
      'contactUrgence_lien': 'emergencyContact.relationship',
      'emergency_relationship': 'emergencyContact.relationship',
    };

    return headers.map(h => ({
      csvCol: h,
      patientField: knownFields[h.toLowerCase().replace(/[\s-]/g, '')] || '',
    }));
  }

  private rowToPatient(fieldMap: { csvCol: string; patientField: string }[], values: string[]): any {
    const patient: any = {};
    const address: any = {};
    const emergency: any = {};

    for (let i = 0; i < fieldMap.length; i++) {
      if (i >= values.length) break;
      const { patientField } = fieldMap[i];
      if (!patientField) continue;

      const val = values[i];
      if (!val) continue;

      if (patientField.startsWith('address.')) {
        const key = patientField.split('.')[1];
        address[key] = val;
      } else if (patientField.startsWith('emergencyContact.')) {
        const key = patientField.split('.')[1];
        emergency[key] = val;
      } else if (patientField === 'allergies' || patientField === 'antecedents') {
        patient[patientField] = val.split(';').map((s: string) => s.trim()).filter(Boolean);
      } else if (patientField === 'dateOfBirth') {
        patient[patientField] = new Date(val);
      } else {
        patient[patientField] = val;
      }
    }

    if (Object.keys(address).length > 0) patient.address = address;
    if (Object.keys(emergency).length > 0) patient.emergencyContact = emergency;

    return patient;
  }
}
