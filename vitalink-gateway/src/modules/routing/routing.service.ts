import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoutingConfig, RoutingConfigDocument } from './schemas/routing-config.schema';

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);

  constructor(
    @InjectModel(RoutingConfig.name) private routingModel: Model<RoutingConfigDocument>,
  ) {}

  async create(dto: Partial<RoutingConfig>): Promise<RoutingConfigDocument> {
    const config = new this.routingModel({ ...dto, statut: 'actif' });
    return config.save();
  }

  async findAll(): Promise<RoutingConfigDocument[]> {
    return this.routingModel.find().sort({ hospitalName: 1 }).exec();
  }

  async findOne(id: string): Promise<RoutingConfigDocument> {
    const config = await this.routingModel.findById(id).exec();
    if (!config) throw new NotFoundException(`Routing config with ID ${id} not found`);
    return config;
  }

  async findByHospital(hospitalId: string): Promise<RoutingConfigDocument[]> {
    return this.routingModel.find({ hospitalId, statut: 'actif' }).sort({ priority: 1 }).exec();
  }

  async findByInsurance(insuranceProviderId: string): Promise<RoutingConfigDocument[]> {
    return this.routingModel.find({ insuranceProviderId, statut: 'actif' }).exec();
  }

  /**
   * Route an eligibility check to the correct insurance provider
   */
  async routeEligibility(hospitalId: string, insuranceCardNumber: string): Promise<RoutingConfigDocument> {
    // First try to find by card number pattern
    const routes = await this.findByHospital(hospitalId);
    if (routes.length === 0) {
      throw new NotFoundException(`No active routing config found for hospital ${hospitalId}`);
    }
    return routes[0]; // Return highest priority route
  }

  /**
   * Route a claim to the correct insurance provider
   */
  async routeClaim(hospitalId: string, insuranceProviderId?: string): Promise<RoutingConfigDocument> {
    if (insuranceProviderId) {
      const routes = await this.findByInsurance(insuranceProviderId);
      const route = routes.find(r => r.hospitalId === hospitalId);
      if (route) return route;
    }
    // Fallback to any route for this hospital
    const routes = await this.findByHospital(hospitalId);
    if (routes.length === 0) {
      throw new NotFoundException(`No active routing config found for hospital ${hospitalId}`);
    }
    return routes[0];
  }

  async update(id: string, dto: Partial<RoutingConfig>): Promise<RoutingConfigDocument> {
    const config = await this.routingModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!config) throw new NotFoundException(`Routing config with ID ${id} not found`);
    return config;
  }

  async remove(id: string): Promise<void> {
    const result = await this.routingModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Routing config with ID ${id} not found`);
  }

  async getStats(): Promise<any> {
    const [total, active, byProvider] = await Promise.all([
      this.routingModel.countDocuments().exec(),
      this.routingModel.countDocuments({ statut: 'actif' }).exec(),
      this.routingModel.aggregate([
        { $group: { _id: '$insuranceProviderName', count: { $sum: 1 }, hospitals: { $addToSet: '$hospitalName' } } },
        { $sort: { count: -1 } },
      ]).exec(),
    ]);
    return { total, active, byProvider };
  }
}
