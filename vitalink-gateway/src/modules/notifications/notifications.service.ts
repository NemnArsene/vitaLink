import { Injectable, Logger } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

export interface NotificationEvent {
  type: string;
  data: any;
  userId?: string;
  entityType?: string;
  timestamp: Date;
}

export interface SseMessage {
  type?: string;
  data: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private eventSubject = new Subject<NotificationEvent>();

  /**
   * Emit a new notification event.
   * All connected SSE clients matching userId or entityType will receive it.
   */
  emit(event: Omit<NotificationEvent, 'timestamp'>): void {
    const notification: NotificationEvent = {
      ...event,
      timestamp: new Date(),
    };
    this.logger.log(`Notification emitted: ${event.type} for user ${event.userId || 'all'}`);
    this.eventSubject.next(notification);
  }

  /**
   * Subscribe to notifications for a specific user.
   * Returns an Observable that emits SSE-compatible messages.
   * NestJS SSE expects objects with { type, data } shape.
   */
  subscribe(userId: string): Observable<SseMessage> {
    return this.eventSubject.pipe(
      filter((event) => {
        if (!event.userId) return true; // broadcast to all
        return event.userId === userId;
      }),
      map((event) => ({
        data: JSON.stringify({
          ...event.data,
          _meta: {
            type: event.type,
            timestamp: event.timestamp.toISOString(),
            id: uuidv4(),
          },
        }),
      })),
    );
  }

  /**
   * Convenience methods for common notification types
   */
  notifyClaimStatusChange(claimId: string, status: string, userIds: string[]): void {
    for (const userId of userIds) {
      this.emit({
        type: 'claim.status_changed',
        data: { claimId, status },
        userId,
        entityType: 'claim',
      });
    }
  }

  notifyNewClaim(claimData: any, userIds: string[]): void {
    for (const userId of userIds) {
      this.emit({
        type: 'claim.new',
        data: claimData,
        userId,
        entityType: 'claim',
      });
    }
  }

  notifyEligibilityResult(patientId: string, result: any, userId: string): void {
    this.emit({
      type: 'eligibility.result',
      data: { patientId, result },
      userId,
      entityType: 'eligibility',
    });
  }

  notifyNewMessage(message: any, userId: string): void {
    this.emit({
      type: 'message.new',
      data: message,
      userId,
      entityType: 'message',
    });
  }

  notifySystemAlert(alert: { level: string; message: string; source: string }): void {
    this.emit({
      type: 'system.alert',
      data: alert,
      entityType: 'system',
    });
  }
}
