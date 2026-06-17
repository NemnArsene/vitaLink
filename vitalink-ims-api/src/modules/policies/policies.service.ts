import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Policy, PolicyDocument } from './schemas/policy.schema';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';

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
    });
    return policy.save();
  }

  async findAll(): Promise<PolicyDocument[]> {
    return this.policyModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<PolicyDocument> {
    const policy = await this.policyModel.findById(id).exec();
    if (!policy) {
      throw new NotFoundException(`Policy with ID ${id} not found`);
    }
    return policy;
  }

  async findByCardNumber(cardNumber: string): Promise<PolicyDocument> {
    const policy = await this.policyModel.findOne({ insuranceCardNumber: cardNumber }).exec();
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
    const result = await this.policyModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Policy with ID ${id} not found`);
    }
  }
}
