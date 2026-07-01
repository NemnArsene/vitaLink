import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Insured, InsuredDocument } from './schemas/insured.schema';
import { CreateInsuredDto, UpdateInsuredDto } from './dto/insured.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/pagination.helper';

@Injectable()
export class InsuredsService {
  private readonly logger = new Logger(InsuredsService.name);

  constructor(
    @InjectModel(Insured.name) private insuredModel: Model<InsuredDocument>,
  ) {}

  async create(dto: CreateInsuredDto): Promise<InsuredDocument> {
    const insured = new this.insuredModel({
      ...dto,
      statut: 'actif',
      dateAffiliation: new Date(),
    });
    return insured.save();
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<InsuredDocument>> {
    return paginate(this.insuredModel, { deletedAt: null }, pagination);
  }

  async findOne(id: string): Promise<InsuredDocument> {
    const i = await this.insuredModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!i) throw new NotFoundException(`Insured with ID ${id} not found`);
    return i;
  }

  async findByPolicy(policyId: string): Promise<InsuredDocument[]> {
    return this.insuredModel.find({ policyId, deletedAt: null }).exec();
  }

  async update(id: string, dto: UpdateInsuredDto): Promise<InsuredDocument> {
    const i = await this.insuredModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!i) throw new NotFoundException(`Insured with ID ${id} not found`);
    return i;
  }

  async remove(id: string): Promise<void> {
    const result = await this.insuredModel.findByIdAndUpdate(id, { deletedAt: new Date() }).exec();
    if (!result) throw new NotFoundException(`Insured with ID ${id} not found`);
  }

  async checkEligibility(cardNumber: string): Promise<any> {
    const insured = await this.insuredModel.findOne({ insuranceCardNumber: cardNumber, deletedAt: null }).exec();
    if (!insured) {
      return { eligible: false, message: 'Numéro de carte non trouvé' };
    }

    const now = new Date();
    const isExpired = insured.dateFinCouverture && new Date(insured.dateFinCouverture) < now;
    const isActive = insured.statut === 'actif' && !isExpired;

    return {
      eligible: isActive,
      insured: {
        id: insured._id,
        name: `${insured.firstName} ${insured.lastName}`,
        insuredNumber: insured.insuredNumber,
        policyNumber: insured.policyNumber,
        providerName: insured.providerName,
        dateFinCouverture: insured.dateFinCouverture,
      },
      statut: insured.statut,
      message: isActive ? 'Assuré éligible' : 'Assuré non éligible',
    };
  }

  async getPlafondConsumption(id: string): Promise<any> {
    const insured = await this.findOne(id);
    return {
      insuredName: `${insured.firstName} ${insured.lastName}`,
      policyNumber: insured.policyNumber,
      consommation: insured.consommationPlafond || [],
      totalConsomme: (insured.consommationPlafond || []).reduce((sum, item) => sum + (item.consomme || 0), 0),
    };
  }

  async updatePlafondConsumption(id: string, code: string, montant: number): Promise<InsuredDocument> {
    const insured = await this.findOne(id);
    if (!insured.consommationPlafond) insured.consommationPlafond = [];
    const existing = insured.consommationPlafond.find(c => c.code === code);
    if (existing) {
      existing.consomme = (existing.consomme || 0) + montant;
      existing.date = new Date();
    } else {
      insured.consommationPlafond.push({ code, montantMax: montant, consomme: montant, date: new Date() });
    }
    return insured.save();
  }
}
