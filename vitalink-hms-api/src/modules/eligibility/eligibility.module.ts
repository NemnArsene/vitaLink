import { Module } from '@nestjs/common';
import { EligibilityController } from './eligibility.controller';
import { EligibilityService } from './eligibility.service';
import { GatewayClientModule } from '../gateway-client/gateway-client.module';

@Module({
  imports: [GatewayClientModule],
  controllers: [EligibilityController],
  providers: [EligibilityService],
  exports: [EligibilityService],
})
export class EligibilityModule {}
