import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient, PatientDocument } from '../patients/schemas/patient.schema';
import { Invoice, InvoiceDocument } from '../billing/schemas/invoice.schema';
import { Consultation, ConsultationDocument } from '../consultations/schemas/consultation.schema';
import { Hospitalization, HospitalizationDocument } from '../hospitalization/schemas/hospitalization.schema';
import { Personnel, PersonnelDocument } from '../personnel/schemas/personnel.schema';
import { Triage, TriageDocument } from '../triage/schemas/triage.schema';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Consultation.name) private consultationModel: Model<ConsultationDocument>,
    @InjectModel(Hospitalization.name) private hospitalizationModel: Model<HospitalizationDocument>,
    @InjectModel(Personnel.name) private personnelModel: Model<PersonnelDocument>,
    @InjectModel(Triage.name) private triageModel: Model<TriageDocument>,
  ) {}

  async getDashboard(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalPatients,
      totalStaff,
      todayConsultations,
      currentInpatients,
      pendingBilling,
      waitingTriage,
    ] = await Promise.all([
      this.patientModel.countDocuments().exec(),
      this.personnelModel.countDocuments({ statut: 'actif' }).exec(),
      this.consultationModel.countDocuments({
        consultationDate: { $gte: today, $lt: tomorrow },
      }).exec(),
      this.hospitalizationModel.countDocuments({ statut: 'hospitalise' }).exec(),
      this.invoiceModel.countDocuments({ statut: { $in: ['brouillon', 'soumise'] } }).exec(),
      this.triageModel.countDocuments({ seenByDoctor: false }).exec(),
    ]);

    const todayRevenue = await this.invoiceModel.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tomorrow }, statut: 'remboursee' } },
      { $group: { _id: null, total: { $sum: '$montantRembourse' } } },
    ]).exec();

    const urgentTriages = await this.triageModel.countDocuments({
      seenByDoctor: false,
      triageLevel: { $in: ['P1_URGENCE', 'P2_TRES_URGENT', 'P3_URGENT'] },
    }).exec();

    return {
      kpis: {
        totalPatients,
        totalStaff,
        todayConsultations,
        currentInpatients,
        pendingBilling,
        waitingTriage,
        urgentCases: urgentTriages,
        todayRevenue: todayRevenue.length > 0 ? todayRevenue[0].total : 0,
      },
      occupancyRate: currentInpatients > 0 ? Math.round((currentInpatients / 100) * 100) : 0,
      timestamp: new Date().toISOString(),
    };
  }

  async getPatientStats(): Promise<any> {
    const total = await this.patientModel.countDocuments().exec();
    const newThisMonth = await this.patientModel.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    }).exec();

    return { total, newThisMonth };
  }

  async getRevenueStats(): Promise<any> {
    const [totalBilled, totalReimbursed, monthly] = await Promise.all([
      this.invoiceModel.aggregate([{ $group: { _id: null, total: { $sum: '$montantTotal' } } }]).exec(),
      this.invoiceModel.aggregate([{ $match: { statut: 'remboursee' } }, { $group: { _id: null, total: { $sum: '$montantRembourse' } } }]).exec(),
      this.invoiceModel.aggregate([
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: '$montantTotal' } } },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]).exec(),
    ]);

    return {
      totalBilled: totalBilled.length > 0 ? totalBilled[0].total : 0,
      totalReimbursed: totalReimbursed.length > 0 ? totalReimbursed[0].total : 0,
      monthly,
    };
  }

  async getOccupationStats(): Promise<any> {
    const byService = await this.hospitalizationModel.aggregate([
      { $match: { statut: 'hospitalise' } },
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).exec();

    return { byService };
  }

  async getActivityStats(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [consultations, admissions, discharges] = await Promise.all([
      this.consultationModel.countDocuments({ consultationDate: { $gte: today } }).exec(),
      this.hospitalizationModel.countDocuments({ admissionDate: { $gte: today } }).exec(),
      this.hospitalizationModel.countDocuments({ dischargeDate: { $gte: today } }).exec(),
    ]);

    return { consultations, admissions, discharges, date: today };
  }
}
