import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  CreateInServiceMeetingDto,
  CreateRecoveryMeetingDto,
  PublicMeetingSearchQueryDto,
  UpdateInServiceMeetingDto,
  UpdateRecoveryMeetingDto,
} from './meetings.dto.js';

interface NearbyMeetingRow {
  id: string;
  nameEn: string;
  nameAr: string;
  city: string;
  dayOfWeek: string;
  startTime: string;
  isOnline: boolean;
  latitude: number | null;
  longitude: number | null;
  distanceMeters: number;
}

@Injectable()
export class MeetingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildRecoveryWhere(query: PublicMeetingSearchQueryDto) {
    return {
      status: 'PUBLISHED' as const,
      areaId: query.areaId,
      city: query.city
        ? { contains: query.city, mode: 'insensitive' as const }
        : undefined,
      district: query.district
        ? { contains: query.district, mode: 'insensitive' as const }
        : undefined,
      dayOfWeek: query.dayOfWeek,
      gender: query.gender,
      language: query.language,
      isOnline: query.isOnline,
      OR: query.query
        ? [
            { nameEn: { contains: query.query, mode: 'insensitive' as const } },
            { nameAr: { contains: query.query, mode: 'insensitive' as const } },
            { city: { contains: query.query, mode: 'insensitive' as const } },
          ]
        : undefined,
      latitude:
        query.north !== undefined && query.south !== undefined
          ? { gte: query.south, lte: query.north }
          : undefined,
      longitude:
        query.east !== undefined && query.west !== undefined
          ? { gte: query.west, lte: query.east }
          : undefined,
    };
  }

  createRecoveryMeeting(input: CreateRecoveryMeetingDto, createdById: string) {
    return this.prisma.recoveryMeeting.create({
      data: { ...input, createdById },
    });
  }

  updateRecoveryMeeting(id: string, input: UpdateRecoveryMeetingDto) {
    return this.prisma.recoveryMeeting.update({
      where: { id },
      data: { ...input },
    });
  }

  findRecoveryMeetingById(id: string) {
    return this.prisma.recoveryMeeting.findUnique({ where: { id } });
  }

  updateRecoveryStatus(id: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') {
    return this.prisma.recoveryMeeting.update({
      where: { id },
      data: { status },
    });
  }

  deleteRecoveryMeeting(id: string) {
    return this.prisma.recoveryMeeting.delete({
      where: { id },
    });
  }

  searchPublicRecoveryMeetings(query: PublicMeetingSearchQueryDto) {
    const limit = query.limit ?? 20;

    return this.prisma.recoveryMeeting.findMany({
      where: this.buildRecoveryWhere(query),
      take: limit,
      ...(query.cursor ? { skip: 1, cursor: { id: query.cursor } } : {}),
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }, { id: 'asc' }],
    });
  }

  async searchNearbyRecoveryMeetings(
    query: PublicMeetingSearchQueryDto & {
      latitude: number;
      longitude: number;
      radiusKm: number;
    },
  ) {
    const conditions: Prisma.Sql[] = [
      Prisma.sql`rm."status" = 'PUBLISHED'`,
      Prisma.sql`rm."isOnline" = false`,
      Prisma.sql`rm."latitude" IS NOT NULL`,
      Prisma.sql`rm."longitude" IS NOT NULL`,
      Prisma.sql`ST_DWithin(ST_SetSRID(ST_MakePoint(rm."longitude", rm."latitude"), 4326)::geography, ST_SetSRID(ST_MakePoint(${query.longitude}, ${query.latitude}), 4326)::geography, ${query.radiusKm * 1000})`,
    ];

    if (query.areaId) {
      conditions.push(Prisma.sql`rm."areaId" = ${query.areaId}`);
    }
    if (query.city) {
      conditions.push(Prisma.sql`rm."city" ILIKE ${`%${query.city}%`}`);
    }
    if (query.dayOfWeek) {
      conditions.push(Prisma.sql`rm."dayOfWeek" = ${query.dayOfWeek}`);
    }
    if (query.gender) {
      conditions.push(Prisma.sql`rm."gender" = ${query.gender}`);
    }
    if (query.language) {
      conditions.push(Prisma.sql`rm."language" = ${query.language}`);
    }

    const whereSql = Prisma.join(conditions, ' AND ');

    return this.prisma.$queryRaw<NearbyMeetingRow[]>(Prisma.sql`
      SELECT
        rm."id",
        rm."nameEn",
        rm."nameAr",
        rm."city",
        rm."dayOfWeek",
        rm."startTime",
        rm."isOnline",
        rm."latitude",
        rm."longitude",
        ST_Distance(
          ST_SetSRID(ST_MakePoint(rm."longitude", rm."latitude"), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${query.longitude}, ${query.latitude}), 4326)::geography
        ) AS "distanceMeters"
      FROM recovery_meetings rm
      WHERE ${whereSql}
      ORDER BY "distanceMeters" ASC
      LIMIT ${query.limit ?? 20}
    `);
  }

  listRecoveryMeetingsForAreas(areaIds: string[]) {
    if (areaIds.length === 0) {
      return this.prisma.recoveryMeeting.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.recoveryMeeting.findMany({
      where: { areaId: { in: areaIds } },
      orderBy: { createdAt: 'desc' },
    });
  }

  createInServiceMeeting(
    input: CreateInServiceMeetingDto,
    createdById: string,
  ) {
    return this.prisma.inServiceMeeting.create({
      data: {
        ...input,
        meetingDate: new Date(input.meetingDate),
        plannedActivities: input.plannedActivities as Prisma.InputJsonValue,
        createdById,
      },
    });
  }

  updateInServiceMeeting(id: string, input: UpdateInServiceMeetingDto) {
    return this.prisma.inServiceMeeting.update({
      where: { id },
      data: {
        ...input,
        meetingDate: new Date(input.meetingDate),
        plannedActivities: input.plannedActivities as Prisma.InputJsonValue,
      },
    });
  }

  findInServiceMeetingById(id: string) {
    return this.prisma.inServiceMeeting.findUnique({ where: { id } });
  }

  updateInServiceStatus(
    id: string,
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'ARCHIVED',
    approvedById?: string,
    rejectionComments?: string,
  ) {
    return this.prisma.inServiceMeeting.update({
      where: { id },
      data: {
        status,
        approvedById,
        rejectionComments,
      },
    });
  }

  listInServiceMeetingsForCommittees(committeeIds: string[]) {
    if (committeeIds.length === 0) {
      return this.prisma.inServiceMeeting.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.inServiceMeeting.findMany({
      where: { committeeId: { in: committeeIds } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
