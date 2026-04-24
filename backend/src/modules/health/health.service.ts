import { Injectable } from '@nestjs/common';
import { environmentConfig } from '../../config/environment.config.js';

@Injectable()
export class HealthService {
  getHealth(): Record<string, unknown> {
    const config = environmentConfig();

    return {
      status: 'ok',
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
    };
  }
}
