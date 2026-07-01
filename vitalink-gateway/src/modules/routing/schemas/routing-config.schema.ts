import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoutingConfigDocument = RoutingConfig & Document;

@Schema({ timestamps: true, collection: 'routing_config' })
export class RoutingConfig {
  @Prop({ required: true })
  hospitalId: string;

  @Prop({ required: true })
  hospitalName: string;

  @Prop({ required: true })
  insuranceProviderId: string;

  @Prop({ required: true })
  insuranceProviderName: string;

  @Prop({ default: 'actif', enum: ['actif', 'inactif', 'suspendu'] })
  statut: string;

  @Prop()
  imsApiUrl: string;

  @Prop({ type: [{ type: String, enum: ['eligibility', 'claims', 'notifications', 'billing'] }] })
  enabledServices: string[];

  @Prop({ type: Object })
  contractTerms: {
    tauxRemboursement: number;
    delaiTraitement: number;
    plafondAnnuel: number;
  };

  @Prop({ default: 1 })
  priority: number;

  @Prop()
  notes: string;
}

export const RoutingConfigSchema = SchemaFactory.createForClass(RoutingConfig);
