import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CurrentUserContext } from '../../common/types/request-context.type.js';
import { AuditService } from '../audit/audit.service.js';
import { UsersRepository } from './users.repository.js';
import {
  CreateUserDto,
  UpdateUserDto,
  UpsertExternalUserDto,
} from './users.dto.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly auditService: AuditService,
  ) {}

  async getById(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  async getGovernanceUser(id: string, user: CurrentUserContext) {
    const target = await this.usersRepository.findByIdWithCounts(id);

    if (!target) {
      throw new NotFoundException('User not found.');
    }

    void this.auditService.log({
      action: 'VIEWED',
      resourceType: 'User',
      resourceId: target.id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
    });

    return target;
  }

  async listUsers(user: CurrentUserContext) {
    void this.auditService.log({
      action: 'VIEWED',
      resourceType: 'UserList',
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
    });

    return this.usersRepository.findMany();
  }

  upsertExternalIdentity(input: UpsertExternalUserDto) {
    return this.usersRepository.upsertExternalIdentity(input);
  }

  async createUser(input: CreateUserDto, user: CurrentUserContext) {
    const created = await this.usersRepository.create(input);
    await this.auditService.log({
      action: 'CREATED',
      resourceType: 'User',
      resourceId: created.id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      afterState: created as unknown as Record<string, unknown>,
    });
    return created;
  }

  async updateUser(id: string, input: UpdateUserDto, user: CurrentUserContext) {
    const existing = await this.getById(id);
    const updated = await this.usersRepository.update(id, input);
    await this.auditService.log({
      action: 'UPDATED',
      resourceType: 'User',
      resourceId: updated.id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      beforeState: existing as unknown as Record<string, unknown>,
      afterState: updated as unknown as Record<string, unknown>,
    });
    return updated;
  }

  async deleteUser(id: string, user: CurrentUserContext) {
    const existing = await this.usersRepository.findByIdWithCounts(id);

    if (!existing) {
      throw new NotFoundException('User not found.');
    }

    const protectedReferences =
      existing._count.recovery_meetings +
      existing._count
        .in_service_meetings_in_service_meetings_createdByIdTousers +
      existing._count
        .in_service_meetings_in_service_meetings_approvedByIdTousers +
      existing._count.reports_reports_createdByIdTousers +
      existing._count.reports_reports_approvedByIdTousers;

    if (protectedReferences > 0) {
      throw new ConflictException(
        'This user cannot be deleted because they are referenced by governed operational records. Deactivate the user instead.',
      );
    }

    let deleted;
    try {
      deleted = await this.usersRepository.delete(id);
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (
        err.code === 'P2003' ||
        err.message?.includes('Foreign key constraint failed') ||
        err.message?.includes('audit_logs are immutable')
      ) {
        throw new ConflictException(
          'This user cannot be deleted because they have associated records, assignments, or immutable audit trails. Please deactivate the user instead.',
        );
      }
      throw new ConflictException(
        `Prisma failed: ${err.message ?? 'Unknown error'} (Code: ${err.code ?? 'N/A'})`,
      );
    }

    try {
      await this.auditService.log({
        action: 'DELETED',
        resourceType: 'User',
        resourceId: deleted.id,
        userId: user.id,
        userRoleSnapshot: user.roles.join(','),
        beforeState: existing as unknown as Record<string, unknown>,
      });

      return deleted;
    } catch (auditError: unknown) {
      // Throw this as a ConflictException so we can see it on the frontend instead of the generic NestJS 500!
      const message =
        auditError instanceof Error ? auditError.message : String(auditError);
      throw new ConflictException(`Audit block error: ${message}`);
    }
  }

  updatePreferredLanguage(id: string, language: 'ar' | 'en') {
    return this.usersRepository.updateField(id, {
      preferredLanguage: language,
    });
  }
}
