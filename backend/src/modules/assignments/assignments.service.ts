import { Injectable } from '@nestjs/common';
import type { CurrentUserContext } from '../../common/types/request-context.type.js';
import { AuditService } from '../audit/audit.service.js';
import { AssignmentsRepository } from './assignments.repository.js';
import { CreateAssignmentDto, UpdateAssignmentDto } from './assignments.dto.js';

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly assignmentsRepository: AssignmentsRepository,
    private readonly auditService: AuditService,
  ) {}

  async createAssignment(input: CreateAssignmentDto, user: CurrentUserContext) {
    const created = await this.assignmentsRepository.create(input);
    await this.auditService.log({
      action: 'CREATED',
      resourceType: 'Assignment',
      resourceId: created.id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      afterState: created as unknown as Record<string, unknown>,
    });
    return created;
  }

  async updateAssignment(
    id: string,
    input: UpdateAssignmentDto,
    user: CurrentUserContext,
  ) {
    const existing = await this.getAssignment(id);
    const updated = await this.assignmentsRepository.update(id, input);
    await this.auditService.log({
      action: 'UPDATED',
      resourceType: 'Assignment',
      resourceId: id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      beforeState: existing as unknown as Record<string, unknown>,
      afterState: updated as unknown as Record<string, unknown>,
    });
    return updated;
  }

  getAssignment(id: string) {
    return this.assignmentsRepository.findById(id);
  }

  async deleteAssignment(id: string, user: CurrentUserContext) {
    const existing = await this.getAssignment(id);
    const deleted = await this.assignmentsRepository.delete(id);
    await this.auditService.log({
      action: 'DELETED',
      resourceType: 'Assignment',
      resourceId: id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      beforeState: existing as unknown as Record<string, unknown>,
    });
    return deleted;
  }

  getActiveAssignmentsForUser(userId: string) {
    return this.assignmentsRepository.findByUserId(userId);
  }

  async listAssignments(user: CurrentUserContext) {
    void this.auditService.log({
      action: 'VIEWED',
      resourceType: 'AssignmentList',
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
    });

    return this.assignmentsRepository.listAll();
  }
}
