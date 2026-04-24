import { Module } from '@nestjs/common';
import { AuthorizationService } from '../../common/services/authorization.service.js';
import { MeetingsRepository } from './meetings.repository.js';
import { MeetingsService } from './meetings.service.js';
import { PublicMeetingsController } from './meetings.public.controller.js';
import { AdminMeetingsController } from './meetings.admin.controller.js';
import { AuditModule } from '../audit/audit.module.js';

@Module({
  imports: [AuditModule],
  controllers: [PublicMeetingsController, AdminMeetingsController],
  providers: [MeetingsRepository, MeetingsService, AuthorizationService],
  exports: [MeetingsService, MeetingsRepository],
})
export class MeetingsModule {}
