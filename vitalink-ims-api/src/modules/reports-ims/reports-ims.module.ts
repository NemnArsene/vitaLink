import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsImsController } from './reports-ims.controller';
import { ReportsImsService } from './reports-ims.service';
import { InsuranceClaim, InsuranceClaimSchema } from '../claims-processing/schemas/insurance-claim.schema';
import { Policy, PolicySchema } from '../policies/schemas/policy.schema';
import { Insured, InsuredSchema } from '../insureds/schemas/insured.schema';
import { PartnerHospital, PartnerHospitalSchema } from '../partner-hospitals/schemas/partner-hospital.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InsuranceClaim.name, schema: InsuranceClaimSchema },
      { name: Policy.name, schema: PolicySchema },
      { name: Insured.name, schema: InsuredSchema },
      { name: PartnerHospital.name, schema: PartnerHospitalSchema },
    ]),
  ],
  controllers: [ReportsImsController],
  providers: [ReportsImsService],
  exports: [ReportsImsService],
})
export class ReportsImsModule {}
