import 'reflect-metadata';
import { ROLES_KEY } from '../../common/constants/metadata.constants.js';
import { AdminMeetingsController } from './meetings.admin.controller';

describe('AdminMeetingsController', () => {
  const meetingsService = {
    createRecoveryMeeting: jest.fn(),
    updateRecoveryMeeting: jest.fn(),
    publishRecoveryMeeting: jest.fn(),
    unpublishRecoveryMeeting: jest.fn(),
    archiveRecoveryMeeting: jest.fn(),
    deleteRecoveryMeeting: jest.fn(),
    createInServiceMeeting: jest.fn(),
    updateInServiceMeeting: jest.fn(),
    submitInServiceMeeting: jest.fn(),
    approveInServiceMeeting: jest.fn(),
    rejectInServiceMeeting: jest.fn(),
    listAdminRecoveryMeetings: jest.fn(),
    listAdminInServiceMeetings: jest.fn(),
  };

  const controller = new AdminMeetingsController(meetingsService as never);
  const user = {
    id: 'u1',
    email: 'user@test.com',
    displayName: 'User',
    roles: ['SUPER_ADMIN'],
    assignments: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('declares the expected roles on recovery creation', () => {
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      AdminMeetingsController.prototype.createRecovery,
    ) as string[];

    expect(roles).toEqual(['SUPER_ADMIN', 'MEETING_EDITOR']);
  });

  it('delegates recovery publish to the meetings service', async () => {
    meetingsService.publishRecoveryMeeting.mockResolvedValue({
      id: 'm1',
      status: 'PUBLISHED',
    });

    await expect(
      controller.publishRecovery('m1', user as never),
    ).resolves.toEqual({
      id: 'm1',
      status: 'PUBLISHED',
    });
    expect(meetingsService.publishRecoveryMeeting).toHaveBeenCalledWith(
      'm1',
      user,
    );
  });

  it('delegates in-service rejection to the meetings service', async () => {
    meetingsService.rejectInServiceMeeting.mockResolvedValue({
      id: 'm2',
      status: 'DRAFT',
    });

    await expect(
      controller.rejectInService(
        'm2',
        { comments: 'Please revise the minutes.' } as never,
        user as never,
      ),
    ).resolves.toEqual({
      id: 'm2',
      status: 'DRAFT',
    });
    expect(meetingsService.rejectInServiceMeeting).toHaveBeenCalledWith(
      'm2',
      { comments: 'Please revise the minutes.' },
      user,
    );
  });

  it('delegates recovery listing to the meetings service', async () => {
    meetingsService.listAdminRecoveryMeetings.mockResolvedValue([{ id: 'm1' }]);

    await expect(controller.listRecovery(user as never)).resolves.toEqual([
      { id: 'm1' },
    ]);
    expect(meetingsService.listAdminRecoveryMeetings).toHaveBeenCalledWith(
      user,
    );
  });

  it('delegates recovery deletion to the meetings service', async () => {
    meetingsService.deleteRecoveryMeeting.mockResolvedValue({
      id: 'm1',
      deleted: true,
    });

    await expect(
      controller.deleteRecovery('m1', user as never),
    ).resolves.toEqual({ id: 'm1', deleted: true });
    expect(meetingsService.deleteRecoveryMeeting).toHaveBeenCalledWith(
      'm1',
      user,
    );
  });
});
