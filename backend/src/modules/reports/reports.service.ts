import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AuthorizationService } from '../../common/services/authorization.service.js';
import { CurrentUserContext } from '../../common/types/request-context.type.js';
import { AuditService } from '../audit/audit.service.js';
import { StorageService } from '../integrations/storage.service.js';
import { CreateReportDto } from './reports.dto.js';
import { ReportsRepository } from './reports.repository.js';

@Injectable()
export class ReportsService {
  constructor(
    private readonly reportsRepository: ReportsRepository,
    private readonly authorizationService: AuthorizationService,
    private readonly auditService: AuditService,
    private readonly storageService: StorageService,
  ) {}

  async createReport(input: CreateReportDto, user: CurrentUserContext) {
    this.authorizationService.assertManagerRole(user);
    const report = await this.reportsRepository.create(input, user.id);
    await this.auditService.log({
      action: 'CREATED',
      resourceType: 'Report',
      resourceId: report.id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      afterState: report as unknown as Record<string, unknown>,
    });
    return report;
  }

  async submitReport(id: string, user: CurrentUserContext) {
    const report = await this.getReport(id);

    if (!report.approvalRequired) {
      throw new BadRequestException('This report does not require approval.');
    }

    if (
      report.createdById !== user.id &&
      !this.authorizationService.isSuperAdmin(user)
    ) {
      throw new BadRequestException('Only the creator can submit this report.');
    }

    const updated = await this.reportsRepository.updateStatus(id, 'PENDING');
    await this.auditService.log({
      action: 'SUBMITTED',
      resourceType: 'Report',
      resourceId: id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      beforeState: { status: report.status },
      afterState: { status: updated.status },
    });
    return updated;
  }

  async approveReport(id: string, user: CurrentUserContext) {
    this.authorizationService.assertManagerRole(user);
    const report = await this.getReport(id);
    this.authorizationService.assertMakerChecker(user, report.createdById);

    if (report.status !== 'PENDING') {
      throw new BadRequestException('Only pending reports can be approved.');
    }

    const updated = await this.reportsRepository.updateStatus(
      id,
      'APPROVED',
      user.id,
    );
    await this.auditService.log({
      action: 'APPROVED',
      resourceType: 'Report',
      resourceId: id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      beforeState: { status: report.status },
      afterState: { status: updated.status },
    });
    return updated;
  }

  async runReport(id: string, user: CurrentUserContext) {
    this.authorizationService.assertManagerRole(user);
    const report = await this.getReport(id);

    if (report.approvalRequired && report.status !== 'APPROVED') {
      throw new BadRequestException(
        'Approved status is required before running this report.',
      );
    }

    const filePath = `reports/${id}-${randomUUID()}.csv`;
    const updated = await this.reportsRepository.updateStatus(
      id,
      'READY',
      report.approvedById ?? undefined,
      filePath,
    );
    await this.auditService.log({
      action: 'REPORT_RUN',
      resourceType: 'Report',
      resourceId: id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      beforeState: { status: report.status },
      afterState: { status: updated.status, filePath },
    });
    return updated;
  }

  listReports(user: CurrentUserContext) {
    void this.auditService.log({
      action: 'VIEWED',
      resourceType: 'ReportList',
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      metadata: {
        superAdmin: this.authorizationService.isSuperAdmin(user),
      },
    });

    if (this.authorizationService.isSuperAdmin(user)) {
      return this.reportsRepository.listAll();
    }

    return this.reportsRepository.listByCreator(user.id);
  }

  async getDownloadUrl(id: string, user: CurrentUserContext) {
    this.authorizationService.assertManagerRole(user);
    const report = await this.getReport(id);

    if (!report.filePath) {
      throw new BadRequestException('Report export is not ready yet.');
    }

    await this.auditService.log({
      action: 'VIEWED',
      resourceType: 'ReportDownload',
      resourceId: id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      metadata: { filePath: report.filePath },
    });

    return {
      id: report.id,
      url: await this.storageService.resolveDownloadUrl(report.filePath, false),
    };
  }

  private async getReport(id: string) {
    const report = await this.reportsRepository.findById(id);

    if (!report) {
      throw new NotFoundException('Report not found.');
    }

    return report;
  }
}
