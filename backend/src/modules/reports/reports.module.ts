import { Module } from '@nestjs/common';
import { AuthorizationService } from '../../common/services/authorization.service.js';
import { AuditModule } from '../audit/audit.module.js';
import { IntegrationsModule } from '../integrations/integrations.module.js';
import { ReportsController } from './reports.controller.js';
import { ReportsRepository } from './reports.repository.js';
import { ReportsService } from './reports.service.js';

@Module({
  imports: [AuditModule, IntegrationsModule],
  controllers: [ReportsController],
  providers: [ReportsRepository, ReportsService, AuthorizationService],
  exports: [ReportsService],
})
export class ReportsModule {}
