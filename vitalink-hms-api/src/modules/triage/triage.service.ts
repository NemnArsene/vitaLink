import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Triage, TriageDocument } from './schemas/triage.schema';
import { CreateTriageDto, UpdateTriageDto } from './dto/triage.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/pagination.helper';

@Injectable()
export class TriageService {
  private readonly logger = new Logger(TriageService.name);

  constructor(
    @InjectModel(Triage.name) private triageModel: Model<TriageDocument>,
  ) {}

  async create(dto: CreateTriageDto): Promise<TriageDocument> {
    const triage = new this.triageModel({
      ...dto,
      triagedAt: new Date(),
      seenByDoctor: false,
    });
    return triage.save();
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<TriageDocument>> {
    return paginate(this.triageModel, { deletedAt: null }, pagination);
  }

  async findOne(id: string): Promise<TriageDocument> {
    const triage = await this.triageModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!triage) {
      throw new NotFoundException(`Triage with ID ${id} not found`);
    }
    return triage;
  }

  async findByPatient(patientId: string): Promise<TriageDocument[]> {
    return this.triageModel.find({ patientId, deletedAt: null }).sort({ triagedAt: -1 }).exec();
  }

  async markAsSeen(id: string): Promise<TriageDocument> {
    const triage = await this.findOne(id);
    triage.seenByDoctor = true;
    triage.seenAt = new Date();
    return triage.save();
  }

  async update(id: string, dto: UpdateTriageDto): Promise<TriageDocument> {
    const triage = await this.triageModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!triage) {
      throw new NotFoundException(`Triage with ID ${id} not found`);
    }
    return triage;
  }

  async remove(id: string): Promise<void> {
    const result = await this.triageModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Triage with ID ${id} not found`);
    }
  }

  async getWaitingList(): Promise<TriageDocument[]> {
    return this.triageModel.find({ seenByDoctor: false, deletedAt: null }).sort({ triageLevel: 1, triagedAt: 1 }).exec();
  }

  async updateStatus(id: string, statut: string): Promise<TriageDocument> {
    const triage = await this.findOne(id);
    triage.statut = statut;
    return triage.save();
  }
}
