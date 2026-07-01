import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LaboratoryController } from './laboratory.controller';
import { LaboratoryService } from './laboratory.service';
import { Laboratory, LaboratorySchema } from './schemas/laboratory.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Laboratory.name, schema: LaboratorySchema }]),
  ],
  controllers: [LaboratoryController],
  providers: [LaboratoryService],
  exports: [LaboratoryService],
})
export class LaboratoryModule {}
