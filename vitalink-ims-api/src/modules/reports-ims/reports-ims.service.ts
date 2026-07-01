import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InsuranceClaim, InsuranceClaimDocument } from '../claims-processing/schemas/insurance-claim.schema';
import { Policy, PolicyDocument } from '../policies/schemas/policy.schema';
import { Insured, InsuredDocument } from '../insureds/schemas/insured.schema';
import { PartnerHospital, PartnerHospitalDocument } from '../partner-hospitals/schemas/partner-hospital.schema';
import { GenerateImsReportDto } from './dto/report-ims.dto';

@Injectable()
export class ReportsImsService {
  private readonly logger = new Logger(ReportsImsService.name);

  constructor(
    @InjectModel(InsuranceClaim.name) private claimModel: Model<InsuranceClaimDocument>,
    @InjectModel(Policy.name) private policyModel: Model<PolicyDocument>,
    @InjectModel(Insured.name) private insuredModel: Model<InsuredDocument>,
    @InjectModel(PartnerHospital.name) private hospitalModel: Model<PartnerHospitalDocument>,
  ) {}

  async getDashboardKpis(): Promise<any> {
    const [totalClaims, pendingClaims, approvedClaims, rejectedClaims, totalPolicies, activePolicies, totalInsureds, totalHospitals] = await Promise.all([
      this.claimModel.countDocuments().exec(),
      this.claimModel.countDocuments({ statut: { $in: ['recue', 'en_revision'] } }).exec(),
      this.claimModel.countDocuments({ statut: 'approuvee' }).exec(),
      this.claimModel.countDocuments({ statut: 'rejetee' }).exec(),
      this.policyModel.countDocuments().exec(),
      this.policyModel.countDocuments({ statut: 'active' }).exec(),
      this.insuredModel.countDocuments().exec(),
      this.hospitalModel.countDocuments({ statut: 'actif' }).exec(),
    ]);

    const totalApprovedAmount = await this.claimModel.aggregate([
      { $match: { statut: { $in: ['approuvee', 'remboursee'] } } },
      { $group: { _id: null, total: { $sum: '$montantApprouve' } } },
    ]).exec();

    return {
      kpis: {
        totalClaims,
        pendingClaims,
        approvedClaims,
        rejectedClaims,
        approvalRate: totalClaims > 0 ? Math.round((approvedClaims / totalClaims) * 100) : 0,
        totalPolicies,
        activePolicies,
        totalInsureds,
        totalHospitals,
        totalApprovedAmount: totalApprovedAmount.length > 0 ? totalApprovedAmount[0].total : 0,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async generateReport(dto: GenerateImsReportDto): Promise<any> {
    const dateFilter: any = {};
    if (dto.startDate) dateFilter.$gte = new Date(dto.startDate);
    if (dto.endDate) dateFilter.$lte = new Date(dto.endDate);

    switch (dto.type) {
      case 'remboursements':
        return this.getClaimsReport(dateFilter);
      case 'litiges':
        return this.getDisputesReport(dateFilter);
      case 'plafonds':
        return this.getPlafondsReport();
      case 'finances':
        return this.getFinancesReport(dateFilter);
      case 'hopitaux':
        return this.getHospitalsReport();
      case 'activite':
        return this.getActivityReport(dateFilter);
      default:
        return { error: 'Invalid report type' };
    }
  }

  private async getClaimsReport(dateFilter: any): Promise<any> {
    const claims = await this.claimModel.find({ createdAt: dateFilter }).exec();
    return {
      type: 'Rapport des remboursements',
      totalClaims: claims.length,
      totalAmount: claims.reduce((s, c) => s + c.montantTotal, 0),
      byStatus: {
        recues: claims.filter(c => c.statut === 'recue').length,
        enRevision: claims.filter(c => c.statut === 'en_revision').length,
        approuvees: claims.filter(c => c.statut === 'approuvee').length,
        rejetees: claims.filter(c => c.statut === 'rejetee').length,
      },
    };
  }

  private async getDisputesReport(dateFilter: any): Promise<any> {
    return { type: 'Rapport des litiges', message: 'Disputes report - to be implemented' };
  }

  private async getPlafondsReport(): Promise<any> {
    return { type: 'Rapport des plafonds', message: 'Plafonds report - to be implemented' };
  }

  private async getFinancesReport(dateFilter: any): Promise<any> {
    const approvedClaims = await this.claimModel.find({ statut: 'approuvee', reviewedAt: dateFilter }).exec();
    return {
      type: 'Rapport financier',
      totalApproved: approvedClaims.reduce((s, c) => s + (c.montantApprouve || 0), 0),
      totalClaims: approvedClaims.length,
    };
  }

  private async getHospitalsReport(): Promise<any> {
    const hospitals = await this.hospitalModel.find().exec();
    return {
      type: 'Rapport hôpitaux partenaires',
      total: hospitals.length,
      active: hospitals.filter(h => h.statut === 'actif').length,
    };
  }

  private async getActivityReport(dateFilter: any): Promise<any> {
    return { type: "Rapport d'activité", period: dateFilter };
  }

  async getClaimsOverview(): Promise<any> {
    const monthlyBreakdown = await this.claimModel.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 }, total: { $sum: '$montantTotal' } } },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]).exec();

    return { monthlyBreakdown };
  }
}
