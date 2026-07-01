import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Prescription, PrescriptionDocument } from './schemas/prescription.schema';
import { CreatePrescriptionDto, UpdatePrescriptionDto } from './dto/prescription.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/pagination.helper';

@Injectable()
export class PrescriptionsService {
  private readonly logger = new Logger(PrescriptionsService.name);

  constructor(
    @InjectModel(Prescription.name) private prescriptionModel: Model<PrescriptionDocument>,
  ) {}

  async create(dto: CreatePrescriptionDto): Promise<PrescriptionDocument> {
    const prescription = new this.prescriptionModel({
      ...dto,
      prescriptionDate: new Date(),
      isValid: true,
    });
    return prescription.save();
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<PrescriptionDocument>> {
    return paginate(this.prescriptionModel, { deletedAt: null }, pagination);
  }

  async findOne(id: string): Promise<PrescriptionDocument> {
    const p = await this.prescriptionModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!p) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }
    return p;
  }

  async findByPatient(patientId: string): Promise<PrescriptionDocument[]> {
    return this.prescriptionModel.find({ patientId, deletedAt: null }).sort({ prescriptionDate: -1 }).exec();
  }

  async findByDoctor(doctorName: string): Promise<PrescriptionDocument[]> {
    return this.prescriptionModel.find({ doctorName, deletedAt: null }).sort({ prescriptionDate: -1 }).exec();
  }

  async update(id: string, dto: UpdatePrescriptionDto): Promise<PrescriptionDocument> {
    const p = await this.prescriptionModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!p) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }
    return p;
  }

  async remove(id: string): Promise<void> {
    const result = await this.prescriptionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }
  }

  async invalidate(id: string): Promise<PrescriptionDocument> {
    const p = await this.findOne(id);
    p.isValid = false;
    return p.save();
  }
}
