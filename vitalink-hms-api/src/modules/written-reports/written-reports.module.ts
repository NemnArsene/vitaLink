import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WrittenReportsController } from './written-reports.controller';
import { WrittenReportsService } from './written-reports.service';
import { WrittenReport, WrittenReportSchema } from './schemas/written-report.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WrittenReport.name, schema: WrittenReportSchema }]),
  ],
  controllers: [WrittenReportsController],
  providers: [WrittenReportsService],
  exports: [WrittenReportsService],
})
export class WrittenReportsModule {}
