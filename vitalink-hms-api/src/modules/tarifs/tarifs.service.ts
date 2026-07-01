import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tarif, TarifDocument } from './schemas/tarif.schema';
import { CreateTarifDto, UpdateTarifDto } from './dto/tarif.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/pagination.helper';

@Injectable()
export class TarifsService {
  private readonly logger = new Logger(TarifsService.name);

  constructor(
    @InjectModel(Tarif.name) private tarifModel: Model<TarifDocument>,
  ) {}

  async create(dto: CreateTarifDto): Promise<TarifDocument> {
    const tarif = new this.tarifModel({
      ...dto,
      isActive: true,
      validFrom: dto.validFrom ? new Date(dto.validFrom) : new Date(),
      validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
    });
    return tarif.save();
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<TarifDocument>> {
    return paginate(this.tarifModel, { deletedAt: null }, pagination);
  }

  async findActive(): Promise<TarifDocument[]> {
    return this.tarifModel.find({ isActive: true, deletedAt: null }).exec();
  }

  async findByCategory(category: string): Promise<TarifDocument[]> {
    return this.tarifModel.find({ category, isActive: true, deletedAt: null }).exec();
  }

  async findOne(id: string): Promise<TarifDocument> {
    const t = await this.tarifModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!t) throw new NotFoundException(`Tarif with ID ${id} not found`);
    return t;
  }

  async update(id: string, dto: UpdateTarifDto): Promise<TarifDocument> {
    const t = await this.tarifModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!t) throw new NotFoundException(`Tarif with ID ${id} not found`);
    return t;
  }

  async remove(id: string): Promise<void> {
    const result = await this.tarifModel.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true }).exec();
    if (!result) throw new NotFoundException(`Tarif with ID ${id} not found`);
  }
}
