import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { AssignmentsController } from './assignments.controller.js';
import { AssignmentsService } from './assignments.service.js';
import { AssignmentsRepository } from './assignments.repository.js';

@Module({
  imports: [AuditModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService, AssignmentsRepository],
  exports: [AssignmentsService, AssignmentsRepository],
})
export class AssignmentsModule {}
