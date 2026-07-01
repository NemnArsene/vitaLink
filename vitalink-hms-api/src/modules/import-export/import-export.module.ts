import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { ImportExportController } from './import-export.controller';
import { ImportExportService } from './import-export.service';
import { Patient, PatientSchema } from '../patients/schemas/patient.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Patient.name, schema: PatientSchema }]),
    MulterModule.register({ dest: './uploads' }),
  ],
  controllers: [ImportExportController],
  providers: [ImportExportService],
  exports: [ImportExportService],
})
export class ImportExportModule {}
