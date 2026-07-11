import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InsuranceController } from './insurance.controller';
import { InsuranceService } from './insurance.service';
import { InsuranceCompany, InsuranceCompanySchema } from './schemas/insurance-company.schema';
import { InsuranceContract, InsuranceContractSchema } from './schemas/insurance-contract.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InsuranceCompany.name, schema: InsuranceCompanySchema },
      { name: InsuranceContract.name, schema: InsuranceContractSchema },
    ]),
  ],
  controllers: [InsuranceController],
  providers: [InsuranceService],
  exports: [InsuranceService],
})
export class InsuranceModule {}
