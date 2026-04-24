import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';
import { HealthService } from './health.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  getHealth(): Record<string, unknown> {
    return this.healthService.getHealth();
  }

  @Public()
  @Get('readiness')
  readiness(): Record<string, unknown> {
    return this.healthService.getHealth();
  }
}
