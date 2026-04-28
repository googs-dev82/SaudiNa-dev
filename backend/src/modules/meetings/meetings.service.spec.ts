import { BadRequestException } from '@nestjs/common';
import { MeetingsService } from './meetings.service';

describe('MeetingsService', () => {
  const meetingsRepository = {
    createRecoveryMeeting: jest.fn(),
    findRecoveryMeetingById: jest.fn(),
    updateRecoveryMeeting: jest.fn(),
    updateRecoveryStatus: jest.fn(),
    createInServiceMeeting: jest.fn(),
    updateInServiceMeeting: jest.fn(),
    findInServiceMeetingById: jest.fn(),
    updateInServiceStatus: jest.fn(),
    searchPublicRecoveryMeetings: jest.fn(),
    searchNearbyRecoveryMeetings: jest.fn(),
    listRecoveryMeetingsForAreas: jest.fn(),
    listInServiceMeetingsForCommittees: jest.fn(),
  };
  const authorizationService = {
    assertRecoveryEditor: jest.fn(),
    assertCommitteeSecretary: jest.fn(),
    assertCommitteeManager: jest.fn(),
    assertMakerChecker: jest.fn(),
    isSuperAdmin: jest.fn().mockReturnValue(false),
  };
  const auditService = { log: jest.fn() };

  const service = new MeetingsService(
    meetingsRepository as never,
    authorizationService as never,
    auditService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects in-person recovery meeting without coordinates', async () => {
    await expect(
      service.createRecoveryMeeting(
        {
          regionId: 'r1',
          areaId: 'a1',
          nameAr: 'name',
          nameEn: 'name',
          language: 'ARABIC',
          gender: 'MALE',
          city: 'Riyadh',
          dayOfWeek: 'MON',
          startTime: '10:00',
          isOnline: false,
        },
        {
          id: 'u1',
          email: 'u@test.com',
          displayName: 'User',
          roles: ['MEETING_EDITOR'],
          assignments: [],
        },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('approves pending in-service meeting and writes audit log', async () => {
    meetingsRepository.findInServiceMeetingById.mockResolvedValue({
      id: 'm1',
      committeeId: 'c1',
      status: 'PENDING',
      createdById: 'maker-1',
    });
    meetingsRepository.updateInServiceStatus.mockResolvedValue({
      id: 'm1',
      status: 'APPROVED',
    });

    const result = await service.approveInServiceMeeting('m1', {
      id: 'checker-1',
      email: 'checker@test.com',
      displayName: 'Checker',
      roles: ['COMMITTEE_MANAGER'],
      assignments: [],
    });

    expect(result.status).toBe('APPROVED');
    expect(authorizationService.assertCommitteeManager).toHaveBeenCalledWith(
      expect.anything(),
      'c1',
    );
    expect(auditService.log).toHaveBeenCalled();
  });

  it('rejects physical in-service meetings without venue details', async () => {
    await expect(
      service.createInServiceMeeting(
        {
          committeeId: 'c1',
          meetingFormat: 'PHYSICAL',
          titleAr: 'اجتماع خدمة',
          titleEn: 'Service meeting',
          meetingDate: '2026-04-27T00:00:00.000Z',
          startTime: '18:00',
          mom: 'Minutes content that is long enough',
          plannedActivities: [],
        },
        {
          id: 'u1',
          email: 'u@test.com',
          displayName: 'User',
          roles: ['COMMITTEE_SECRETARY'],
          assignments: [],
        },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects Zoom in-service meetings without Zoom access details', async () => {
    await expect(
      service.createInServiceMeeting(
        {
          committeeId: 'c1',
          meetingFormat: 'ZOOM',
          titleAr: 'اجتماع خدمة',
          titleEn: 'Service meeting',
          meetingDate: '2026-04-27T00:00:00.000Z',
          startTime: '18:00',
          mom: 'Minutes content that is long enough',
          plannedActivities: [],
        },
        {
          id: 'u1',
          email: 'u@test.com',
          displayName: 'User',
          roles: ['COMMITTEE_SECRETARY'],
          assignments: [],
        },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('logs recovery meeting list access', async () => {
    meetingsRepository.listRecoveryMeetingsForAreas.mockResolvedValue([
      { id: 'm1' },
    ]);

    const result = await service.listAdminRecoveryMeetings({
      id: 'u1',
      email: 'u@test.com',
      displayName: 'User',
      roles: ['MEETING_EDITOR'],
      assignments: [
        {
          id: 'a1',
          roleCode: 'MEETING_EDITOR',
          scopeType: 'AREA',
          scopeId: 'area-1',
          scopeCode: 'AREA_1',
        },
      ],
    });

    expect(result).toEqual([{ id: 'm1' }]);
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'VIEWED',
        resourceType: 'RecoveryMeetingList',
      }),
    );
  });

  it('logs in-service meeting list access', async () => {
    meetingsRepository.listInServiceMeetingsForCommittees.mockResolvedValue([
      { id: 'm2' },
    ]);

    const result = await service.listAdminInServiceMeetings({
      id: 'u1',
      email: 'u@test.com',
      displayName: 'User',
      roles: ['COMMITTEE_SECRETARY'],
      assignments: [
        {
          id: 'a2',
          roleCode: 'COMMITTEE_SECRETARY',
          scopeType: 'COMMITTEE',
          scopeId: 'committee-1',
          scopeCode: 'COMMITTEE_1',
        },
      ],
    });

    expect(result).toEqual([{ id: 'm2' }]);
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'VIEWED',
        resourceType: 'InServiceMeetingList',
      }),
    );
  });
});
