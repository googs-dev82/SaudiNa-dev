import {
  CanActivate,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ValidationPipe } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../src/common/constants/metadata.constants';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { RateLimitGuard } from '../src/common/guards/rate-limit.guard';
import { RateLimitService } from '../src/common/services/rate-limit.service';
import { RequestContextInterceptor } from '../src/common/interceptors/request-context.interceptor';
import { PublicMeetingsController } from '../src/modules/meetings/meetings.public.controller';
import { AdminMeetingsController } from '../src/modules/meetings/meetings.admin.controller';
import { MeetingsService } from '../src/modules/meetings/meetings.service';
import { MeetingsRepository } from '../src/modules/meetings/meetings.repository';
import { AuthorizationService } from '../src/common/services/authorization.service';
import { AuditService } from '../src/modules/audit/audit.service';
import { PublicContactController } from '../src/modules/contact/contact.public.controller';
import { ContactService } from '../src/modules/contact/contact.service';
import { ContactRepository } from '../src/modules/contact/contact.repository';
import { ConfigService } from '@nestjs/config';
import type { RequestWithContext } from '../src/common/types/request-context.type';
import { EmailService } from '../src/modules/integrations/email.service';
import { ChatbotController } from '../src/modules/chatbot/chatbot.controller';
import { ChatbotService } from '../src/modules/chatbot/chatbot.service';
import { CmsFaqService } from '../src/modules/integrations/cms-faq.service';

class MockJwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithContext>();
    request.user = {
      id: 'super-1',
      email: 'super@test.com',
      displayName: 'Super Admin',
      roles: ['SUPER_ADMIN'],
      assignments: [],
    };
    return true;
  }
}

describe('Critical flows (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const meetingsRepository = {
      findRecoveryMeetingById: jest
        .fn()
        .mockResolvedValue({ id: 'm1', areaId: 'a1', status: 'DRAFT' }),
      updateRecoveryStatus: jest
        .fn()
        .mockResolvedValue({ id: 'm1', status: 'PUBLISHED' }),
      searchPublicRecoveryMeetings: jest.fn().mockResolvedValue([
        {
          id: 'm1',
          nameEn: 'Hope Meeting',
          nameAr: 'اجتماع الأمل',
          city: 'Jeddah',
          latitude: 21.5,
          longitude: 39.2,
        },
      ]),
      searchNearbyRecoveryMeetings: jest.fn().mockResolvedValue([]),
      listRecoveryMeetingsForAreas: jest.fn().mockResolvedValue([]),
      listInServiceMeetingsForCommittees: jest.fn().mockResolvedValue([]),
      createRecoveryMeeting: jest.fn(),
      updateRecoveryMeeting: jest.fn(),
      createInServiceMeeting: jest.fn(),
      updateInServiceMeeting: jest.fn(),
      findInServiceMeetingById: jest.fn(),
      updateInServiceStatus: jest.fn(),
    };

    const contactRepository = {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'contact-1', subject: 'Need help' }),
      findMany: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };

    const cmsFaqService = {
      searchFaqs: jest.fn().mockResolvedValue([
        {
          id: 'faq-1',
          questionEn: 'How do I find a suitable meeting?',
          answerEn: 'Try a few meetings and pick the one that feels right.',
          score: 3,
        },
      ]),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [
        PublicMeetingsController,
        AdminMeetingsController,
        PublicContactController,
        ChatbotController,
      ],
      providers: [
        MeetingsService,
        ContactService,
        ChatbotService,
        AuthorizationService,
        RateLimitService,
        Reflector,
        { provide: MeetingsRepository, useValue: meetingsRepository },
        { provide: ContactRepository, useValue: contactRepository },
        { provide: AuditService, useValue: { log: jest.fn() } },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('PR_COMMITTEE') },
        },
        {
          provide: EmailService,
          useValue: { send: jest.fn().mockResolvedValue({ delivered: true }) },
        },
        {
          provide: CmsFaqService,
          useValue: cmsFaqService,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    const reflector = app.get(Reflector);
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalInterceptors(new RequestContextInterceptor());
    app.useGlobalGuards(
      new MockJwtAuthGuard(reflector),
      new RolesGuard(reflector),
      new RateLimitGuard(reflector, app.get(RateLimitService)),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('returns public meeting search results', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .get('/public/meetings')
      .expect(200)
      .expect(({ body }: { body: { items: unknown[] } }) => {
        expect(body.items).toHaveLength(1);
      });
  });

  it('publishes a recovery meeting through protected API', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/admin/meetings/recovery/m1/publish')
      .expect(201)
      .expect(({ body }: { body: { status: string } }) => {
        expect(body.status).toBe('PUBLISHED');
      });
  });

  it('accepts a public contact submission', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/public/contact')
      .send({
        name: 'Need Help',
        email: 'help@test.com',
        subject: 'Support',
        message: 'Please contact me with more information.',
      })
      .expect(201)
      .expect(({ body }: { body: { id: string } }) => {
        expect(body.id).toBe('contact-1');
      });
  });

  it('returns a public chatbot FAQ answer', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/public/chatbot/query')
      .send({
        message: 'How do I find a suitable meeting?',
        locale: 'en',
      })
      .expect(201)
      .expect(({ body }: { body: { type: string; intent: string } }) => {
        expect(body.type).toBe('faq');
        expect(body.intent).toBe('content_qna');
      });
  });
});
