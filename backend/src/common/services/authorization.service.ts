import { ForbiddenException, Injectable } from '@nestjs/common';
import type { CurrentUserContext } from '../types/request-context.type.js';

@Injectable()
export class AuthorizationService {
  isSuperAdmin(user: CurrentUserContext | undefined): boolean {
    return Boolean(user?.roles.includes('SUPER_ADMIN'));
  }

  hasRole(user: CurrentUserContext | undefined, ...roles: string[]): boolean {
    if (!user) {
      return false;
    }

    return user.roles.some((role) => roles.includes(role));
  }

  hasScope(
    user: CurrentUserContext | undefined,
    scopeType: string,
    scopeId: string,
    roles?: string[],
  ): boolean {
    if (!user) {
      return false;
    }

    if (this.isSuperAdmin(user)) {
      return true;
    }

    return user.assignments.some((assignment) => {
      if (
        assignment.scopeType !== scopeType ||
        assignment.scopeId !== scopeId
      ) {
        return false;
      }

      if (!roles || roles.length === 0) {
        return true;
      }

      return roles.includes(assignment.roleCode);
    });
  }

  assertRecoveryEditor(
    user: CurrentUserContext | undefined,
    areaId: string,
  ): void {
    if (
      !this.hasScope(user, 'AREA', areaId, ['MEETING_EDITOR']) &&
      !this.isSuperAdmin(user)
    ) {
      throw new ForbiddenException(
        'You are not allowed to manage recovery meetings for this area.',
      );
    }
  }

  assertCommitteeSecretary(
    user: CurrentUserContext | undefined,
    committeeId: string,
  ): void {
    if (
      !this.hasScope(user, 'COMMITTEE', committeeId, ['COMMITTEE_SECRETARY']) &&
      !this.isSuperAdmin(user)
    ) {
      throw new ForbiddenException(
        'You are not allowed to manage in-service meetings for this committee.',
      );
    }
  }

  assertCommitteeManager(
    user: CurrentUserContext | undefined,
    committeeId: string,
  ): void {
    if (
      !this.hasScope(user, 'COMMITTEE', committeeId, ['COMMITTEE_MANAGER']) &&
      !this.isSuperAdmin(user)
    ) {
      throw new ForbiddenException(
        'You are not allowed to approve this committee workflow.',
      );
    }
  }

  assertMakerChecker(
    user: CurrentUserContext | undefined,
    creatorId: string,
  ): void {
    if (!user) {
      throw new ForbiddenException('Missing user context.');
    }

    if (!this.isSuperAdmin(user) && user.id === creatorId) {
      throw new ForbiddenException(
        'Maker-checker violation: creator cannot approve their own record.',
      );
    }
  }

  assertContactAccess(
    user: CurrentUserContext | undefined,
    prCommitteeCode: string,
  ): void {
    if (this.isSuperAdmin(user)) {
      return;
    }

    const hasPrCommitteeAssignment = Boolean(
      user?.assignments.some(
        (assignment) =>
          assignment.scopeType === 'COMMITTEE' &&
          assignment.scopeCode === prCommitteeCode,
      ),
    );

    if (!hasPrCommitteeAssignment) {
      throw new ForbiddenException(
        'You are not allowed to access contact submissions.',
      );
    }
  }

  assertManagerRole(user: CurrentUserContext | undefined): void {
    if (
      !this.hasRole(user, 'SUPER_ADMIN', 'REGIONAL_MANAGER', 'AREA_MANAGER')
    ) {
      throw new ForbiddenException(
        'Manager access is required for this operation.',
      );
    }
  }

  assertEventManager(user: CurrentUserContext | undefined): void {
    if (
      !this.hasRole(
        user,
        'SUPER_ADMIN',
        'REGIONAL_MANAGER',
        'AREA_MANAGER',
        'MEETING_EDITOR',
        'CONTENT_EDITOR',
      )
    ) {
      throw new ForbiddenException(
        'Event management access is required for this operation.',
      );
    }
  }

  assertEventPublisher(
    user: CurrentUserContext | undefined,
    regionId?: string,
    areaId?: string,
  ): void {
    this.assertEventManager(user);

    if (this.isSuperAdmin(user)) {
      return;
    }

    if (regionId && this.hasScope(user, 'REGION', regionId)) {
      return;
    }

    if (areaId && this.hasScope(user, 'AREA', areaId)) {
      return;
    }

    if (this.hasRole(user, 'CONTENT_EDITOR')) {
      return;
    }

    throw new ForbiddenException(
      'Event publication access is required for this operation.',
    );
  }

  assertEventCreator(
    user: CurrentUserContext | undefined,
    regionId?: string,
    areaId?: string,
  ): void {
    this.assertEventManager(user);

    if (this.isSuperAdmin(user)) {
      return;
    }

    if (regionId && this.hasScope(user, 'REGION', regionId)) {
      return;
    }

    if (areaId && this.hasScope(user, 'AREA', areaId)) {
      return;
    }

    if (this.hasRole(user, 'CONTENT_EDITOR')) {
      return;
    }

    throw new ForbiddenException(
      'You are not allowed to manage this event scope.',
    );
  }
}
