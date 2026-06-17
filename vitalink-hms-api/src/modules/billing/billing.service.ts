import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';
import { GatewayClientService } from '../gateway-client/gateway-client.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    private readonly gatewayClient: GatewayClientService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<InvoiceDocument> {
    const invoiceNumber = await this.generateInvoiceNumber();
    const montantTotal = createInvoiceDto.actes.reduce((sum, acte) => sum + acte.montant, 0);

    const invoice = new this.invoiceModel({
      ...createInvoiceDto,
      invoiceNumber,
      montantTotal,
      statut: 'brouillon',
    });

    return invoice.save();
  }

  async findAll(): Promise<InvoiceDocument[]> {
    return this.invoiceModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<InvoiceDocument> {
    const invoice = await this.invoiceModel.findById(id).exec();
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<InvoiceDocument> {
    const invoice = await this.invoiceModel
      .findByIdAndUpdate(id, updateInvoiceDto, { new: true })
      .exec();
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async submitToInsurance(id: string): Promise<InvoiceDocument> {
    const invoice = await this.findOne(id);

    if (invoice.statut !== 'brouillon') {
      throw new Error('Only draft invoices can be submitted');
    }

    // Send claim to gateway
    try {
      const claimResponse = await this.gatewayClient.submitClaim({
        invoiceId: (invoice as any)._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
        patientId: invoice.patientId.toString(),
        patientName: invoice.patientName,
        hospitalId: invoice.hospitalId,
        actes: invoice.actes,
        montantTotal: invoice.montantTotal,
      });

      invoice.statut = 'soumise';
      invoice.submittedAt = new Date();
      invoice.insuranceClaimId = claimResponse.claimId;

      return invoice.save();
    } catch (error) {
      this.logger.error(`Failed to submit claim to insurance: ${error.message}`);
      throw error;
    }
  }

  private async generateInvoiceNumber(): Promise<string> {
    const date = new Date();
    const prefix = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const count = await this.invoiceModel.countDocuments({ invoiceNumber: { $regex: prefix } });
    return `${prefix}-${String(count + 1).padStart(4, '0')}`;
  }
}
