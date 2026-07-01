import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Consultation, ConsultationDocument } from './schemas/consultation.schema';
import { CreateConsultationDto, UpdateConsultationDto } from './dto/consultation.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/pagination.helper';
import { PersonnelService } from '../personnel/personnel.service';

@Injectable()
export class ConsultationsService {
  private readonly logger = new Logger(ConsultationsService.name);

  constructor(
    @InjectModel(Consultation.name) private consultationModel: Model<ConsultationDocument>,
    private readonly personnelService: PersonnelService,
  ) {}

  async create(dto: CreateConsultationDto): Promise<ConsultationDocument> {
    if (dto.doctorName) {
      const personnelList = await this.personnelService.findAll({ page: 1, limit: 100 }, undefined, undefined);
      const doctor = personnelList.data.find(
        (p: any) => `${p.firstName} ${p.lastName}`.toLowerCase() === dto.doctorName!.toLowerCase(),
      );
      if (doctor && doctor.dailyPatientLimit) {
        const today = new Date();
        const dailyList = await this.getDoctorDailyList(dto.doctorName, today);
        if (dailyList.length >= doctor.dailyPatientLimit) {
          throw new BadRequestException(
            `Limite journalière atteinte pour ${dto.doctorName} (${doctor.dailyPatientLimit} patients/jour)`,
          );
        }
      }
    }
    const consultation = new this.consultationModel({
      ...dto,
      consultationDate: new Date(),
    });
    return consultation.save();
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<ConsultationDocument>> {
    return paginate(this.consultationModel, { deletedAt: null }, pagination);
  }

  async findOne(id: string): Promise<ConsultationDocument> {
    const consultation = await this.consultationModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!consultation) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }
    return consultation;
  }

  async findByPatient(patientId: string): Promise<ConsultationDocument[]> {
    return this.consultationModel.find({ patientId, deletedAt: null }).sort({ consultationDate: -1 }).exec();
  }

  async findByDoctor(doctorName: string): Promise<ConsultationDocument[]> {
    return this.consultationModel.find({ doctorName, deletedAt: null }).sort({ consultationDate: -1 }).exec();
  }

  async update(id: string, dto: UpdateConsultationDto): Promise<ConsultationDocument> {
    const consultation = await this.consultationModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!consultation) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }
    return consultation;
  }

  async remove(id: string): Promise<void> {
    const result = await this.consultationModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }
  }

  async getDoctorDailyList(doctorName: string, date: Date): Promise<ConsultationDocument[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.consultationModel.find({
      doctorName,
      consultationDate: { $gte: startOfDay, $lte: endOfDay },
      deletedAt: null,
    }).sort({ consultationDate: 1 }).exec();
  }
}
