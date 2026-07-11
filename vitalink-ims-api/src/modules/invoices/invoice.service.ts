import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/pagination.helper';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
  ) {}

  async findAll(status?: string, pagination?: PaginationDto): Promise<PaginatedResult<InvoiceDocument>> {
    const filter: any = { deletedAt: null };
    if (status) {
      filter.statut = status;
    }
    return paginate(this.invoiceModel, filter, pagination || new PaginationDto());
  }

  async findOne(id: string): Promise<InvoiceDocument> {
    const invoice = await this.invoiceModel.findById(id).exec();
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async findByInvoiceId(invoiceId: string): Promise<InvoiceDocument | null> {
    return this.invoiceModel.findOne({ invoiceId, deletedAt: null }).exec();
  }
}
