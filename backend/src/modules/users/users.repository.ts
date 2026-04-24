import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  CreateUserDto,
  UpdateUserDto,
  UpsertExternalUserDto,
} from './users.dto.js';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByIdWithCounts(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    const [
      assignments,
      recoveryMeetings,
      inServiceMeetingsCreated,
      inServiceMeetingsApproved,
      reportsCreated,
      reportsApproved,
    ] = await Promise.all([
      this.prisma.assignment.count({ where: { userId: id } }),
      this.prisma.recoveryMeeting.count({ where: { createdById: id } }),
      this.prisma.inServiceMeeting.count({ where: { createdById: id } }),
      this.prisma.inServiceMeeting.count({ where: { approvedById: id } }),
      this.prisma.report.count({ where: { createdById: id } }),
      this.prisma.report.count({ where: { approvedById: id } }),
    ]);

    return {
      ...user,
      _count: {
        assignments,
        recovery_meetings: recoveryMeetings,
        in_service_meetings_in_service_meetings_createdByIdTousers:
          inServiceMeetingsCreated,
        in_service_meetings_in_service_meetings_approvedByIdTousers:
          inServiceMeetingsApproved,
        reports_reports_createdByIdTousers: reportsCreated,
        reports_reports_approvedByIdTousers: reportsApproved,
      },
    };
  }

  findMany() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  upsertExternalIdentity(input: UpsertExternalUserDto) {
    return this.prisma.user.upsert({
      where: { email: input.email },
      create: {
        email: input.email,
        displayName: input.displayName,
        provider: input.provider as never,
        externalSubject: input.externalSubject,
        lastLoginAt: new Date(),
      },
      update: {
        displayName: input.displayName,
        provider: input.provider as never,
        externalSubject: input.externalSubject,
        lastLoginAt: new Date(),
      },
    });
  }

  create(input: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        email: input.email,
        displayName: input.displayName,
        provider: input.provider as never,
      },
    });
  }

  update(id: string, input: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: {
        displayName: input.displayName,
        status: input.status as never,
      },
    });
  }

  delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  updateField(id: string, data: { preferredLanguage?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
