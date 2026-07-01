import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient, PatientDocument } from '../patients/schemas/patient.schema';
import { Invoice, InvoiceDocument } from '../billing/schemas/invoice.schema';
import { Consultation, ConsultationDocument } from '../consultations/schemas/consultation.schema';
import { Hospitalization, HospitalizationDocument } from '../hospitalization/schemas/hospitalization.schema';
import { Personnel, PersonnelDocument } from '../personnel/schemas/personnel.schema';
import { GenerateReportDto } from './dto/report.dto';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Consultation.name) private consultationModel: Model<ConsultationDocument>,
    @InjectModel(Hospitalization.name) private hospitalizationModel: Model<HospitalizationDocument>,
    @InjectModel(Personnel.name) private personnelModel: Model<PersonnelDocument>,
  ) {}

  async generateReport(dto: GenerateReportDto): Promise<any> {
    const dateFilter: any = {};
    if (dto.startDate) dateFilter.$gte = new Date(dto.startDate);
    if (dto.endDate) dateFilter.$lte = new Date(dto.endDate);

    switch (dto.type) {
      case 'activity':
        return this.getActivityReport(dateFilter);
      case 'billing':
        return this.getBillingReport(dateFilter);
      case 'occupation':
        return this.getOccupationReport(dateFilter);
      case 'consultations':
        return this.getConsultationsReport(dateFilter);
      case 'finances':
        return this.getFinancesReport(dateFilter);
      case 'personnel':
        return this.getPersonnelReport();
      default:
        return { error: 'Invalid report type' };
    }
  }

  private async getActivityReport(dateFilter: any): Promise<any> {
    const [totalPatients, newPatients, totalConsultations, totalHospitalizations, totalTriages] = await Promise.all([
      this.patientModel.countDocuments().exec(),
      this.patientModel.countDocuments({ createdAt: dateFilter }).exec(),
      this.consultationModel.countDocuments({ consultationDate: dateFilter }).exec(),
      this.hospitalizationModel.countDocuments({ admissionDate: dateFilter }).exec(),
      0, // Triage count is complex, skip for now
    ]);

    return {
      type: 'Rapport d\'activité',
      period: dateFilter,
      statistics: {
        totalPatients,
        newPatients,
        totalConsultations,
        totalHospitalizations,
        totalTriages,
      },
    };
  }

  private async getBillingReport(dateFilter: any): Promise<any> {
    const invoices = await this.invoiceModel.find({ createdAt: dateFilter }).exec();
    const totalBilled = invoices.reduce((sum, inv) => sum + inv.montantTotal, 0);
    const totalPaid = invoices.filter(i => i.statut === 'remboursee').reduce((sum, inv) => sum + (inv.montantRembourse || 0), 0);

    return {
      type: 'Rapport de facturation',
      period: dateFilter,
      statistics: {
        totalInvoices: invoices.length,
        totalBilled,
        totalPaid,
        pendingAmount: totalBilled - totalPaid,
        byStatus: {
          draft: invoices.filter(i => i.statut === 'brouillon').length,
          submitted: invoices.filter(i => i.statut === 'soumise').length,
          approved: invoices.filter(i => i.statut === 'approuvee').length,
          rejected: invoices.filter(i => i.statut === 'rejetee').length,
          reimbursed: invoices.filter(i => i.statut === 'remboursee').length,
        },
      },
    };
  }

  private async getOccupationReport(dateFilter: any): Promise<any> {
    const hospitalizations = await this.hospitalizationModel.find({ admissionDate: dateFilter }).exec();
    const currentInpatients = await this.hospitalizationModel.countDocuments({ statut: 'hospitalise' }).exec();
    const avgStay = await this.hospitalizationModel.aggregate([
      { $match: { dischargeDate: { $ne: null } } },
      { $project: { days: { $divide: [{ $subtract: ['$dischargeDate', '$admissionDate'] }, 86400000] } } },
      { $group: { _id: null, avgDays: { $avg: '$days' } } },
    ]).exec();

    return {
      type: 'Rapport d\'occupation',
      period: dateFilter,
      statistics: {
        currentInpatients,
        totalAdmissions: hospitalizations.length,
        totalDischarges: hospitalizations.filter(h => h.statut !== 'hospitalise').length,
        averageStayDays: avgStay.length > 0 ? Math.round(avgStay[0].avgDays * 10) / 10 : 0,
        byService: await this.hospitalizationModel.aggregate([
          { $match: { statut: 'hospitalise' } },
          { $group: { _id: '$service', count: { $sum: 1 } } },
        ]).exec(),
      },
    };
  }

  private async getConsultationsReport(dateFilter: any): Promise<any> {
    const consultations = await this.consultationModel.find({ consultationDate: dateFilter }).exec();
    const byDoctor = await this.consultationModel.aggregate([
      { $match: { consultationDate: dateFilter } },
      { $group: { _id: '$doctorName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).exec();

    return {
      type: 'Rapport des consultations',
      period: dateFilter,
      statistics: {
        totalConsultations: consultations.length,
        dailyAverage: dateFilter.$gte ? Math.round(consultations.length / Math.max(1, Math.ceil((new Date(dateFilter.$lte || new Date()).getTime() - new Date(dateFilter.$gte).getTime()) / 86400000))) : 0,
        byDoctor,
      },
    };
  }

  private async getFinancesReport(dateFilter: any): Promise<any> {
    const invoices = await this.invoiceModel.find({ createdAt: dateFilter }).exec();
    const totalRevenue = invoices.filter(i => i.statut === 'remboursee').reduce((sum, inv) => sum + (inv.montantRembourse || 0), 0);
    const totalPending = invoices.filter(i => ['soumise', 'en_attente'].includes(i.statut)).reduce((sum, inv) => sum + inv.montantTotal, 0);

    return {
      type: 'Rapport financier',
      period: dateFilter,
      statistics: {
        totalRevenue,
        totalPending,
        expectedRevenue: totalRevenue + totalPending,
        monthlyBreakdown: await this.invoiceModel.aggregate([
          { $match: { createdAt: dateFilter } },
          { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: '$montantTotal' }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]).exec(),
      },
    };
  }

  private async getPersonnelReport(): Promise<any> {
    const [total, byService, byRole] = await Promise.all([
      this.personnelModel.countDocuments().exec(),
      this.personnelModel.aggregate([
        { $group: { _id: '$service', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).exec(),
      this.personnelModel.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).exec(),
    ]);

    return {
      type: 'Rapport du personnel',
      statistics: { total, byService, byRole },
    };
  }
}
