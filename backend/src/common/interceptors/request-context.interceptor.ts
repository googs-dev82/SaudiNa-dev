import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Observable } from 'rxjs';
import type { Response } from 'express';
import type { RequestWithContext } from '../types/request-context.type.js';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<
      RequestWithContext & {
        headers: Record<string, string | undefined>;
        ip: string;
      }
    >();
    const response = context.switchToHttp().getResponse<Response>();
    const correlationId = request.headers['x-correlation-id'] ?? randomUUID();

    request.correlationId = correlationId;
    response.setHeader('x-correlation-id', correlationId);

    return next.handle();
  }
}
