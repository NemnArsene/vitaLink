import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hospitalization, HospitalizationDocument } from './schemas/hospitalization.schema';
import { CreateHospitalizationDto, UpdateHospitalizationDto } from './dto/hospitalization.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/pagination.helper';

@Injectable()
export class HospitalizationService {
  private readonly logger = new Logger(HospitalizationService.name);

  constructor(
    @InjectModel(Hospitalization.name) private hospitalizationModel: Model<HospitalizationDocument>,
  ) {}

  async create(dto: CreateHospitalizationDto): Promise<HospitalizationDocument> {
    const hospitalization = new this.hospitalizationModel({
      ...dto,
      admissionDate: new Date(),
      statut: 'hospitalise',
      fraisTotal: 0,
      frais: { fraisChambre: 0, fraisSoins: 0, fraisMedicaments: 0, fraisExamens: 0, fraisDivers: 0 },
    });
    return hospitalization.save();
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<HospitalizationDocument>> {
    return paginate(this.hospitalizationModel, { deletedAt: null }, pagination);
  }

  async findOne(id: string): Promise<HospitalizationDocument> {
    const h = await this.hospitalizationModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!h) {
      throw new NotFoundException(`Hospitalization with ID ${id} not found`);
    }
    return h;
  }

  async findByPatient(patientId: string): Promise<HospitalizationDocument[]> {
    return this.hospitalizationModel.find({ patientId, deletedAt: null }).sort({ admissionDate: -1 }).exec();
  }

  async getCurrentPatients(): Promise<HospitalizationDocument[]> {
    return this.hospitalizationModel.find({ statut: 'hospitalise', deletedAt: null }).sort({ admissionDate: -1 }).exec();
  }

  async update(id: string, dto: UpdateHospitalizationDto): Promise<HospitalizationDocument> {
    const h = await this.hospitalizationModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!h) {
      throw new NotFoundException(`Hospitalization with ID ${id} not found`);
    }
    return h;
  }

  async discharge(id: string): Promise<HospitalizationDocument> {
    const h = await this.findOne(id);
    h.statut = 'sorti';
    h.dischargeDate = new Date();
    return h.save();
  }

  async addProduit(id: string, dto: { produit: string; quantite: number; prixUnitaire: number; administeredBy: string }): Promise<HospitalizationDocument> {
    const h = await this.findOne(id);
    if (!h.produitsUtilises) h.produitsUtilises = [];
    h.produitsUtilises.push({ ...dto, date: new Date() });
    const totalProduits = h.produitsUtilises.reduce((sum, p) => sum + (p.quantite * p.prixUnitaire), 0);
    h.fraisTotal = totalProduits + (h.frais?.fraisChambre || 0) + (h.frais?.fraisSoins || 0) + (h.frais?.fraisDivers || 0);
    return h.save();
  }

  async addSoin(id: string, dto: { soin: string; par: string; notes?: string }): Promise<HospitalizationDocument> {
    const h = await this.findOne(id);
    if (!h.soins) h.soins = [];
    h.soins.push({ date: new Date(), soin: dto.soin, par: dto.par, notes: dto.notes || '' });
    return h.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.hospitalizationModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Hospitalization with ID ${id} not found`);
    }
  }

  async getOccupationByService(): Promise<any[]> {
    return this.hospitalizationModel.aggregate([
      { $match: { statut: 'hospitalise', deletedAt: null } },
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).exec();
  }
}
