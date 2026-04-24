import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  CreateEventDto,
  ListAdminEventsQueryDto,
  ListPublicEventsQueryDto,
  UpdateEventDto,
} from './events.dto.js';

const userSummarySelect = {
  id: true,
  email: true,
  displayName: true,
  status: true,
  provider: true,
  externalSubject: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
} as const;

const regionSummarySelect = {
  id: true,
  code: true,
  nameAr: true,
  nameEn: true,
} as const;

const areaSummarySelect = {
  id: true,
  regionId: true,
  code: true,
  nameAr: true,
  nameEn: true,
} as const;

const publicationStatusSelect = {
  id: true,
  eventId: true,
  status: true,
  eligibleAt: true,
  publishedAt: true,
  unpublishedAt: true,
  publishedById: true,
  notes: true,
} as const;

const publicEventSelect = {
  id: true,
  title: true,
  description: true,
  visibility: true,
  mode: true,
  status: true,
  date: true,
  startTime: true,
  endTime: true,
  durationMinutes: true,
  timezone: true,
  zoomEnabled: true,
  regionId: true,
  areaId: true,
  regions: {
    select: regionSummarySelect,
  },
  areas: {
    select: areaSummarySelect,
  },
  invitationInstructions: true,
  locationAddress: true,
  latitude: true,
  longitude: true,
  meetingLink: true,
  publicationStatus: {
    select: {
      status: true,
    },
  },
} as const;

const eventListSelect = {
  id: true,
  regionId: true,
  areaId: true,
  title: true,
  description: true,
  visibility: true,
  mode: true,
  zoomEnabled: true,
  status: true,
  date: true,
  startTime: true,
  endTime: true,
  durationMinutes: true,
  timezone: true,
  invitationInstructions: true,
  organizerName: true,
  organizerUserId: true,
  createdById: true,
  locationAddress: true,
  latitude: true,
  longitude: true,
  meetingLink: true,
  createdAt: true,
  updatedAt: true,
  regions: {
    select: regionSummarySelect,
  },
  areas: {
    select: areaSummarySelect,
  },
  users_events_createdByIdTousers: {
    select: userSummarySelect,
  },
  users_events_organizedByUserIdTousers: {
    select: userSummarySelect,
  },
  publicationStatus: {
    select: publicationStatusSelect,
  },
} as const;

const eventDetailInclude = {
  regions: {
    select: regionSummarySelect,
  },
  areas: {
    select: areaSummarySelect,
  },
  users_events_createdByIdTousers: {
    select: userSummarySelect,
  },
  users_events_organizedByUserIdTousers: {
    select: userSummarySelect,
  },
  bookingRequests: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
    include: {
      zoomMeetings: true,
      tentativeHolds: true,
    },
  },
  publicationStatus: true,
  statusHistory: {
    orderBy: { changedAt: 'desc' as const },
  },
  notificationLogs: {
    orderBy: { createdAt: 'desc' as const },
    take: 10,
  },
  auditLogs: {
    orderBy: { createdAt: 'desc' as const },
    take: 25,
  },
} as const;

@Injectable()
export class EventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  createEvent(input: CreateEventDto, createdById: string) {
    return this.prisma.event.create({
      data: {
        regionId: input.regionId,
        areaId: input.areaId,
        title: input.title,
        description: input.description,
        visibility: input.visibility,
        mode: input.mode,
        zoomEnabled: input.zoomEnabled,
        status: 'DRAFT',
        date: new Date(input.date),
        startTime: input.startTime,
        endTime: input.endTime,
        durationMinutes: input.durationMinutes,
        timezone: input.timezone ?? 'Asia/Riyadh',
        invitationInstructions: input.invitationInstructions,
        organizerName: input.organizerName,
        organizerUserId: input.organizerUserId,
        createdById,
        publicationStatus: {
          create: {
            status:
              input.visibility === 'PUBLIC' ? 'NOT_ELIGIBLE' : 'NOT_ELIGIBLE',
          },
        },
      },
      include: eventDetailInclude,
    });
  }

  updateEvent(id: string, input: UpdateEventDto) {
    const data = {
      ...(input.regionId !== undefined && { regionId: input.regionId }),
      ...(input.areaId !== undefined && { areaId: input.areaId }),
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.visibility !== undefined && { visibility: input.visibility }),
      ...(input.mode !== undefined && { mode: input.mode }),
      ...(input.zoomEnabled !== undefined && {
        zoomEnabled: input.zoomEnabled,
      }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.date !== undefined && { date: new Date(input.date) }),
      ...(input.startTime !== undefined && { startTime: input.startTime }),
      ...(input.endTime !== undefined && { endTime: input.endTime }),
      ...(input.durationMinutes !== undefined && {
        durationMinutes: input.durationMinutes,
      }),
      ...(input.timezone !== undefined && { timezone: input.timezone }),
      ...(input.invitationInstructions !== undefined && {
        invitationInstructions: input.invitationInstructions,
      }),
      ...(input.organizerName !== undefined && {
        organizerName: input.organizerName,
      }),
      ...(input.organizerUserId !== undefined && {
        organizerUserId: input.organizerUserId,
      }),
      ...(input.locationAddress !== undefined && {
        locationAddress: input.locationAddress,
      }),
      ...(input.latitude !== undefined && { latitude: input.latitude }),
      ...(input.longitude !== undefined && { longitude: input.longitude }),
      ...(input.meetingLink !== undefined && {
        meetingLink: input.meetingLink,
      }),
    };

    return this.prisma.event.update({
      where: { id },
      data,
      include: eventDetailInclude,
    });
  }

  findEventById(id: string) {
    return this.prisma.event.findUnique({
      where: { id },
      include: eventDetailInclude,
    });
  }

  findPublicEventById(id: string) {
    return this.prisma.event.findFirst({
      where: {
        id,
        visibility: 'PUBLIC',
        status: 'PUBLISHED',
        publicationStatus: {
          status: 'PUBLISHED',
        },
      },
      select: publicEventSelect,
    });
  }

  listPublicEvents(query: ListPublicEventsQueryDto) {
    const pageSize = query.pageSize ?? 20;
    const skip = ((query.page ?? 1) - 1) * pageSize;

    return this.prisma.event.findMany({
      where: {
        visibility: 'PUBLIC',
        status: 'PUBLISHED',
        publicationStatus: {
          status: 'PUBLISHED',
        },
        regionId: query.regionId,
        areaId: query.areaId,
        mode: query.mode,
        date: {
          gte: query.dateFrom ? new Date(query.dateFrom) : undefined,
          lte: query.dateTo ? new Date(query.dateTo) : undefined,
        },
        OR: query.query
          ? [
              { title: { contains: query.query, mode: 'insensitive' } },
              { description: { contains: query.query, mode: 'insensitive' } },
              {
                locationAddress: { contains: query.query, mode: 'insensitive' },
              },
            ]
          : undefined,
      },
      select: publicEventSelect,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      take: pageSize,
      skip,
    });
  }

  listMyEvents(userId: string) {
    return this.prisma.event.findMany({
      where: {
        OR: [{ createdById: userId }, { organizerUserId: userId }],
      },
      select: eventListSelect,
      orderBy: [{ updatedAt: 'desc' }],
    });
  }

  listAdminEvents(query: ListAdminEventsQueryDto) {
    const pageSize = query.pageSize ?? 20;
    const skip = ((query.page ?? 1) - 1) * pageSize;

    return this.prisma.event.findMany({
      where: {
        visibility: query.visibility ?? undefined,
        status: query.status ?? undefined,
        regionId: query.regionId,
        areaId: query.areaId,
        organizerUserId: query.creatorId,
        mode: query.mode,
        date: {
          gte: query.dateFrom ? new Date(query.dateFrom) : undefined,
          lte: query.dateTo ? new Date(query.dateTo) : undefined,
        },
        publicationStatus: query.publicationStatus
          ? { status: query.publicationStatus }
          : undefined,
      },
      select: eventListSelect,
      orderBy: [{ updatedAt: 'desc' }],
      take: pageSize,
      skip,
    });
  }

  findEventsForSlotOverlap(
    requestedStartAt: Date,
    requestedEndAt: Date,
    timezone: string,
  ) {
    return this.prisma.eventSlot.findMany({
      where: {
        status: { in: ['HELD', 'BOOKED'] },
        timezone,
        slotStartAt: { lt: requestedEndAt },
        slotEndAt: { gt: requestedStartAt },
      },
      include: {
        events: {
          select: {
            title: true,
          },
        },
      },
    });
  }

  findEventAudit(eventId: string) {
    return this.prisma.eventAuditLog.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
