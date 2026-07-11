import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Policy, PolicyDocument } from './schemas/policy.schema';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/pagination.helper';

@Injectable()
export class PoliciesService {
  private readonly logger = new Logger(PoliciesService.name);

  constructor(
    @InjectModel(Policy.name) private policyModel: Model<PolicyDocument>,
  ) {}

  async create(createPolicyDto: CreatePolicyDto): Promise<PolicyDocument> {
    const policy = new this.policyModel({
      ...createPolicyDto,
      statut: 'active',
      dateDebut: createPolicyDto.dateDebut || new Date(),
      annualPremium: createPolicyDto.monthlyPremium ? createPolicyDto.monthlyPremium * 12 : 0,
      remainingCoverage: createPolicyDto.coverageAmount || 5000000,
    });
    return policy.save();
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<PolicyDocument>> {
    return paginate(this.policyModel, { deletedAt: null }, pagination);
  }

  async findOne(id: string): Promise<PolicyDocument> {
    const policy = await this.policyModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!policy) {
      throw new NotFoundException(`Policy with ID ${id} not found`);
    }
    return policy;
  }

  async findByCardNumber(cardNumber: string): Promise<PolicyDocument> {
    const policy = await this.policyModel.findOne({ insuranceCardNumber: cardNumber, deletedAt: null }).exec();
    if (!policy) {
      throw new NotFoundException(`Policy with card number ${cardNumber} not found`);
    }
    return policy;
  }

  async update(id: string, updatePolicyDto: UpdatePolicyDto): Promise<PolicyDocument> {
    const policy = await this.policyModel
      .findByIdAndUpdate(id, updatePolicyDto, { new: true })
      .exec();
    if (!policy) {
      throw new NotFoundException(`Policy with ID ${id} not found`);
    }
    return policy;
  }

  async remove(id: string): Promise<void> {
    const result = await this.policyModel.findByIdAndUpdate(id, { deletedAt: new Date() }).exec();
    if (!result) {
      throw new NotFoundException(`Policy with ID ${id} not found`);
    }
  }
}
