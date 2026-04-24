import { Module } from '@nestjs/common';
import { AuthorizationService } from '../../common/services/authorization.service.js';
import { AuditModule } from '../audit/audit.module.js';
import { IntegrationsModule } from '../integrations/integrations.module.js';
import { ContactRepository } from './contact.repository.js';
import { ContactService } from './contact.service.js';
import { PublicContactController } from './contact.public.controller.js';
import { AdminContactController } from './contact.admin.controller.js';

@Module({
  imports: [AuditModule, IntegrationsModule],
  controllers: [PublicContactController, AdminContactController],
  providers: [ContactRepository, ContactService, AuthorizationService],
  exports: [ContactService],
})
export class ContactModule {}
