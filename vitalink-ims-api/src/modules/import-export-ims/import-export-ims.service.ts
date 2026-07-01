import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Policy, PolicyDocument } from '../policies/schemas/policy.schema';
import { Insured, InsuredDocument } from '../insureds/schemas/insured.schema';
import { PartnerHospital, PartnerHospitalDocument } from '../partner-hospitals/schemas/partner-hospital.schema';
import { ExportImsDataDto, ImportImsDataDto } from './dto/import-export-ims.dto';

@Injectable()
export class ImportExportImsService {
  private readonly logger = new Logger(ImportExportImsService.name);

  constructor(
    @InjectModel(Policy.name) private policyModel: Model<PolicyDocument>,
    @InjectModel(Insured.name) private insuredModel: Model<InsuredDocument>,
    @InjectModel(PartnerHospital.name) private hospitalModel: Model<PartnerHospitalDocument>,
  ) {}

  async exportData(dto: ExportImsDataDto): Promise<any> {
    let data: any[];
    switch (dto.entity) {
      case 'polices':
        data = await this.policyModel.find().lean().exec();
        break;
      case 'assures':
        data = await this.insuredModel.find().lean().exec();
        break;
      case 'hopitaux':
        data = await this.hospitalModel.find().lean().exec();
        break;
      default:
        data = [];
    }

    if (dto.format === 'csv') {
      return this.toCsv(data);
    }
    return { data, format: 'excel', fileName: `${dto.entity}_export` };
  }

  async importData(dto: ImportImsDataDto): Promise<any> {
    const records = typeof dto.data === 'string' ? JSON.parse(dto.data) : dto.data;
    const recordsArray = Array.isArray(records) ? records : [records];
    let imported = 0;

    switch (dto.entity) {
      case 'polices':
        for (const r of recordsArray) {
          await this.policyModel.findOneAndUpdate({ policyNumber: r.policyNumber }, { $set: r }, { upsert: true }).exec();
          imported++;
        }
        break;
      case 'assures':
        for (const r of recordsArray) {
          await this.insuredModel.findOneAndUpdate({ insuredNumber: r.insuredNumber }, { $set: r }, { upsert: true }).exec();
          imported++;
        }
        break;
      case 'hopitaux':
        for (const r of recordsArray) {
          await this.hospitalModel.findOneAndUpdate({ hospitalCode: r.hospitalCode }, { $set: r }, { upsert: true }).exec();
          imported++;
        }
        break;
    }

    return { imported, entity: dto.entity };
  }

  private toCsv(data: any[]): string {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    return [headers.join(','), ...data.map(row => headers.map(h => {
      const val = row[h];
      return val !== null && val !== undefined ? `"${String(val).replace(/"/g, '""')}"` : '';
    }).join(','))].join('\n');
  }
}
