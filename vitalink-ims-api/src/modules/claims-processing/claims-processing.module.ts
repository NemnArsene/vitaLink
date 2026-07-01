import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClaimsProcessingController } from './claims-processing.controller';
import { ClaimsProcessingService } from './claims-processing.service';
import { InsuranceClaim, InsuranceClaimSchema } from './schemas/insurance-claim.schema';
import { GatewayClientModule } from '../gateway-client/gateway-client.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: InsuranceClaim.name, schema: InsuranceClaimSchema }]),
    GatewayClientModule,
  ],
  controllers: [ClaimsProcessingController],
  providers: [ClaimsProcessingService],
  exports: [ClaimsProcessingService],
})
export class ClaimsProcessingModule {}
