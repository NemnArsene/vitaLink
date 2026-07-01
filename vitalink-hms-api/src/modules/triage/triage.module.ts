import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TriageController } from './triage.controller';
import { TriageService } from './triage.service';
import { Triage, TriageSchema } from './schemas/triage.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Triage.name, schema: TriageSchema }]),
  ],
  controllers: [TriageController],
  providers: [TriageService],
  exports: [TriageService],
})
export class TriageModule {}
