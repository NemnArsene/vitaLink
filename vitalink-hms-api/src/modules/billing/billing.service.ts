import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';
import { GatewayClientService } from '../gateway-client/gateway-client.service';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/pagination.helper';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    private readonly gatewayClient: GatewayClientService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<InvoiceDocument> {
    const invoiceNumber = await this.generateInvoiceNumber();
    const items = createInvoiceDto.actes || createInvoiceDto.lines || [];
    const montantTotal = createInvoiceDto.total ?? createInvoiceDto.subtotal ?? items.reduce((sum: number, item: any) => sum + (item.montant ?? item.total ?? item.unitPrice ?? 0), 0);

    const invoice = new this.invoiceModel({
      invoiceNumber,
      patientId: createInvoiceDto.patientId,
      patientName: createInvoiceDto.patientName,
      hospitalId: createInvoiceDto.hospitalId || 'HOP-001',
      actes: items.map((item: any) => ({
        acte: item.acte ?? item.label ?? item.description ?? '',
        code: item.code ?? item.actId ?? item.id ?? '',
        description: item.description ?? item.label ?? '',
        montant: item.montant ?? item.total ?? item.unitPrice ?? 0,
        dateActe: item.dateActe ?? createInvoiceDto.issuedAt ?? new Date(),
      })),
      montantTotal,
      montantRembourse: createInvoiceDto.insuranceCover ?? 0,
      insuranceCardNumber: createInvoiceDto.insuranceNumber ?? '',
      insuranceProvider: createInvoiceDto.insuranceCompany ?? '',
      notes: createInvoiceDto.notes ?? '',
    });

    const saved = await invoice.save();

    // Automatique : transmettre à l'assurance si la facture a une couverture
    if ((createInvoiceDto.insuranceCover ?? 0) > 0) {
      try {
        const claimResponse = await this.gatewayClient.submitClaim({
          invoiceId: (saved as any)._id.toString(),
          invoiceNumber: saved.invoiceNumber,
          patientId: saved.patientId.toString(),
          patientName: saved.patientName,
          hospitalId: saved.hospitalId,
          actes: saved.actes.map((a) => ({
            acte: a.acte,
            code: a.code,
            description: a.description,
            montant: a.montant,
            dateActe: a.dateActe,
          })),
          montantTotal: saved.montantTotal,
          insuranceCardNumber: saved.insuranceCardNumber || undefined,
        });

        saved.statut = 'soumise';
        saved.submittedAt = new Date();
        saved.insuranceClaimId = claimResponse.claimId;
        await saved.save();

        this.logger.log(`Invoice ${saved.invoiceNumber} auto-submitted to insurance`);
      } catch (error) {
        this.logger.error(`Auto-submit failed for invoice ${saved.invoiceNumber}: ${error.message}`);
      }
    }

    return saved;
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<InvoiceDocument>> {
    return paginate(this.invoiceModel, { deletedAt: null }, pagination);
  }

  async findOne(id: string): Promise<InvoiceDocument> {
    const invoice = await this.invoiceModel.findOne({ _id: id, deletedAt: null }).exec();
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

    try {
      const claimResponse = await this.gatewayClient.submitClaim({
        invoiceId: (invoice as any)._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
        patientId: invoice.patientId.toString(),
        patientName: invoice.patientName,
        hospitalId: invoice.hospitalId,
        actes: invoice.actes.map((a) => ({
          acte: a.acte,
          code: a.code,
          description: a.description,
          montant: a.montant,
          dateActe: a.dateActe,
        })),
        montantTotal: invoice.montantTotal,
        insuranceCardNumber: invoice.insuranceCardNumber || undefined,
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

  async remove(id: string): Promise<void> {
    const result = await this.invoiceModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
  }

  private async generateInvoiceNumber(): Promise<string> {
    const date = new Date();
    const prefix = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const count = await this.invoiceModel.countDocuments({ invoiceNumber: { $regex: prefix } });
    return `${prefix}-${String(count + 1).padStart(4, '0')}`;
  }
}
