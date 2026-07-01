import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateMessageDto } from './dto/message.dto';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { GatewayClientService } from '../gateway-client/gateway-client.service';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private readonly gatewayClient: GatewayClientService,
  ) {}

  async sendMessage(dto: CreateMessageDto, user?: JwtPayload): Promise<MessageDocument> {
    const message = new this.messageModel({
      ...dto,
      senderId: user?.sub || dto.senderId,
      senderName: user?.email || dto.senderName,
      senderRole: user?.role || dto.senderRole,
      folder: 'inbox',
      parentMessageId: dto.parentMessageId ? new Types.ObjectId(dto.parentMessageId) : undefined,
    });
    const saved = await message.save();

    this.gatewayClient.emitNotification({
      type: 'message.new',
      data: { messageId: (saved._id as string).toString(), senderName: saved.senderName, content: saved.content, subject: saved.subject },
      userId: saved.receiverId,
      entityType: 'message',
    }).catch(() => {});

    return saved;
  }

  async getInbox(userId: string): Promise<MessageDocument[]> {
    return this.messageModel.find({ receiverId: userId, folder: 'inbox' }).sort({ createdAt: -1 }).exec();
  }

  async getSentMessages(senderId: string): Promise<MessageDocument[]> {
    return this.messageModel.find({ senderId, folder: { $ne: 'deleted' } }).sort({ createdAt: -1 }).exec();
  }

  async getArchived(userId: string): Promise<MessageDocument[]> {
    return this.messageModel.find({ $or: [{ receiverId: userId, folder: 'archived' }] }).sort({ createdAt: -1 }).exec();
  }

  async markAsRead(id: string): Promise<MessageDocument> {
    const msg = await this.messageModel.findByIdAndUpdate(id, { isRead: true, readAt: new Date() }, { new: true }).exec();
    if (!msg) throw new NotFoundException(`Message with ID ${id} not found`);
    return msg;
  }

  async archive(id: string): Promise<MessageDocument> {
    const msg = await this.messageModel.findByIdAndUpdate(id, { folder: 'archived' }, { new: true }).exec();
    if (!msg) throw new NotFoundException(`Message with ID ${id} not found`);
    return msg;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messageModel.countDocuments({ receiverId: userId, isRead: false, folder: 'inbox' }).exec();
  }

  async getConversation(messageId: string): Promise<MessageDocument[]> {
    const msg = await this.messageModel.findById(messageId).exec();
    if (!msg) throw new NotFoundException(`Message with ID ${messageId} not found`);

    const threadId = msg.parentMessageId || msg._id;
    return this.messageModel.find({ $or: [{ _id: threadId }, { parentMessageId: threadId }] }).sort({ createdAt: 1 }).exec();
  }

  async deleteMessage(id: string): Promise<void> {
    await this.messageModel.findByIdAndUpdate(id, { folder: 'deleted' }).exec();
  }
}
