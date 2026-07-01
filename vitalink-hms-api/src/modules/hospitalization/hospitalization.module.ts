import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HospitalizationController } from './hospitalization.controller';
import { HospitalizationService } from './hospitalization.service';
import { Hospitalization, HospitalizationSchema } from './schemas/hospitalization.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hospitalization.name, schema: HospitalizationSchema }]),
  ],
  controllers: [HospitalizationController],
  providers: [HospitalizationService],
  exports: [HospitalizationService],
})
export class HospitalizationModule {}
