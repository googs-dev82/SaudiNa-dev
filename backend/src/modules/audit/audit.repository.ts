import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateAuditLogDto, AuditQueryDto } from './audit.dto.js';

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        action: input.action as never,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        userId: input.userId,
        userRoleSnapshot: input.userRoleSnapshot,
        method: input.method,
        path: input.path,
        ipAddress: input.ipAddress,
        correlationId: input.correlationId,
        beforeState: input.beforeState as Prisma.InputJsonValue | undefined,
        afterState: input.afterState as Prisma.InputJsonValue | undefined,
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }

  findMany(query: AuditQueryDto) {
    return this.prisma.auditLog.findMany({
      where: {
        action: query.action as never,
        resourceType: query.resourceType,
        userId: query.userId,
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }
}
