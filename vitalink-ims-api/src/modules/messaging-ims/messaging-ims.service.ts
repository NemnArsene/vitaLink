import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MessageIms, MessageImsDocument } from './schemas/message-ims.schema';
import { CreateMessageImsDto } from './dto/message-ims.dto';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';

@Injectable()
export class MessagingImsService {
  private readonly logger = new Logger(MessagingImsService.name);

  constructor(
    @InjectModel(MessageIms.name) private messageModel: Model<MessageImsDocument>,
  ) {}

  async sendMessage(dto: CreateMessageImsDto, user?: JwtPayload): Promise<MessageImsDocument> {
    const message = new this.messageModel({
      ...dto,
      senderId: user?.sub || dto.senderId,
      senderName: user?.email || dto.senderName,
      senderRole: user?.role || dto.senderRole,
      folder: 'inbox',
      parentMessageId: dto.parentMessageId ? new Types.ObjectId(dto.parentMessageId) : undefined,
    });
    return message.save();
  }

  async getInbox(userId: string): Promise<MessageImsDocument[]> {
    return this.messageModel.find({ receiverId: userId, folder: 'inbox' }).sort({ createdAt: -1 }).exec();
  }

  async getSentMessages(senderId: string): Promise<MessageImsDocument[]> {
    return this.messageModel.find({ senderId, folder: { $ne: 'deleted' } }).sort({ createdAt: -1 }).exec();
  }

  async getArchived(userId: string): Promise<MessageImsDocument[]> {
    return this.messageModel.find({ receiverId: userId, folder: 'archived' }).sort({ createdAt: -1 }).exec();
  }

  async markAsRead(id: string): Promise<MessageImsDocument> {
    const msg = await this.messageModel.findByIdAndUpdate(id, { isRead: true, readAt: new Date() }, { new: true }).exec();
    if (!msg) throw new NotFoundException(`Message with ID ${id} not found`);
    return msg;
  }

  async archive(id: string): Promise<MessageImsDocument> {
    const msg = await this.messageModel.findByIdAndUpdate(id, { folder: 'archived' }, { new: true }).exec();
    if (!msg) throw new NotFoundException(`Message with ID ${id} not found`);
    return msg;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messageModel.countDocuments({ receiverId: userId, isRead: false, folder: 'inbox' }).exec();
  }

  async getConversation(messageId: string): Promise<MessageImsDocument[]> {
    const msg = await this.messageModel.findById(messageId).exec();
    if (!msg) throw new NotFoundException(`Message with ID ${messageId} not found`);

    const threadId = msg.parentMessageId || msg._id;
    return this.messageModel.find({ $or: [{ _id: threadId }, { parentMessageId: threadId }] }).sort({ createdAt: 1 }).exec();
  }

  async deleteMessage(id: string): Promise<void> {
    await this.messageModel.findByIdAndUpdate(id, { folder: 'deleted' }).exec();
  }
}
