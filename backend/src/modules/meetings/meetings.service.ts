import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CurrentUserContext } from '../../common/types/request-context.type.js';
import { AuthorizationService } from '../../common/services/authorization.service.js';
import { AuditService } from '../audit/audit.service.js';
import {
  CreateInServiceMeetingDto,
  CreateRecoveryMeetingDto,
  NearbyMeetingsQueryDto,
  PublicMeetingSearchQueryDto,
  RejectInServiceMeetingDto,
  UpdateInServiceMeetingDto,
  UpdateRecoveryMeetingDto,
} from './meetings.dto.js';
import { MeetingsRepository } from './meetings.repository.js';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly meetingsRepository: MeetingsRepository,
    private readonly authorizationService: AuthorizationService,
    private readonly auditService: AuditService,
  ) {}

  private async getRecoveryMeeting(id: string) {
    const meeting = await this.meetingsRepository.findRecoveryMeetingById(id);

    if (!meeting) {
      throw new NotFoundException('Recovery meeting not found.');
    }

    return meeting;
  }

  private async getInServiceMeeting(id: string) {
    const meeting = await this.meetingsRepository.findInServiceMeetingById(id);

    if (!meeting) {
      throw new NotFoundException('In-service meeting not found.');
    }

    return meeting;
  }

  async createRecoveryMeeting(
    input: CreateRecoveryMeetingDto,
    user: CurrentUserContext,
  ) {
    this.authorizationService.assertRecoveryEditor(user, input.areaId);
    this.validateRecoveryMeetingShape(input);

    const meeting = await this.meetingsRepository.createRecoveryMeeting(
      input,
      user.id,
    );
    await this.auditService.log({
      action: 'CREATED',
      resourceType: 'RecoveryMeeting',
      resourceId: meeting.id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      afterState: meeting as unknown as Record<string, unknown>,
    });
    return meeting;
  }

  async updateRecoveryMeeting(
    id: string,
    input: UpdateRecoveryMeetingDto,
    user: CurrentUserContext,
  ) {
    const existing = await this.getRecoveryMeeting(id);
    this.authorizationService.assertRecoveryEditor(user, existing.areaId);
    this.validateRecoveryMeetingShape(input);

    const updated = await this.meetingsRepository.updateRecoveryMeeting(
      id,
      input,
    );
    await this.auditService.log({
      action: 'UPDATED',
      resourceType: 'RecoveryMeeting',
      resourceId: updated.id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      beforeState: existing as unknown as Record<string, unknown>,
      afterState: updated as unknown as Record<string, unknown>,
    });
    return updated;
  }

  async publishRecoveryMeeting(id: string, user: CurrentUserContext) {
    const existing = await this.getRecoveryMeeting(id);
    this.authorizationService.assertRecoveryEditor(user, existing.areaId);

    const updated = await this.meetingsRepository.updateRecoveryStatus(
      id,
      'PUBLISHED',
    );
    await this.auditService.log({
      action: 'STATUS_CHANGED',
      resourceType: 'RecoveryMeeting',
      resourceId: id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      beforeState: { status: existing.status },
      afterState: { status: updated.status },
    });
    return updated;
  }

  async unpublishRecoveryMeeting(id: string, user: CurrentUserContext) {
    const existing = await this.getRecoveryMeeting(id);
    this.authorizationService.assertRecoveryEditor(user, existing.areaId);

    const updated = await this.meetingsRepository.updateRecoveryStatus(
      id,
      'DRAFT',
    );
    await this.auditService.log({
      action: 'STATUS_CHANGED',
      resourceType: 'RecoveryMeeting',
      resourceId: id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      beforeState: { status: existing.status },
      afterState: { status: updated.status },
    });
    return updated;
  }

  async archiveRecoveryMeeting(id: string, user: CurrentUserContext) {
    const existing = await this.getRecoveryMeeting(id);
    this.authorizationService.assertRecoveryEditor(user, existing.areaId);
    const updated = await this.meetingsRepository.updateRecoveryStatus(
      id,
      'ARCHIVED',
    );
    await this.auditService.log({
      action: 'ARCHIVED',
      resourceType: 'RecoveryMeeting',
      resourceId: id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      beforeState: { status: existing.status },
      afterState: { status: updated.status },
    });
    return updated;
  }

  async deleteRecoveryMeeting(id: string, user: CurrentUserContext) {
    const existing = await this.getRecoveryMeeting(id);
    this.authorizationService.assertRecoveryEditor(user, existing.areaId);
    await this.meetingsRepository.deleteRecoveryMeeting(id);
    await this.auditService.log({
      action: 'DELETED',
      resourceType: 'RecoveryMeeting',
      resourceId: id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      beforeState: existing as unknown as Record<string, unknown>,
    });
    return { id, deleted: true };
  }

  async createInServiceMeeting(
    input: CreateInServiceMeetingDto,
    user: CurrentUserContext,
  ) {
    this.authorizationService.assertCommitteeSecretary(user, input.committeeId);
    const meeting = await this.meetingsRepository.createInServiceMeeting(
      input,
      user.id,
    );
    await this.auditService.log({
      action: 'CREATED',
      resourceType: 'InServiceMeeting',
      resourceId: meeting.id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      afterState: meeting as unknown as Record<string, unknown>,
    });
    return meeting;
  }

  async updateInServiceMeeting(
    id: string,
    input: UpdateInServiceMeetingDto,
    user: CurrentUserContext,
  ) {
    const existing = await this.getInServiceMeeting(id);
    this.authorizationService.assertCommitteeSecretary(
      user,
      existing.committeeId,
    );

    if (existing.status !== 'DRAFT') {
      throw new BadRequestException(
        'Only draft in-service meetings can be edited.',
      );
    }

    const updated = await this.meetingsRepository.updateInServiceMeeting(
      id,
      input,
    );
    await this.auditService.log({
      action: 'UPDATED',
      resourceType: 'InServiceMeeting',
      resourceId: id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      beforeState: existing as unknown as Record<string, unknown>,
      afterState: updated as unknown as Record<string, unknown>,
    });
    return updated;
  }

  async submitInServiceMeeting(id: string, user: CurrentUserContext) {
    const existing = await this.getInServiceMeeting(id);
    this.authorizationService.assertCommitteeSecretary(
      user,
      existing.committeeId,
    );

    if (existing.status !== 'DRAFT') {
      throw new BadRequestException('Only draft meetings can be submitted.');
    }

    const updated = await this.meetingsRepository.updateInServiceStatus(
      id,
      'PENDING',
    );
    await this.auditService.log({
      action: 'SUBMITTED',
      resourceType: 'InServiceMeeting',
      resourceId: id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      beforeState: { status: existing.status },
      afterState: { status: updated.status },
    });
    return updated;
  }

  async approveInServiceMeeting(id: string, user: CurrentUserContext) {
    const existing = await this.getInServiceMeeting(id);
    this.authorizationService.assertCommitteeManager(
      user,
      existing.committeeId,
    );
    this.authorizationService.assertMakerChecker(user, existing.createdById);

    if (existing.status !== 'PENDING') {
      throw new BadRequestException('Only pending meetings can be approved.');
    }

    const updated = await this.meetingsRepository.updateInServiceStatus(
      id,
      'APPROVED',
      user.id,
    );
    await this.auditService.log({
      action: 'APPROVED',
      resourceType: 'InServiceMeeting',
      resourceId: id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      beforeState: { status: existing.status },
      afterState: { status: updated.status },
    });
    return updated;
  }

  async rejectInServiceMeeting(
    id: string,
    input: RejectInServiceMeetingDto,
    user: CurrentUserContext,
  ) {
    const existing = await this.getInServiceMeeting(id);
    this.authorizationService.assertCommitteeManager(
      user,
      existing.committeeId,
    );
    this.authorizationService.assertMakerChecker(user, existing.createdById);

    if (existing.status !== 'PENDING') {
      throw new BadRequestException('Only pending meetings can be rejected.');
    }

    const updated = await this.meetingsRepository.updateInServiceStatus(
      id,
      'DRAFT',
      undefined,
      input.comments,
    );
    await this.auditService.log({
      action: 'REJECTED',
      resourceType: 'InServiceMeeting',
      resourceId: id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      beforeState: { status: existing.status },
      afterState: { status: updated.status },
      metadata: { rejectionReason: input.comments },
    });
    return updated;
  }

  listAdminRecoveryMeetings(user: CurrentUserContext) {
    const areaIds = user.assignments
      .filter((assignment) => assignment.scopeType === 'AREA')
      .map((assignment) => assignment.scopeId)
      .filter((value): value is string => Boolean(value));

    void this.auditService.log({
      action: 'VIEWED',
      resourceType: 'RecoveryMeetingList',
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      metadata: {
        scopeType: 'AREA',
        scopeCount: areaIds.length,
        superAdmin: this.authorizationService.isSuperAdmin(user),
      },
    });

    return this.meetingsRepository.listRecoveryMeetingsForAreas(areaIds);
  }

  listAdminInServiceMeetings(user: CurrentUserContext) {
    const committeeIds = user.assignments
      .filter((assignment) => assignment.scopeType === 'COMMITTEE')
      .map((assignment) => assignment.scopeId)
      .filter((value): value is string => Boolean(value));

    void this.auditService.log({
      action: 'VIEWED',
      resourceType: 'InServiceMeetingList',
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      metadata: {
        scopeType: 'COMMITTEE',
        scopeCount: committeeIds.length,
      },
    });

    return this.meetingsRepository.listInServiceMeetingsForCommittees(
      committeeIds,
    );
  }

  async searchPublicMeetings(query: PublicMeetingSearchQueryDto) {
    const items =
      await this.meetingsRepository.searchPublicRecoveryMeetings(query);
    return {
      items,
      nextCursor: items.length > 0 ? items[items.length - 1]?.id : null,
    };
  }

  async searchMapMeetings(query: PublicMeetingSearchQueryDto) {
    const items = await this.meetingsRepository.searchPublicRecoveryMeetings({
      ...query,
      limit: query.limit ?? 200,
    });

    return items.filter(
      (meeting: { latitude: number | null; longitude: number | null }) =>
        meeting.latitude !== null && meeting.longitude !== null,
    );
  }

  async searchNearbyMeetings(query: NearbyMeetingsQueryDto) {
    const items =
      await this.meetingsRepository.searchNearbyRecoveryMeetings(query);
    return items.map((item) => ({
      ...item,
      distanceKm: Math.round((item.distanceMeters / 1000) * 100) / 100,
    }));
  }

  private validateRecoveryMeetingShape(
    input: CreateRecoveryMeetingDto | UpdateRecoveryMeetingDto,
  ): void {
    if (input.isOnline && !input.meetingLink) {
      throw new BadRequestException('Online meetings require a meeting link.');
    }

    if (
      !input.isOnline &&
      (input.latitude === undefined || input.longitude === undefined)
    ) {
      throw new BadRequestException('In-person meetings require coordinates.');
    }
  }
}
