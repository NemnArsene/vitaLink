import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InsuredsController } from './insureds.controller';
import { InsuredsService } from './insureds.service';
import { Insured, InsuredSchema } from './schemas/insured.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Insured.name, schema: InsuredSchema }]),
  ],
  controllers: [InsuredsController],
  providers: [InsuredsService],
  exports: [InsuredsService],
})
export class InsuredsModule {}
