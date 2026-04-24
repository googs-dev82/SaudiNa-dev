import { Module } from '@nestjs/common';
import { AuthorizationService } from '../../common/services/authorization.service.js';
import { AuditModule } from '../audit/audit.module.js';
import { IntegrationsModule } from '../integrations/integrations.module.js';
import { EventsRepository } from './events.repository.js';
import { EventsService } from './events.service.js';
import { EventsController } from './events.controller.js';
import { PublicEventsController } from './events.public.controller.js';
import { AdminEventsController } from './events.admin.controller.js';
import { EventsWebhookController } from './events.webhook.controller.js';

@Module({
  imports: [AuditModule, IntegrationsModule],
  controllers: [
    EventsController,
    PublicEventsController,
    AdminEventsController,
    EventsWebhookController,
  ],
  providers: [EventsRepository, EventsService, AuthorizationService],
  exports: [EventsService, EventsRepository],
})
export class EventsModule {}
