import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PartnerHospital, PartnerHospitalDocument } from './schemas/partner-hospital.schema';
import { CreatePartnerHospitalDto, UpdatePartnerHospitalDto } from './dto/partner-hospital.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/pagination.helper';

@Injectable()
export class PartnerHospitalsService {
  private readonly logger = new Logger(PartnerHospitalsService.name);

  constructor(
    @InjectModel(PartnerHospital.name) private hospitalModel: Model<PartnerHospitalDocument>,
  ) {}

  async create(dto: CreatePartnerHospitalDto): Promise<PartnerHospitalDocument> {
    const hospital = new this.hospitalModel({ ...dto, statut: 'actif', dateAgrement: new Date() });
    return hospital.save();
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<PartnerHospitalDocument>> {
    return paginate(this.hospitalModel, { deletedAt: null }, pagination);
  }

  async findActive(): Promise<PartnerHospitalDocument[]> {
    return this.hospitalModel.find({ statut: 'actif', deletedAt: null }).exec();
  }

  async findOne(id: string): Promise<PartnerHospitalDocument> {
    const h = await this.hospitalModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!h) throw new NotFoundException(`Hospital with ID ${id} not found`);
    return h;
  }

  async update(id: string, dto: UpdatePartnerHospitalDto): Promise<PartnerHospitalDocument> {
    const h = await this.hospitalModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!h) throw new NotFoundException(`Hospital with ID ${id} not found`);
    return h;
  }

  async remove(id: string): Promise<void> {
    const result = await this.hospitalModel.findByIdAndUpdate(id, { deletedAt: new Date() }).exec();
    if (!result) throw new NotFoundException(`Hospital with ID ${id} not found`);
  }

  async getStats(): Promise<any> {
    const [total, active] = await Promise.all([
      this.hospitalModel.countDocuments().exec(),
      this.hospitalModel.countDocuments({ statut: 'actif' }).exec(),
    ]);
    return { total, active, inactive: total - active };
  }
}
