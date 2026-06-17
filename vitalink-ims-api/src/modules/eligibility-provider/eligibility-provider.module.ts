import { Module } from '@nestjs/common';
import { EligibilityProviderController } from './eligibility-provider.controller';
import { EligibilityProviderService } from './eligibility-provider.service';
import { PoliciesModule } from '../policies/policies.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Policy, PolicySchema } from '../policies/schemas/policy.schema';

@Module({
  imports: [
    PoliciesModule,
    MongooseModule.forFeature([{ name: Policy.name, schema: PolicySchema }])
  ],
  controllers: [EligibilityProviderController],
  providers: [EligibilityProviderService],
  exports: [EligibilityProviderService],
})
export class EligibilityProviderModule {}
