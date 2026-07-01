import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, user } = request;
    const correlationId = request.headers['x-request-id'] || uuidv4();
    const now = Date.now();

    // Attach correlation ID to response
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-Request-Id', correlationId);

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - now;
        const userId = user?.sub || 'anonymous';
        this.logger.log(
          `${method} ${url} ${response.statusCode} - ${elapsed}ms - user:${userId} - correlation:${correlationId}`,
        );
      }),
    );
  }
}
