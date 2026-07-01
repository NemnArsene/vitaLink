import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagingImsController } from './messaging-ims.controller';
import { MessagingImsService } from './messaging-ims.service';
import { MessageIms, MessageImsSchema } from './schemas/message-ims.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MessageIms.name, schema: MessageImsSchema }]),
  ],
  controllers: [MessagingImsController],
  providers: [MessagingImsService],
  exports: [MessagingImsService],
})
export class MessagingImsModule {}
