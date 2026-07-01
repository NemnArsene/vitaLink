import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

export interface AuditEntry {
  action: string;
  entity: string;
  entityId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  actorEntityType: string;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  changes?: string[];
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  status?: string;
  errorMessage?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLog.name) private auditModel: Model<AuditLogDocument>,
  ) {}

  /**
   * Log an audit entry (append-only, never modified or deleted).
   */
  async log(entry: AuditEntry): Promise<AuditLogDocument> {
    const log = new this.auditModel({
      ...entry,
      previousState: entry.previousState || {},
      newState: entry.newState || {},
      changes: entry.changes || [],
      ipAddress: entry.ipAddress || 'unknown',
      userAgent: entry.userAgent || 'unknown',
      requestId: entry.requestId || 'unknown',
      status: entry.status || 'success',
      duration: entry.duration || 0,
      metadata: entry.metadata || {},
    });
    return log.save();
  }

  async findByEntity(entity: string, entityId: string): Promise<AuditLogDocument[]> {
    return this.auditModel.find({ entity, entityId }).sort({ createdAt: -1 }).exec();
  }

  async findByActor(actorId: string): Promise<AuditLogDocument[]> {
    return this.auditModel.find({ actorId }).sort({ createdAt: -1 }).limit(50).exec();
  }

  async findByAction(action: string, limit = 20): Promise<AuditLogDocument[]> {
    return this.auditModel.find({ action }).sort({ createdAt: -1 }).limit(limit).exec();
  }

  async getRecent(limit = 50): Promise<AuditLogDocument[]> {
    return this.auditModel.find().sort({ createdAt: -1 }).limit(limit).exec();
  }

  async search(filters: {
    entity?: string;
    action?: string;
    actorId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
    limit?: number;
  }): Promise<AuditLogDocument[]> {
    const query: any = {};
    if (filters.entity) query.entity = filters.entity;
    if (filters.action) query.action = filters.action;
    if (filters.actorId) query.actorId = filters.actorId;
    if (filters.status) query.status = filters.status;
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }
    return this.auditModel.find(query).sort({ createdAt: -1 }).limit(filters.limit || 50).exec();
  }

  async countByAction(): Promise<any[]> {
    return this.auditModel.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).exec();
  }
}
