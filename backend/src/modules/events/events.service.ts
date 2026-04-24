import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { AuthorizationService } from '../../common/services/authorization.service.js';
import { CurrentUserContext } from '../../common/types/request-context.type.js';
import { AuditService } from '../audit/audit.service.js';
import { EmailService } from '../integrations/email.service.js';
import { ZoomService } from '../integrations/zoom.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  CheckEventAvailabilityDto,
  ConfirmEventBookingDto,
  CreateEventBookingRequestDto,
  CreateEventDto,
  CreateTentativeHoldDto,
  ListAdminEventsQueryDto,
  ListPublicEventsQueryDto,
  RescheduleEventDto,
  SetEventVisibilityDto,
  UpdateEventDto,
} from './events.dto.js';
import { EventsRepository } from './events.repository.js';

function toDate(startAt: string) {
  return new Date(startAt);
}

function buildSlotKey(
  eventId: string,
  startAt: Date,
  endAt: Date,
  timezone: string,
) {
  return `${eventId}:${timezone}:${startAt.toISOString()}:${endAt.toISOString()}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function mapPublicEvent(event: {
  id: string;
  title: string;
  description?: string | null;
  visibility: string;
  mode: string;
  status: string;
  date: Date;
  startTime: string;
  endTime?: string | null;
  durationMinutes?: number | null;
  timezone: string;
  zoomEnabled: boolean;
  regionId: string;
  areaId: string;
  regions?: { id: string; code: string; nameAr: string; nameEn: string } | null;
  areas?: {
    id: string;
    regionId: string;
    code: string;
    nameAr: string;
    nameEn: string;
  } | null;
  invitationInstructions?: string | null;
  locationAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  meetingLink?: string | null;
  publicationStatus?: { status: string } | null;
}) {
  return {
    id: event.id,
    title: event.title,
    description: event.description ?? null,
    visibility: event.visibility,
    mode: event.mode,
    status: event.status,
    date: event.date.toISOString(),
    startTime: event.startTime,
    endTime: event.endTime ?? null,
    durationMinutes: event.durationMinutes ?? null,
    timezone: event.timezone,
    zoomEnabled: event.zoomEnabled,
    regionId: event.regionId,
    areaId: event.areaId,
    regions: event.regions ?? null,
    areas: event.areas ?? null,
    invitationInstructions: event.invitationInstructions ?? null,
    locationAddress: event.locationAddress ?? null,
    latitude: event.latitude ?? null,
    longitude: event.longitude ?? null,
    meetingLink: event.meetingLink ?? null,
    publicationStatus: event.publicationStatus?.status ?? null,
  };
}

@Injectable()
export class EventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly prisma: PrismaService,
    private readonly authorizationService: AuthorizationService,
    private readonly auditService: AuditService,
    private readonly emailService: EmailService,
    private readonly zoomService: ZoomService,
  ) {}

  private async getEventOrThrow(id: string) {
    const event = await this.eventsRepository.findEventById(id);
    if (!event) {
      throw new NotFoundException('Event not found.');
    }
    return event;
  }

  private validateEventShape(
    input: {
      mode?: string;
      zoomEnabled?: boolean;
      endTime?: string;
      durationMinutes?: number;
    },
    existing?: {
      mode: string;
      zoomEnabled: boolean;
      endTime?: string | null;
      durationMinutes?: number | null;
    },
  ) {
    const mode = input.mode ?? existing?.mode;
    const zoomEnabled = input.zoomEnabled ?? existing?.zoomEnabled;
    const endTime = input.endTime ?? existing?.endTime ?? undefined;
    const durationMinutes =
      input.durationMinutes ?? existing?.durationMinutes ?? undefined;

    if (zoomEnabled && mode === 'PHYSICAL') {
      throw new BadRequestException(
        'Zoom-enabled events must be online or hybrid.',
      );
    }

    if (!endTime && !durationMinutes) {
      throw new BadRequestException(
        'Either an end time or duration must be provided.',
      );
    }
  }

  async createEvent(input: CreateEventDto, user: CurrentUserContext) {
    this.authorizationService.assertEventCreator(
      user,
      input.regionId,
      input.areaId,
    );
    this.validateEventShape(input);

    const event = await this.eventsRepository.createEvent(input, user.id);
    await this.auditService.log({
      action: 'CREATED',
      resourceType: 'Event',
      resourceId: event.id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      afterState: event as unknown as Record<string, unknown>,
    });
    return event;
  }

  async updateEvent(
    id: string,
    input: UpdateEventDto,
    user: CurrentUserContext,
  ) {
    const existing = await this.getEventOrThrow(id);
    this.authorizationService.assertEventCreator(
      user,
      existing.regionId,
      existing.areaId,
    );
    this.validateEventShape(input, existing);

    const updated = await this.eventsRepository.updateEvent(id, input);
    await this.auditService.log({
      action: 'UPDATED',
      resourceType: 'Event',
      resourceId: id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      beforeState: existing as unknown as Record<string, unknown>,
      afterState: updated as unknown as Record<string, unknown>,
    });
    return updated;
  }

  async setVisibility(
    id: string,
    input: SetEventVisibilityDto,
    user: CurrentUserContext,
  ) {
    const existing = await this.getEventOrThrow(id);
    this.authorizationService.assertEventPublisher(
      user,
      existing.regionId,
      existing.areaId,
    );

    const updated = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const event = await tx.event.update({
          where: { id },
          data: {
            visibility: input.visibility,
          },
        });

        await tx.eventStatusHistory.create({
          data: {
            eventId: id,
            previousStatus: event.status,
            newStatus: event.status,
            changedById: user.id,
            reason: `Visibility changed to ${input.visibility}`,
          },
        });

        await tx.eventPublicationStatus.upsert({
          where: { eventId: id },
          create: {
            eventId: id,
            status: input.visibility === 'PUBLIC' ? 'ELIGIBLE' : 'UNPUBLISHED',
            eligibleAt: input.visibility === 'PUBLIC' ? new Date() : null,
            unpublishedAt: input.visibility === 'PRIVATE' ? new Date() : null,
            publishedById: input.visibility === 'PUBLIC' ? user.id : null,
          },
          update: {
            status: input.visibility === 'PUBLIC' ? 'ELIGIBLE' : 'UNPUBLISHED',
            eligibleAt: input.visibility === 'PUBLIC' ? new Date() : null,
            unpublishedAt: input.visibility === 'PRIVATE' ? new Date() : null,
            publishedById: input.visibility === 'PUBLIC' ? user.id : null,
          },
        });

        return event;
      },
    );

    await this.auditService.log({
      action: 'STATUS_CHANGED',
      resourceType: 'Event',
      resourceId: id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      beforeState: { visibility: existing.visibility },
      afterState: { visibility: updated.visibility },
    });

    return this.getEventOrThrow(id);
  }

  async publishEvent(id: string, user: CurrentUserContext) {
    const existing = await this.getEventOrThrow(id);
    this.authorizationService.assertEventPublisher(
      user,
      existing.regionId,
      existing.areaId,
    );

    if (existing.visibility !== 'PUBLIC') {
      throw new BadRequestException('Private events cannot be published.');
    }

    if (existing.status !== 'CONFIRMED') {
      throw new BadRequestException('Only confirmed events can be published.');
    }

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.event.update({
        where: { id },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
      });

      await tx.eventPublicationStatus.upsert({
        where: { eventId: id },
        create: {
          eventId: id,
          status: 'PUBLISHED',
          eligibleAt: new Date(),
          publishedAt: new Date(),
          publishedById: user.id,
        },
        update: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          publishedById: user.id,
        },
      });
    });

    await this.auditService.log({
      action: 'STATUS_CHANGED',
      resourceType: 'Event',
      resourceId: id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      beforeState: { status: existing.status },
      afterState: { status: 'PUBLISHED' },
    });

    return this.getEventOrThrow(id);
  }

  async unpublishEvent(id: string, user: CurrentUserContext) {
    const existing = await this.getEventOrThrow(id);
    this.authorizationService.assertEventPublisher(
      user,
      existing.regionId,
      existing.areaId,
    );

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.event.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
        },
      });

      await tx.eventPublicationStatus.upsert({
        where: { eventId: id },
        create: {
          eventId: id,
          status: 'UNPUBLISHED',
          unpublishedAt: new Date(),
          publishedById: user.id,
        },
        update: {
          status: 'UNPUBLISHED',
          unpublishedAt: new Date(),
          publishedById: user.id,
        },
      });
    });

    await this.auditService.log({
      action: 'STATUS_CHANGED',
      resourceType: 'Event',
      resourceId: id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      beforeState: { status: existing.status },
      afterState: { status: 'CONFIRMED' },
    });

    return this.getEventOrThrow(id);
  }

  async checkAvailability(
    id: string,
    input: CheckEventAvailabilityDto,
    user: CurrentUserContext,
  ) {
    const event = await this.getEventOrThrow(id);
    this.authorizationService.assertEventCreator(
      user,
      event.regionId,
      event.areaId,
    );

    const requestedStartAt = toDate(input.requestedStartAt);
    const requestedEndAt = toDate(input.requestedEndAt);
    const conflicts = await this.eventsRepository.findEventsForSlotOverlap(
      requestedStartAt,
      requestedEndAt,
      input.timezone ?? event.timezone,
    );

    return {
      available: conflicts.length === 0,
      conflicts: conflicts.map((conflict) => ({
        eventId: conflict.eventId,
        title: conflict.events.title,
        startAt: conflict.slotStartAt,
        endAt: conflict.slotEndAt,
      })),
      suggestedAlternatives: [],
    };
  }

  async createBookingRequest(
    id: string,
    input: CreateEventBookingRequestDto,
    user: CurrentUserContext,
  ) {
    const event = await this.getEventOrThrow(id);
    this.authorizationService.assertEventCreator(
      user,
      event.regionId,
      event.areaId,
    );

    const requestedStartAt = toDate(input.requestedStartAt);
    const requestedEndAt = toDate(input.requestedEndAt);
    const conflicts = await this.eventsRepository.findEventsForSlotOverlap(
      requestedStartAt,
      requestedEndAt,
      input.timezone ?? event.timezone,
    );

    if (conflicts.length > 0) {
      throw new BadRequestException('The selected slot is already reserved.');
    }

    const request = await this.prisma.eventBookingRequest.create({
      data: {
        eventId: id,
        requestedById: user.id,
        requestedStartAt,
        requestedEndAt,
        timezone: input.timezone ?? event.timezone,
        status: 'PENDING_VALIDATION',
        idempotencyKey: randomUUID(),
      },
    });

    return request;
  }

  async createTentativeHold(
    id: string,
    input: CreateTentativeHoldDto,
    user: CurrentUserContext,
  ) {
    const event = await this.getEventOrThrow(id);
    this.authorizationService.assertEventCreator(
      user,
      event.regionId,
      event.areaId,
    );

    const requestedStartAt = toDate(input.requestedStartAt);
    const requestedEndAt = toDate(input.requestedEndAt);
    const conflicts = await this.eventsRepository.findEventsForSlotOverlap(
      requestedStartAt,
      requestedEndAt,
      input.timezone ?? event.timezone,
    );

    if (conflicts.length > 0) {
      throw new BadRequestException('The selected slot is already reserved.');
    }

    const slotKey = buildSlotKey(
      id,
      requestedStartAt,
      requestedEndAt,
      input.timezone ?? event.timezone,
    );

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const result = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const bookingRequest = await tx.eventBookingRequest.create({
          data: {
            eventId: id,
            requestedById: user.id,
            requestedStartAt,
            requestedEndAt,
            timezone: input.timezone ?? event.timezone,
            status: 'TENTATIVE',
            idempotencyKey: input.idempotencyKey,
          },
        });

        const slot = await tx.eventSlot.create({
          data: {
            eventId: id,
            slotKey,
            slotStartAt: requestedStartAt,
            slotEndAt: requestedEndAt,
            timezone: input.timezone ?? event.timezone,
            status: 'HELD',
          },
        });

        await tx.eventBookingRequest.update({
          where: { id: bookingRequest.id },
          data: {
            slotId: slot.id,
          },
        });

        const hold = await tx.tentativeHold.create({
          data: {
            eventId: id,
            bookingRequestId: bookingRequest.id,
            slotId: slot.id,
            holdToken: input.idempotencyKey,
            expiresAt,
            status: 'ACTIVE',
          },
        });

        await tx.event.update({
          where: { id },
          data: { status: 'TENTATIVE' },
        });

        await tx.eventStatusHistory.create({
          data: {
            eventId: id,
            previousStatus: event.status,
            newStatus: 'TENTATIVE',
            changedById: user.id,
            reason: 'Tentative hold created.',
          },
        });

        return { bookingRequest, slot, hold };
      },
    );

    await this.auditService.log({
      action: 'STATUS_CHANGED',
      resourceType: 'Event',
      resourceId: id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      beforeState: { status: event.status },
      afterState: { status: 'TENTATIVE', expiresAt },
    });

    return result;
  }

  async confirmZoomBooking(
    id: string,
    input: ConfirmEventBookingDto,
    user: CurrentUserContext,
  ) {
    const event = await this.getEventOrThrow(id);
    this.authorizationService.assertEventCreator(
      user,
      event.regionId,
      event.areaId,
    );

    const hold = await this.prisma.tentativeHold.findUnique({
      where: { id: input.holdId },
      include: {
        bookingRequest: true,
        slots: true,
      },
    });

    if (!hold) {
      throw new NotFoundException('Tentative hold not found.');
    }

    if (hold.expiresAt.getTime() <= Date.now()) {
      await this.prisma.tentativeHold.update({
        where: { id: hold.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('The tentative hold has expired.');
    }

    if (hold.status !== 'ACTIVE') {
      throw new BadRequestException('The tentative hold is not active.');
    }

    const existingZoomMeeting = await this.prisma.zoomMeeting.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
    });

    if (existingZoomMeeting) {
      return {
        eventId: id,
        bookingRequestId: existingZoomMeeting.bookingRequestId,
        status: 'confirmed',
        zoomMeeting: {
          zoomMeetingId: existingZoomMeeting.zoomMeetingId,
          joinUrl: existingZoomMeeting.joinUrl,
          hostUrl: existingZoomMeeting.hostUrl,
          startUrl: existingZoomMeeting.startUrl,
          externalStatus: existingZoomMeeting.externalStatus,
        },
      };
    }

    const zoomResult = await this.zoomService.createMeeting(
      {
        title: event.title,
        startAt: hold.bookingRequest.requestedStartAt.toISOString(),
        endAt: hold.bookingRequest.requestedEndAt.toISOString(),
        timezone: hold.bookingRequest.timezone,
        description: event.description,
      },
      input.idempotencyKey,
    );

    const confirmed = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const updatedRequest = await tx.eventBookingRequest.update({
          where: { id: hold.bookingRequestId },
          data: {
            status: 'CONFIRMED',
            confirmedAt: new Date(),
          },
        });

        await tx.eventSlot.update({
          where: { id: hold.slotId },
          data: {
            status: 'BOOKED',
          },
        });

        await tx.tentativeHold.update({
          where: { id: hold.id },
          data: {
            status: 'CONSUMED',
          },
        });

        await tx.zoomMeeting.create({
          data: {
            eventId: id,
            bookingRequestId: updatedRequest.id,
            slotId: hold.slotId,
            zoomMeetingId: zoomResult.zoomMeetingId,
            joinUrl: zoomResult.joinUrl,
            hostUrl: zoomResult.hostUrl ?? undefined,
            startUrl: zoomResult.startUrl ?? undefined,
            externalStatus: zoomResult.externalStatus,
            idempotencyKey: input.idempotencyKey,
          },
        });

        await tx.event.update({
          where: { id },
          data: {
            status:
              event.visibility === 'PUBLIC'
                ? 'PENDING_PUBLICATION'
                : 'CONFIRMED',
          },
        });

        await tx.eventStatusHistory.create({
          data: {
            eventId: id,
            previousStatus: event.status,
            newStatus:
              event.visibility === 'PUBLIC'
                ? 'PENDING_PUBLICATION'
                : 'CONFIRMED',
            changedById: user.id,
            reason: 'Zoom booking confirmed.',
          },
        });

        return updatedRequest;
      },
    );

    await this.emailService.send({
      to: user.email,
      subject: `SaudiNA event booking confirmed: ${event.title}`,
      html: `<p>Your event booking for <strong>${escapeHtml(event.title)}</strong> has been confirmed.</p><p>Start: ${hold.bookingRequest.requestedStartAt.toISOString()}</p><p>Join: ${zoomResult.joinUrl}</p>`,
    });

    await this.auditService.log({
      action: 'APPROVED',
      resourceType: 'Event',
      resourceId: id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      beforeState: { status: event.status },
      afterState: {
        status:
          event.visibility === 'PUBLIC' ? 'PENDING_PUBLICATION' : 'CONFIRMED',
        bookingRequestId: confirmed.id,
        zoomMeetingId: zoomResult.zoomMeetingId,
      },
    });

    return {
      eventId: id,
      bookingRequestId: confirmed.id,
      status:
        event.visibility === 'PUBLIC' ? 'pending_publication' : 'confirmed',
      zoomMeeting: zoomResult,
    };
  }

  async cancelEvent(id: string, user: CurrentUserContext, reason?: string) {
    const event = await this.getEventOrThrow(id);
    this.authorizationService.assertEventCreator(
      user,
      event.regionId,
      event.areaId,
    );

    const latestZoomMeeting = await this.prisma.zoomMeeting.findFirst({
      where: { eventId: id },
      orderBy: { bookedAt: 'desc' },
    });

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.event.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });

      await tx.eventPublicationStatus.upsert({
        where: { eventId: id },
        create: {
          eventId: id,
          status: 'UNPUBLISHED',
          unpublishedAt: new Date(),
          notes: reason ?? 'Cancelled by user.',
        },
        update: {
          status: 'UNPUBLISHED',
          unpublishedAt: new Date(),
          notes: reason ?? 'Cancelled by user.',
        },
      });
    });

    if (latestZoomMeeting) {
      await this.zoomService.cancelMeeting(latestZoomMeeting.zoomMeetingId);
      await this.prisma.zoomMeeting.update({
        where: { id: latestZoomMeeting.id },
        data: { cancelledAt: new Date() },
      });
    }

    await this.auditService.log({
      action: 'ARCHIVED',
      resourceType: 'Event',
      resourceId: id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      beforeState: { status: event.status },
      afterState: { status: 'CANCELLED', reason },
    });

    return this.getEventOrThrow(id);
  }

  async rescheduleEvent(
    id: string,
    input: RescheduleEventDto,
    user: CurrentUserContext,
  ) {
    const event = await this.getEventOrThrow(id);
    this.authorizationService.assertEventCreator(
      user,
      event.regionId,
      event.areaId,
    );

    const requestedStartAt = toDate(input.requestedStartAt);
    const requestedEndAt = toDate(input.requestedEndAt);
    const conflicts = await this.eventsRepository.findEventsForSlotOverlap(
      requestedStartAt,
      requestedEndAt,
      input.timezone ?? event.timezone,
    );

    if (conflicts.length > 0) {
      throw new BadRequestException('The selected slot is already reserved.');
    }

    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        date: requestedStartAt,
        startTime: requestedStartAt.toISOString().slice(11, 16),
        endTime: requestedEndAt.toISOString().slice(11, 16),
        timezone: input.timezone ?? event.timezone,
        status: 'RESCHEDULED',
        rescheduledAt: new Date(),
      },
    });

    await this.auditService.log({
      action: 'UPDATED',
      resourceType: 'Event',
      resourceId: id,
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
      beforeState: { status: event.status, date: event.date },
      afterState: { status: updated.status, date: updated.date },
    });

    return updated;
  }

  listPublicEvents(query: ListPublicEventsQueryDto) {
    return this.eventsRepository
      .listPublicEvents(query)
      .then((items) => items.map((event) => mapPublicEvent(event)));
  }

  async getPublicEvent(id: string) {
    const event = await this.eventsRepository.findPublicEventById(id);
    if (!event) {
      throw new NotFoundException('Event not found.');
    }
    return mapPublicEvent(event);
  }

  async getEvent(id: string, user: CurrentUserContext) {
    const event = await this.getEventOrThrow(id);
    this.authorizationService.assertEventCreator(
      user,
      event.regionId,
      event.areaId,
    );
    return event;
  }

  listMyEvents(user: CurrentUserContext) {
    return this.eventsRepository.listMyEvents(user.id);
  }

  listAdminEvents(query: ListAdminEventsQueryDto, user: CurrentUserContext) {
    this.authorizationService.assertEventManager(user);
    return this.eventsRepository.listAdminEvents(query);
  }

  async getAdminAudit(id: string, user: CurrentUserContext) {
    if (!this.authorizationService.isSuperAdmin(user)) {
      throw new ForbiddenException('Super administrator access is required.');
    }
    return this.eventsRepository.findEventAudit(id);
  }

  handleWebhook(payload: Record<string, unknown>) {
    return {
      accepted: true,
      payload,
    };
  }
}
