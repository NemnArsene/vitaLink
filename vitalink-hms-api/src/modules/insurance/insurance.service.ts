import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InsuranceCompany, InsuranceCompanyDocument } from './schemas/insurance-company.schema';
import { InsuranceContract, InsuranceContractDocument } from './schemas/insurance-contract.schema';

@Injectable()
export class InsuranceService {
  private readonly logger = new Logger(InsuranceService.name);

  constructor(
    @InjectModel(InsuranceCompany.name)
    private readonly companyModel: Model<InsuranceCompanyDocument>,
    @InjectModel(InsuranceContract.name)
    private readonly contractModel: Model<InsuranceContractDocument>,
  ) {}

  async getCompanies() {
    return this.companyModel.find({ status: 'ACTIVE' }).lean();
  }

  async getContracts() {
    return this.contractModel.find({}).populate('companyId').lean();
  }
}
