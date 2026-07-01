import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImportExportImsController } from './import-export-ims.controller';
import { ImportExportImsService } from './import-export-ims.service';
import { Policy, PolicySchema } from '../policies/schemas/policy.schema';
import { Insured, InsuredSchema } from '../insureds/schemas/insured.schema';
import { PartnerHospital, PartnerHospitalSchema } from '../partner-hospitals/schemas/partner-hospital.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Policy.name, schema: PolicySchema },
      { name: Insured.name, schema: InsuredSchema },
      { name: PartnerHospital.name, schema: PartnerHospitalSchema },
    ]),
  ],
  controllers: [ImportExportImsController],
  providers: [ImportExportImsService],
  exports: [ImportExportImsService],
})
export class ImportExportImsModule {}
