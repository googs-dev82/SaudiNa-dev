import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthorizationService } from '../../common/services/authorization.service.js';
import { CurrentUserContext } from '../../common/types/request-context.type.js';
import { AuditService } from '../audit/audit.service.js';
import { EmailService } from '../integrations/email.service.js';
import {
  CreateContactSubmissionDto,
  UpdateContactSubmissionDto,
} from './contact.dto.js';
import { ContactRepository } from './contact.repository.js';

@Injectable()
export class ContactService {
  constructor(
    private readonly contactRepository: ContactRepository,
    private readonly authorizationService: AuthorizationService,
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async submit(
    input: CreateContactSubmissionDto,
    ipAddress?: string,
    correlationId?: string,
  ) {
    const prCommitteeCode =
      this.configService.get<string>('app.prCommitteeCode') ?? 'PR_COMMITTEE';
    const submission = await this.contactRepository.create(
      input,
      prCommitteeCode,
    );
    await this.auditService.log({
      action: 'CONTACT_SUBMITTED',
      resourceType: 'ContactSubmission',
      resourceId: submission.id,
      ipAddress,
      correlationId,
      afterState: submission as unknown as Record<string, unknown>,
    });

    await this.emailService.send({
      to:
        this.configService.get<string>('SUPPORT_EMAIL_TO') ??
        'support@example.com',
      subject: `SaudiNA contact: ${submission.subject}`,
      html: `<p><strong>Name:</strong> ${submission.name}</p><p><strong>Email:</strong> ${submission.email}</p><p><strong>Message:</strong> ${submission.message}</p>`,
    });

    return submission;
  }

  async list(user: CurrentUserContext) {
    this.authorizationService.assertContactAccess(
      user,
      this.configService.get<string>('app.prCommitteeCode') ?? 'PR_COMMITTEE',
    );
    await this.auditService.log({
      action: 'UPDATED',
      resourceType: 'ContactSubmissionView',
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      metadata: { event: 'list' },
    });
    return this.contactRepository.findMany();
  }

  async update(
    id: string,
    input: UpdateContactSubmissionDto,
    user: CurrentUserContext,
  ) {
    this.authorizationService.assertContactAccess(
      user,
      this.configService.get<string>('app.prCommitteeCode') ?? 'PR_COMMITTEE',
    );

    const existing = await this.contactRepository.findById(id);

    if (!existing) {
      throw new NotFoundException('Contact submission not found.');
    }

    const updated = await this.contactRepository.update(id, input);
    await this.auditService.log({
      action: 'UPDATED',
      resourceType: 'ContactSubmission',
      resourceId: id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      beforeState: existing as unknown as Record<string, unknown>,
      afterState: updated as unknown as Record<string, unknown>,
    });
    return updated;
  }
}
