import { AssignmentsService } from './assignments.service';

describe('AssignmentsService', () => {
  const assignmentsRepository = {
    create: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    listAll: jest.fn(),
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

  const service = new AssignmentsService(
    assignmentsRepository as never,
    auditService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('audits assignment list access', async () => {
    assignmentsRepository.listAll.mockResolvedValue([]);

    await service.listAssignments(user);

    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'VIEWED',
        resourceType: 'AssignmentList',
        userId: user.id,
      }),
    );
  });

  it('audits assignment updates', async () => {
    assignmentsRepository.findById.mockResolvedValue({
      id: 'a1',
      roleCode: 'MEETING_EDITOR',
    });
    assignmentsRepository.update.mockResolvedValue({
      id: 'a1',
      roleCode: 'AREA_MANAGER',
    });

    await service.updateAssignment(
      'a1',
      { roleCode: 'AREA_MANAGER' } as never,
      user,
    );

    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'UPDATED',
        resourceType: 'Assignment',
        resourceId: 'a1',
      }),
    );
  });
});
