import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { IntegrationsModule } from '../integrations/integrations.module.js';
import { ResourcesRepository } from './resources.repository.js';
import { ResourcesService } from './resources.service.js';
import { PublicResourcesController } from './resources.public.controller.js';
import { AdminResourcesController } from './resources.admin.controller.js';

@Module({
  imports: [AuditModule, IntegrationsModule],
  controllers: [PublicResourcesController, AdminResourcesController],
  providers: [ResourcesRepository, ResourcesService],
  exports: [ResourcesService],
})
export class ResourcesModule {}
