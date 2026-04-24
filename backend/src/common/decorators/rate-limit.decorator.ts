import { SetMetadata } from '@nestjs/common';
import { RATE_LIMIT_KEY } from '../constants/metadata.constants.js';

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
  key?: 'ip' | 'user';
}

export const RateLimit = (
  options: RateLimitOptions,
): MethodDecorator & ClassDecorator => SetMetadata(RATE_LIMIT_KEY, options);
