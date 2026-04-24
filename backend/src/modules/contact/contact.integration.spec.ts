import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AdminContactController } from './contact.admin.controller';
import { ContactService } from './contact.service';
import { ContactRepository } from './contact.repository';
import { AuthorizationService } from '../../common/services/authorization.service';
import { AuditService } from '../audit/audit.service';
import { EmailService } from '../integrations/email.service';

describe('AdminContactController integration', () => {
  it('lists contact submissions for PR committee user', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AdminContactController],
      providers: [
        ContactService,
        AuthorizationService,
        {
          provide: ContactRepository,
          useValue: { findMany: jest.fn().mockResolvedValue([{ id: 'c1' }]) },
        },
        { provide: AuditService, useValue: { log: jest.fn() } },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('PR_COMMITTEE') },
        },
        {
          provide: EmailService,
          useValue: { send: jest.fn().mockResolvedValue({ delivered: true }) },
        },
      ],
    }).compile();

    const controller = moduleRef.get(AdminContactController);
    const result = await controller.list({
      id: 'u1',
      email: 'pr@test.com',
      displayName: 'PR',
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
    });

    expect(result).toEqual([{ id: 'c1' }]);
  });
});
