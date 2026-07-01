import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';
import { Consultation, ConsultationSchema } from './schemas/consultation.schema';
import { PersonnelModule } from '../personnel/personnel.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Consultation.name, schema: ConsultationSchema }]),
    PersonnelModule,
  ],
  controllers: [ConsultationsController],
  providers: [ConsultationsService],
  exports: [ConsultationsService],
})
export class ConsultationsModule {}
