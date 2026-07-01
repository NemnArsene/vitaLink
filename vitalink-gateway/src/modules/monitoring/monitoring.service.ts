import { Injectable, Logger } from '@nestjs/common';
import { Counter, Histogram, Gauge, register } from 'prom-client';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  // Request metrics
  private readonly httpRequestDuration: Histogram;
  private readonly httpRequestTotal: Counter;

  // Business metrics
  private readonly claimsCreatedTotal: Counter;
  private readonly claimsApprovedTotal: Counter;
  private readonly claimsRejectedTotal: Counter;
  private readonly claimsDisputedTotal: Counter;

  // System metrics
  private readonly activeConnections: Gauge;
  private readonly rabbitmqConnected: Gauge;

  constructor() {
    // HTTP Request Duration
    this.httpRequestDuration = new Histogram({
      name: 'vitalink_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
    });

    // HTTP Request Total
    this.httpRequestTotal = new Counter({
      name: 'vitalink_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    // Claims Business Metrics
    this.claimsCreatedTotal = new Counter({
      name: 'vitalink_claims_created_total',
      help: 'Total number of claims created',
      labelNames: ['hospital_id', 'insurance_id'],
    });

    this.claimsApprovedTotal = new Counter({
      name: 'vitalink_claims_approved_total',
      help: 'Total number of claims approved',
      labelNames: ['insurance_id'],
    });

    this.claimsRejectedTotal = new Counter({
      name: 'vitalink_claims_rejected_total',
      help: 'Total number of claims rejected',
      labelNames: ['insurance_id', 'reason'],
    });

    this.claimsDisputedTotal = new Counter({
      name: 'vitalink_claims_disputed_total',
      help: 'Total number of claims disputed',
      labelNames: ['initiated_by'],
    });

    // System Metrics
    this.activeConnections = new Gauge({
      name: 'vitalink_active_connections',
      help: 'Number of active connections',
    });

    this.rabbitmqConnected = new Gauge({
      name: 'vitalink_rabbitmq_connected',
      help: 'RabbitMQ connection status (1=connected, 0=disconnected)',
    });

    this.logger.log('Monitoring metrics initialized');
  }

  recordHttpRequest(method: string, route: string, statusCode: number, durationSeconds: number) {
    this.httpRequestDuration.observe({ method, route, status_code: statusCode.toString() }, durationSeconds);
    this.httpRequestTotal.inc({ method, route, status_code: statusCode.toString() });
  }

  recordClaimCreated(hospitalId: string, insuranceId: string) {
    this.claimsCreatedTotal.inc({ hospital_id: hospitalId, insurance_id: insuranceId });
  }

  recordClaimApproved(insuranceId: string) {
    this.claimsApprovedTotal.inc({ insurance_id: insuranceId });
  }

  recordClaimRejected(insuranceId: string, reason: string) {
    this.claimsRejectedTotal.inc({ insurance_id: insuranceId, reason });
  }

  recordClaimDisputed(initiatedBy: string) {
    this.claimsDisputedTotal.inc({ initiated_by: initiatedBy });
  }

  setActiveConnections(count: number) {
    this.activeConnections.set(count);
  }

  setRabbitMQConnected(connected: boolean) {
    this.rabbitmqConnected.set(connected ? 1 : 0);
  }

  async getMetrics(): Promise<string> {
    return register.metrics();
  }
}
