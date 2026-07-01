import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TarifsController } from './tarifs.controller';
import { TarifsService } from './tarifs.service';
import { Tarif, TarifSchema } from './schemas/tarif.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tarif.name, schema: TarifSchema }]),
  ],
  controllers: [TarifsController],
  providers: [TarifsService],
  exports: [TarifsService],
})
export class TarifsModule {}
