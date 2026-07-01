import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PartnerHospitalsController } from './partner-hospitals.controller';
import { PartnerHospitalsService } from './partner-hospitals.service';
import { PartnerHospital, PartnerHospitalSchema } from './schemas/partner-hospital.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PartnerHospital.name, schema: PartnerHospitalSchema }]),
  ],
  controllers: [PartnerHospitalsController],
  providers: [PartnerHospitalsService],
  exports: [PartnerHospitalsService],
})
export class PartnerHospitalsModule {}
