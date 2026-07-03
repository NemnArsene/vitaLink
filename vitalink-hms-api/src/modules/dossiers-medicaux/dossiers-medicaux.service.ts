import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DossierMedical, DossierMedicalDocument } from './schemas/dossier-medical.schema';
import { CreateDossierDto } from './dto/create-dossier.dto';
import { AddSoinDto } from './dto/add-soin.dto';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';

@Injectable()
export class DossiersMedicauxService {
  private readonly logger = new Logger(DossiersMedicauxService.name);

  constructor(
    @InjectModel(DossierMedical.name) private dossierModel: Model<DossierMedicalDocument>,
  ) {}

  async create(
    patientId: string,
    createDossierDto: CreateDossierDto,
    user: JwtPayload,
  ): Promise<DossierMedicalDocument> {
    const dossier = new this.dossierModel({
      patientId: new Types.ObjectId(patientId),
      dateVisite: new Date(createDossierDto.dateVisite),
      diagnostic: createDossierDto.diagnostic,
      symptomes: createDossierDto.symptomes || [],
      soins: [],
      acteurId: user.sub,
      rôleActeur: this.mapRoleToDisplay(user.role),
      notes: createDossierDto.notes,
      statut: 'ouvert',
    });

    return dossier.save();
  }

  async addSoin(
    patientId: string,
    dossierId: string,
    addSoinDto: AddSoinDto,
    user: JwtPayload,
  ): Promise<DossierMedicalDocument> {
    const dossier = await this.dossierModel.findOne({
      _id: dossierId,
      patientId: new Types.ObjectId(patientId),
      deletedAt: null,
    }).exec();

    if (!dossier) {
      throw new NotFoundException(`Dossier with ID ${dossierId} not found for patient ${patientId}`);
    }

    if (dossier.statut === 'clôturé') {
      throw new BadRequestException('Cannot add treatments to a closed medical record');
    }

    dossier.soins.push({
      type: addSoinDto.type,
      nom: addSoinDto.nom,
      posologie: addSoinDto.posologie,
      réaliséLe: new Date(addSoinDto.réaliséLe),
      réaliséPar: user.sub,
    } as any);

    return dossier.save();
  }

  async findAllByPatient(patientId: string): Promise<DossierMedicalDocument[]> {
    return this.dossierModel
      .find({ patientId: new Types.ObjectId(patientId), deletedAt: null })
      .sort({ dateVisite: -1 })
      .exec();
  }

  async findOne(patientId: string, dossierId: string): Promise<DossierMedicalDocument> {
    const dossier = await this.dossierModel.findOne({
      _id: dossierId,
      patientId: new Types.ObjectId(patientId),
      deletedAt: null,
    }).exec();

    if (!dossier) {
      throw new NotFoundException(`Dossier with ID ${dossierId} not found for patient ${patientId}`);
    }

    return dossier;
  }

  private mapRoleToDisplay(role: string): string {
    const roleMap: Record<string, string> = {
      medecin: 'Médecin',
      infirmier_soins: 'Infirmier',
      infirmiere_triage: 'Infirmier',
      laborantin: 'Laborantin',
      pharmacien: 'Pharmacien',
      agent_accueil: 'Agent_accueil',
      admin_hopital: 'Admin_hopital',
      directeur_hopital: 'Médecin',
      // Cas service/system
      service: 'Admin_hopital',
      system: 'Admin_hopital',
    };
    return roleMap[role?.toLowerCase()] || 'Admin_hopital';
  }
}
