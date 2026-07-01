import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoutingController } from './routing.controller';
import { RoutingService } from './routing.service';
import { RoutingConfig, RoutingConfigSchema } from './schemas/routing-config.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RoutingConfig.name, schema: RoutingConfigSchema }]),
  ],
  controllers: [RoutingController],
  providers: [RoutingService],
  exports: [RoutingService],
})
export class RoutingModule {}
