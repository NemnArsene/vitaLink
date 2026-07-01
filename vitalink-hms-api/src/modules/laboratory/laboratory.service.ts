import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Laboratory, LaboratoryDocument } from './schemas/laboratory.schema';
import { CreateLaboratoryDto, UpdateLaboratoryDto } from './dto/laboratory.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/pagination.helper';
import { GatewayClientService } from '../gateway-client/gateway-client.service';

@Injectable()
export class LaboratoryService {
  private readonly logger = new Logger(LaboratoryService.name);

  constructor(
    @InjectModel(Laboratory.name) private laboratoryModel: Model<LaboratoryDocument>,
    private readonly gatewayClient: GatewayClientService,
  ) {}

  async create(dto: CreateLaboratoryDto): Promise<LaboratoryDocument> {
    const exam = new this.laboratoryModel({
      ...dto,
      requestedAt: new Date(),
      statut: 'en_attente',
    });
    return exam.save();
  }

  async findAll(pagination: PaginationDto, requestedBy?: string): Promise<PaginatedResult<LaboratoryDocument>> {
    const filter: any = { deletedAt: null };
    if (requestedBy) {
      filter.requestedBy = { $regex: requestedBy, $options: 'i' };
    }
    return paginate(this.laboratoryModel, filter, pagination);
  }

  async findByDoctor(doctorName: string): Promise<LaboratoryDocument[]> {
    return this.laboratoryModel.find({
      requestedBy: { $regex: doctorName, $options: 'i' },
      deletedAt: null,
    }).sort({ requestedAt: -1 }).exec();
  }

  async findOne(id: string): Promise<LaboratoryDocument> {
    const exam = await this.laboratoryModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!exam) {
      throw new NotFoundException(`Laboratory exam with ID ${id} not found`);
    }
    return exam;
  }

  async findByPatient(patientId: string): Promise<LaboratoryDocument[]> {
    return this.laboratoryModel.find({ patientId, deletedAt: null }).sort({ requestedAt: -1 }).exec();
  }

  async update(id: string, dto: UpdateLaboratoryDto): Promise<LaboratoryDocument> {
    const exam = await this.laboratoryModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!exam) {
      throw new NotFoundException(`Laboratory exam with ID ${id} not found`);
    }
    return exam;
  }

  async recordResult(id: string, resultValue: string, resultText: string, interpretedBy: string): Promise<LaboratoryDocument> {
    const exam = await this.findOne(id);
    exam.resultValue = resultValue;
    exam.resultText = resultText;
    exam.interpretedBy = interpretedBy;
    exam.interpretedAt = new Date();
    exam.statut = 'termine';
    return exam.save();
  }

  async notifyDoctor(id: string): Promise<LaboratoryDocument> {
    const exam = await this.findOne(id);
    exam.doctorNotified = true;
    exam.notifiedAt = new Date();
    const saved = await exam.save();

    this.gatewayClient.emitNotification({
      type: 'laboratory.result_ready',
      data: { examId: id, patientName: exam.patientName, examType: exam.examName, requestedBy: exam.requestedBy },
      userId: exam.requestedBy,
      entityType: 'laboratory',
    }).catch(() => {});

    return saved;
  }

  async remove(id: string): Promise<void> {
    const result = await this.laboratoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Laboratory exam with ID ${id} not found`);
    }
  }

  async getPendingResults(): Promise<LaboratoryDocument[]> {
    return this.laboratoryModel.find({
      statut: { $in: ['termine', 'valide'] },
      doctorNotified: false,
      deletedAt: null,
    }).exec();
  }

  async getByStatus(statut: string): Promise<LaboratoryDocument[]> {
    return this.laboratoryModel.find({ statut, deletedAt: null }).sort({ requestedAt: -1 }).exec();
  }
}
