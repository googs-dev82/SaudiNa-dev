import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RATE_LIMIT_KEY } from '../constants/metadata.constants.js';
import { RateLimitService } from '../services/rate-limit.service.js';
import type { RequestWithContext } from '../types/request-context.type.js';
import type { RateLimitOptions } from '../decorators/rate-limit.decorator.js';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimitService: RateLimitService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<
      RateLimitOptions | undefined
    >(RATE_LIMIT_KEY, [context.getHandler(), context.getClass()]);

    if (!options) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<RequestWithContext & { ip: string }>();
    const keySource =
      options.key === 'user' ? (request.user?.id ?? request.ip) : request.ip;
    const key = `${context.getClass().name}:${context.getHandler().name}:${keySource}`;
    const allowed = this.rateLimitService.consume(
      key,
      options.limit,
      options.windowMs,
    );

    if (!allowed) {
      throw new HttpException(
        'Rate limit exceeded.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
