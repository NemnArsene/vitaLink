import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WrittenReportsImsController } from './written-reports-ims.controller';
import { WrittenReportsImsService } from './written-reports-ims.service';
import { WrittenReportIms, WrittenReportImsSchema } from './schemas/written-report-ims.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WrittenReportIms.name, schema: WrittenReportImsSchema }]),
  ],
  controllers: [WrittenReportsImsController],
  providers: [WrittenReportsImsService],
  exports: [WrittenReportsImsService],
})
export class WrittenReportsImsModule {}
