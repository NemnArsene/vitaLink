import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient, PatientDocument } from './schemas/patient.schema';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/pagination.helper';
import { EligibilityService } from '../eligibility/eligibility.service';
import { DossiersMedicauxService } from '../dossiers-medicaux/dossiers-medicaux.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);

  constructor(
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    private readonly eligibilityService: EligibilityService,
    private readonly dossiersService: DossiersMedicauxService,
  ) {}

  async create(createPatientDto: CreatePatientDto, user: JwtPayload): Promise<PatientDocument> {
    const patientData: any = { ...createPatientDto };

    if (!patientData.medicalRecordNumber) {
      patientData.medicalRecordNumber = `MRN-${Date.now()}`;
    }

    if (patientData.insuranceCardNumber) {
      try {
        const eligibility = await this.eligibilityService.checkEligibility({
          patientId: 'temp',
          insuranceCardNumber: patientData.insuranceCardNumber,
        });

        if (eligibility.eligible) {
          patientData.insuranceStatus = 'ASSURE';
          patientData.insuranceCoveragePercentage = eligibility.coverageDetails.coveragePercentage || 80;
          patientData.insuranceProvider = eligibility.coverageDetails.provider || patientData.insuranceProvider;
        } else {
          patientData.insuranceStatus = 'NON_ASSURE';
          patientData.insuranceCoveragePercentage = 0;
        }
      } catch (error) {
        this.logger.warn(`Failed to verify insurance, marking as EN_ATTENTE: ${error.message}`);
        patientData.insuranceStatus = 'EN_ATTENTE';
        patientData.insuranceCoveragePercentage = 0;
      }
    } else {
      patientData.insuranceStatus = 'NON_ASSURE';
      patientData.insuranceCoveragePercentage = 0;
    }

    const patient = new this.patientModel(patientData);
    const savedPatient = await patient.save();

    try {
      await this.dossiersService.create(
        (savedPatient._id as any).toString(),
        {
          dateVisite: new Date().toISOString(),
          diagnostic: { code: 'TBD', libelle: 'En attente de consultation' },
          notes: 'Dossier créé automatiquement lors de l\'enregistrement',
        },
        user || { sub: 'system', email: 'system@vitalink', role: 'system', scope: 'scope:hospital', entityId: 'sys', entityType: 'hospital', permissions: [], jti: '' } as unknown as JwtPayload,
      );
      this.logger.log(`Created medical record for patient ${savedPatient._id}`);
    } catch (err) {
      this.logger.error(`Failed to create medical record for patient ${savedPatient._id}: ${err.message}`);
    }

    return savedPatient;
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<PatientDocument>> {
    return paginate(this.patientModel, {}, pagination);
  }

  async findOne(id: string): Promise<PatientDocument> {
    const patient = await this.patientModel.findById(id).exec();
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return patient;
  }

  async findByMedicalRecordNumber(mrn: string): Promise<PatientDocument> {
    const patient = await this.patientModel.findOne({ medicalRecordNumber: mrn }).exec();
    if (!patient) {
      throw new NotFoundException(`Patient with MRN ${mrn} not found`);
    }
    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<PatientDocument> {
    const patient = await this.patientModel
      .findByIdAndUpdate(id, updatePatientDto, { new: true })
      .exec();
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return patient;
  }

  async remove(id: string): Promise<void> {
    const result = await this.patientModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
  }
}
