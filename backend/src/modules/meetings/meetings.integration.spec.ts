import { Test } from '@nestjs/testing';
import { AdminMeetingsController } from './meetings.admin.controller';
import { MeetingsService } from './meetings.service';
import { MeetingsRepository } from './meetings.repository';
import { AuthorizationService } from '../../common/services/authorization.service';
import { AuditService } from '../audit/audit.service';

describe('AdminMeetingsController integration', () => {
  it('publishes a recovery meeting through controller + service', async () => {
    const meetingsRepository = {
      findRecoveryMeetingById: jest
        .fn()
        .mockResolvedValue({ id: 'm1', areaId: 'a1', status: 'DRAFT' }),
      updateRecoveryStatus: jest
        .fn()
        .mockResolvedValue({ id: 'm1', status: 'PUBLISHED' }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AdminMeetingsController],
      providers: [
        MeetingsService,
        AuthorizationService,
        { provide: MeetingsRepository, useValue: meetingsRepository },
        { provide: AuditService, useValue: { log: jest.fn() } },
      ],
    }).compile();

    const controller = moduleRef.get(AdminMeetingsController);
    const result = await controller.publishRecovery('m1', {
      id: 'u1',
      email: 'editor@test.com',
      displayName: 'Editor',
      roles: ['MEETING_EDITOR'],
      assignments: [
        {
          id: 'as1',
          roleCode: 'MEETING_EDITOR',
          scopeType: 'AREA',
          scopeId: 'a1',
          scopeCode: null,
        },
      ],
    });

    expect(result.status).toBe('PUBLISHED');
  });

  it('deletes a recovery meeting through controller + service', async () => {
    const meetingsRepository = {
      findRecoveryMeetingById: jest
        .fn()
        .mockResolvedValue({ id: 'm1', areaId: 'a1', status: 'DRAFT' }),
      deleteRecoveryMeeting: jest.fn().mockResolvedValue({ id: 'm1' }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AdminMeetingsController],
      providers: [
        MeetingsService,
        AuthorizationService,
        { provide: MeetingsRepository, useValue: meetingsRepository },
        { provide: AuditService, useValue: { log: jest.fn() } },
      ],
    }).compile();

    const controller = moduleRef.get(AdminMeetingsController);
    const result = await controller.deleteRecovery('m1', {
      id: 'u1',
      email: 'editor@test.com',
      displayName: 'Editor',
      roles: ['MEETING_EDITOR'],
      assignments: [
        {
          id: 'as1',
          roleCode: 'MEETING_EDITOR',
          scopeType: 'AREA',
          scopeId: 'a1',
          scopeCode: null,
        },
      ],
    });

    expect(result).toEqual({ id: 'm1', deleted: true });
  });
});
