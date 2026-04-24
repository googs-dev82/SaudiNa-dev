import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { EventsService } from './events.service';

describe('EventsService', () => {
  const eventsRepository = {
    createEvent: jest.fn(),
    updateEvent: jest.fn(),
    findEventById: jest.fn(),
    findPublicEventById: jest.fn(),
    listPublicEvents: jest.fn(),
    listMyEvents: jest.fn(),
    listAdminEvents: jest.fn(),
    findEventsForSlotOverlap: jest.fn(),
    findEventAudit: jest.fn(),
  };

  const authorizationService = {
    assertEventCreator: jest.fn(),
    assertEventPublisher: jest.fn(),
    assertEventManager: jest.fn(),
    isSuperAdmin: jest.fn().mockReturnValue(false),
  };

  const auditService = { log: jest.fn() };
  const emailService = { send: jest.fn() };
  const zoomService = {
    createMeeting: jest.fn(),
    cancelMeeting: jest.fn(),
  };

  const prisma = {
    $transaction: jest.fn(),
    eventBookingRequest: {
      create: jest.fn(),
      update: jest.fn(),
    },
    eventSlot: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    tentativeHold: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    zoomMeeting: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    event: {
      update: jest.fn(),
    },
    eventStatusHistory: {
      create: jest.fn(),
    },
    eventPublicationStatus: {
      upsert: jest.fn(),
    },
  };

  const service = new EventsService(
    eventsRepository as never,
    prisma as never,
    authorizationService as never,
    auditService as never,
    emailService as never,
    zoomService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects zoom-enabled physical events', async () => {
    await expect(
      service.createEvent(
        {
          regionId: 'region-1',
          areaId: 'area-1',
          title: 'Event',
          date: '2026-04-12',
          startTime: '18:00',
          endTime: '19:00',
          mode: 'PHYSICAL',
          visibility: 'PUBLIC',
          zoomEnabled: true,
        } as never,
        {
          id: 'user-1',
          email: 'u@test.com',
          displayName: 'User',
          roles: ['MEETING_EDITOR'],
          assignments: [],
        },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('creates a tentative hold and moves the event to tentative', async () => {
    eventsRepository.findEventById.mockResolvedValue({
      id: 'event-1',
      regionId: 'region-1',
      areaId: 'area-1',
      title: 'Event',
      visibility: 'PUBLIC',
      status: 'DRAFT',
      timezone: 'Asia/Riyadh',
    });
    eventsRepository.findEventsForSlotOverlap.mockResolvedValue([]);
    prisma.$transaction.mockImplementation(
      async (callback: (tx: never) => Promise<unknown>) =>
        callback({
          eventBookingRequest: {
            create: jest.fn().mockResolvedValue({ id: 'booking-1' }),
            update: jest
              .fn()
              .mockResolvedValue({ id: 'booking-1', slotId: 'slot-1' }),
          },
          eventSlot: {
            create: jest.fn().mockResolvedValue({ id: 'slot-1' }),
            update: jest.fn().mockResolvedValue({ id: 'slot-1' }),
          },
          tentativeHold: {
            create: jest
              .fn()
              .mockResolvedValue({ id: 'hold-1', status: 'ACTIVE' }),
            update: jest.fn().mockResolvedValue({ id: 'hold-1' }),
          },
          event: {
            update: jest
              .fn()
              .mockResolvedValue({ id: 'event-1', status: 'TENTATIVE' }),
          },
          eventStatusHistory: {
            create: jest.fn().mockResolvedValue({ id: 'history-1' }),
          },
          eventPublicationStatus: {
            upsert: jest.fn(),
          },
          zoomMeeting: {
            create: jest.fn(),
          },
        }),
    );

    const result = await service.createTentativeHold(
      'event-1',
      {
        requestedStartAt: '2026-04-12T18:00:00+03:00',
        requestedEndAt: '2026-04-12T19:00:00+03:00',
        timezone: 'Asia/Riyadh',
        idempotencyKey: 'idem-1',
      },
      {
        id: 'user-1',
        email: 'u@test.com',
        displayName: 'User',
        roles: ['MEETING_EDITOR'],
        assignments: [],
      },
    );

    expect(result.hold.status).toBe('ACTIVE');
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'STATUS_CHANGED',
        resourceType: 'Event',
      }),
    );
  });

  it('returns an existing Zoom booking for repeated confirmation requests', async () => {
    eventsRepository.findEventById.mockResolvedValue({
      id: 'event-1',
      regionId: 'region-1',
      areaId: 'area-1',
      title: 'Event',
      description: 'A managed event',
      visibility: 'PUBLIC',
      status: 'TENTATIVE',
      timezone: 'Asia/Riyadh',
    });
    prisma.tentativeHold.findUnique.mockResolvedValue({
      id: 'hold-1',
      bookingRequestId: 'booking-1',
      slotId: 'slot-1',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 60_000),
      bookingRequest: {
        id: 'booking-1',
        requestedStartAt: new Date('2026-04-12T18:00:00+03:00'),
        requestedEndAt: new Date('2026-04-12T19:00:00+03:00'),
        timezone: 'Asia/Riyadh',
      },
      slots: { id: 'slot-1' },
    });
    prisma.zoomMeeting.findUnique.mockResolvedValue({
      id: 'zoom-1',
      bookingRequestId: 'booking-1',
      zoomMeetingId: 'meeting-1',
      joinUrl: 'https://zoom.us/j/meeting-1',
      hostUrl: 'https://zoom.us/s/host',
      startUrl: 'https://zoom.us/s/start',
      externalStatus: 'created',
    });

    const result = await service.confirmZoomBooking(
      'event-1',
      { holdId: 'hold-1', idempotencyKey: 'idem-1' },
      {
        id: 'user-1',
        email: 'u@test.com',
        displayName: 'User',
        roles: ['MEETING_EDITOR'],
        assignments: [],
      },
    );

    expect(result.status).toBe('confirmed');
    expect(zoomService.createMeeting).not.toHaveBeenCalled();
    expect(emailService.send).not.toHaveBeenCalled();
  });

  it('rejects publishing private events', async () => {
    eventsRepository.findEventById.mockResolvedValue({
      id: 'event-1',
      regionId: 'region-1',
      areaId: 'area-1',
      title: 'Event',
      visibility: 'PRIVATE',
      status: 'CONFIRMED',
    });

    await expect(
      service.publishEvent('event-1', {
        id: 'user-1',
        email: 'u@test.com',
        displayName: 'User',
        roles: ['MEETING_EDITOR'],
        assignments: [],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('blocks audit view for non-super-admins', async () => {
    await expect(
      service.getAdminAudit('event-1', {
        id: 'user-1',
        email: 'u@test.com',
        displayName: 'User',
        roles: ['MEETING_EDITOR'],
        assignments: [],
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
