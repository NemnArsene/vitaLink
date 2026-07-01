import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WrittenReport, WrittenReportDocument } from './schemas/written-report.schema';
import { CreateWrittenReportDto } from './dto/create-written-report.dto';
import { UpdateWrittenReportDto } from './dto/update-written-report.dto';

@Injectable()
export class WrittenReportsService {
  private readonly logger = new Logger(WrittenReportsService.name);

  constructor(
    @InjectModel(WrittenReport.name) private reportModel: Model<WrittenReportDocument>,
  ) {}

  async create(dto: CreateWrittenReportDto, authorId: string): Promise<WrittenReportDocument> {
    const report = new this.reportModel({
      title: dto.title,
      content: dto.content,
      authorId,
      recipientId: dto.recipientId,
      status: 'draft',
    });
    return report.save();
  }

  async findAllSent(authorId: string): Promise<WrittenReportDocument[]> {
    return this.reportModel.find({ authorId, status: 'sent', deletedAt: null }).sort({ sentAt: -1 }).exec();
  }

  async findAllDrafts(authorId: string): Promise<WrittenReportDocument[]> {
    return this.reportModel.find({ authorId, status: 'draft', deletedAt: null }).sort({ createdAt: -1 }).exec();
  }

  async findReceived(recipientId: string): Promise<WrittenReportDocument[]> {
    return this.reportModel.find({ recipientId, status: 'sent', deletedAt: null }).sort({ sentAt: -1 }).exec();
  }

  async findOne(id: string, userId: string): Promise<WrittenReportDocument> {
    const report = await this.reportModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    if (report.authorId !== userId && report.recipientId !== userId) {
      throw new ForbiddenException('You do not have access to this report');
    }
    return report;
  }

  async update(id: string, dto: UpdateWrittenReportDto, userId: string): Promise<WrittenReportDocument> {
    const report = await this.reportModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    if (report.authorId !== userId) {
      throw new ForbiddenException('Only the author can update a report');
    }
    if (report.status === 'sent') {
      throw new ForbiddenException('Cannot modify a sent report');
    }
    Object.assign(report, dto);
    return report.save();
  }

  async send(id: string, userId: string): Promise<WrittenReportDocument> {
    const report = await this.reportModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    if (report.authorId !== userId) {
      throw new ForbiddenException('Only the author can send a report');
    }
    if (report.status === 'sent') {
      throw new ForbiddenException('Report already sent');
    }
    report.status = 'sent';
    report.sentAt = new Date();
    return report.save();
  }

  async remove(id: string, userId: string): Promise<void> {
    const report = await this.reportModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    if (report.authorId !== userId) {
      throw new ForbiddenException('Only the author can delete a report');
    }
    if (report.status === 'sent') {
      throw new ForbiddenException('Cannot delete a sent report');
    }
    await this.reportModel.findByIdAndUpdate(id, { deletedAt: new Date() }).exec();
  }
}
