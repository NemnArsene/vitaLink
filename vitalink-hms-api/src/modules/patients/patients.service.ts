import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient, PatientDocument } from './schemas/patient.schema';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);

  constructor(
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<PatientDocument> {
    const patient = new this.patientModel(createPatientDto);
    return patient.save();
  }

  async findAll(): Promise<PatientDocument[]> {
    return this.patientModel.find().exec();
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
