import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Personnel, PersonnelDocument } from './schemas/personnel.schema';
import { CreatePersonnelDto, UpdatePersonnelDto } from './dto/personnel.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/pagination.helper';

@Injectable()
export class PersonnelService {
  private readonly logger = new Logger(PersonnelService.name);

  constructor(
    @InjectModel(Personnel.name) private personnelModel: Model<PersonnelDocument>,
  ) {}

  async create(dto: CreatePersonnelDto): Promise<PersonnelDocument> {
    const person = new this.personnelModel({ ...dto, statut: 'actif' });
    return person.save();
  }

  async findAll(pagination: PaginationDto, service?: string, role?: string): Promise<PaginatedResult<PersonnelDocument>> {
    const filter: any = {};
    if (service) filter.service = service;
    if (role) filter.role = role;
    return paginate(this.personnelModel, filter, pagination);
  }

  async findOne(id: string): Promise<PersonnelDocument> {
    const p = await this.personnelModel.findById(id).exec();
    if (!p) throw new NotFoundException(`Personnel with ID ${id} not found`);
    return p;
  }

  async update(id: string, dto: UpdatePersonnelDto): Promise<PersonnelDocument> {
    const p = await this.personnelModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!p) throw new NotFoundException(`Personnel with ID ${id} not found`);
    return p;
  }

  async remove(id: string): Promise<void> {
    const result = await this.personnelModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Personnel with ID ${id} not found`);
  }

  async updatePlanning(id: string, planning: { jour: string; debut: string; fin: string }[]): Promise<PersonnelDocument> {
    const p = await this.findOne(id);
    p.planning = planning;
    return p.save();
  }

  async getDoctors(): Promise<PersonnelDocument[]> {
    return this.personnelModel.find({
      role: { $in: ['medecin', 'medecin_specialiste', 'chirurgien'] }
    }).exec();
  }

  async getByService(): Promise<any[]> {
    return this.personnelModel.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 }, members: { $push: { id: '$_id', name: { $concat: ['$firstName', ' ', '$lastName'] }, role: '$role' } } } },
      { $sort: { _id: 1 } },
    ]).exec();
  }
}
