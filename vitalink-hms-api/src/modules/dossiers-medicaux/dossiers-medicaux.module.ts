import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DossiersMedicauxController } from './dossiers-medicaux.controller';
import { DossiersMedicauxService } from './dossiers-medicaux.service';
import { DossierMedical, DossierMedicalSchema } from './schemas/dossier-medical.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DossierMedical.name, schema: DossierMedicalSchema }]),
  ],
  controllers: [DossiersMedicauxController],
  providers: [DossiersMedicauxService],
  exports: [DossiersMedicauxService],
})
export class DossiersMedicauxModule {}
