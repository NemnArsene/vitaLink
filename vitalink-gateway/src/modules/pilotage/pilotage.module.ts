import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PilotageController } from './pilotage.controller';
import { PilotageService } from './pilotage.service';

@Module({
  imports: [HttpModule],
  controllers: [PilotageController],
  providers: [PilotageService],
  exports: [PilotageService],
})
export class PilotageModule {}
