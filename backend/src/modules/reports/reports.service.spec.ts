import { BadRequestException } from '@nestjs/common';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  const reportsRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    listByCreator: jest.fn(),
    listAll: jest.fn(),
    updateStatus: jest.fn(),
  };
  const authorizationService = {
    assertManagerRole: jest.fn(),
    assertMakerChecker: jest.fn(),
    isSuperAdmin: jest.fn().mockReturnValue(false),
  };
  const auditService = { log: jest.fn() };
  const storageService = { resolveDownloadUrl: jest.fn() };

  const service = new ReportsService(
    reportsRepository as never,
    authorizationService as never,
    auditService as never,
    storageService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires approved status before running approval-required report', async () => {
    reportsRepository.findById.mockResolvedValue({
      id: 'r1',
      approvalRequired: true,
      status: 'PENDING',
      createdById: 'u1',
    });

    await expect(
      service.runReport('r1', {
        id: 'manager-1',
        email: 'm@test.com',
        displayName: 'Manager',
        roles: ['AREA_MANAGER'],
        assignments: [],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('logs report list access before returning scoped reports', async () => {
    reportsRepository.listByCreator.mockResolvedValue([{ id: 'r1' }]);

    const result = await service.listReports({
      id: 'manager-1',
      email: 'm@test.com',
      displayName: 'Manager',
      roles: ['AREA_MANAGER'],
      assignments: [],
    });

    expect(result).toEqual([{ id: 'r1' }]);
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'VIEWED',
        resourceType: 'ReportList',
      }),
    );
  });

  it('logs report download access and resolves a download URL', async () => {
    reportsRepository.findById.mockResolvedValue({
      id: 'r1',
      approvalRequired: false,
      status: 'READY',
      createdById: 'u1',
      filePath: 'reports/r1.csv',
    });
    storageService.resolveDownloadUrl.mockResolvedValue(
      'https://example.com/reports/r1.csv',
    );

    const result = await service.getDownloadUrl('r1', {
      id: 'manager-1',
      email: 'm@test.com',
      displayName: 'Manager',
      roles: ['AREA_MANAGER'],
      assignments: [],
    });

    expect(result).toEqual({
      id: 'r1',
      url: 'https://example.com/reports/r1.csv',
    });
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'VIEWED',
        resourceType: 'ReportDownload',
        resourceId: 'r1',
      }),
    );
  });
});
