import { UsersService } from './users.service';

describe('UsersService', () => {
  const usersRepository = {
    findById: jest.fn(),
    findByIdWithCounts: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsertExternalIdentity: jest.fn(),
  };
  const auditService = {
    log: jest.fn(),
  };

  const user = {
    id: 'admin-1',
    email: 'admin@test.com',
    displayName: 'Admin',
    roles: ['SUPER_ADMIN'],
    assignments: [],
  };

  const service = new UsersService(
    usersRepository as never,
    auditService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('audits user list access', async () => {
    usersRepository.findMany.mockResolvedValue([{ id: 'u1' }]);

    await service.listUsers(user);

    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'VIEWED',
        resourceType: 'UserList',
        userId: user.id,
      }),
    );
  });

  it('audits user creation', async () => {
    usersRepository.create.mockResolvedValue({
      id: 'u1',
      email: 'u1@test.com',
    });

    await service.createUser(
      {
        email: 'u1@test.com',
        displayName: 'User One',
        status: 'ACTIVE',
      } as never,
      user,
    );

    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CREATED',
        resourceType: 'User',
        resourceId: 'u1',
      }),
    );
  });

  it('rejects deletion for users referenced by governed records', async () => {
    usersRepository.findByIdWithCounts.mockResolvedValue({
      id: 'u1',
      _count: {
        assignments: 0,
        recovery_meetings: 1,
        in_service_meetings_in_service_meetings_createdByIdTousers: 0,
        in_service_meetings_in_service_meetings_approvedByIdTousers: 0,
        reports_reports_createdByIdTousers: 0,
        reports_reports_approvedByIdTousers: 0,
      },
    });

    await expect(service.deleteUser('u1', user as never)).rejects.toThrow(
      'This user cannot be deleted because they are referenced by governed operational records. Deactivate the user instead.',
    );
  });

  it('audits successful deletion', async () => {
    usersRepository.findByIdWithCounts.mockResolvedValue({
      id: 'u1',
      email: 'u1@test.com',
      _count: {
        assignments: 0,
        recovery_meetings: 0,
        in_service_meetings_in_service_meetings_createdByIdTousers: 0,
        in_service_meetings_in_service_meetings_approvedByIdTousers: 0,
        reports_reports_createdByIdTousers: 0,
        reports_reports_approvedByIdTousers: 0,
      },
    });
    usersRepository.delete.mockResolvedValue({ id: 'u1' });

    await service.deleteUser('u1', user as never);

    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'DELETED',
        resourceType: 'User',
        resourceId: 'u1',
      }),
    );
  });
});
