import { ForbiddenException } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';

describe('AuthorizationService', () => {
  const service = new AuthorizationService();

  it('allows super admin to access contact submissions', () => {
    expect(() =>
      service.assertContactAccess(
        {
          id: '1',
          email: 'a@test.com',
          displayName: 'Admin',
          roles: ['SUPER_ADMIN'],
          assignments: [],
        },
        'PR_COMMITTEE',
      ),
    ).not.toThrow();
  });

  it('allows PR committee assignee to access contact submissions', () => {
    expect(() =>
      service.assertContactAccess(
        {
          id: '2',
          email: 'b@test.com',
          displayName: 'Member',
          roles: ['AREA_MANAGER'],
          assignments: [
            {
              id: 'a1',
              roleCode: 'AREA_MANAGER',
              scopeType: 'COMMITTEE',
              scopeId: 'committee-1',
              scopeCode: 'PR_COMMITTEE',
            },
          ],
        },
        'PR_COMMITTEE',
      ),
    ).not.toThrow();
  });

  it('rejects non-PR committee access for contact submissions', () => {
    expect(() =>
      service.assertContactAccess(
        {
          id: '3',
          email: 'c@test.com',
          displayName: 'User',
          roles: ['AREA_MANAGER'],
          assignments: [
            {
              id: 'a2',
              roleCode: 'AREA_MANAGER',
              scopeType: 'COMMITTEE',
              scopeId: 'committee-2',
              scopeCode: 'OTHER',
            },
          ],
        },
        'PR_COMMITTEE',
      ),
    ).toThrow(ForbiddenException);
  });
});
