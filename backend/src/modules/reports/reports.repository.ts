import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateReportDto } from './reports.dto.js';

@Injectable()
export class ReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateReportDto, createdById: string) {
    return this.prisma.report.create({
      data: {
        type: input.type as never,
        filters: input.filters as Prisma.InputJsonValue,
        approvalRequired: input.approvalRequired ?? false,
        createdById,
      },
    });
  }

  findById(id: string) {
    return this.prisma.report.findUnique({ where: { id } });
  }

  listByCreator(createdById: string) {
    return this.prisma.report.findMany({
      where: { createdById },
      orderBy: { createdAt: 'desc' },
    });
  }

  listAll() {
    return this.prisma.report.findMany({ orderBy: { createdAt: 'desc' } });
  }

  updateStatus(
    id: string,
    status: string,
    approvedById?: string,
    filePath?: string,
  ) {
    return this.prisma.report.update({
      where: { id },
      data: {
        status: status as never,
        approvedById,
        filePath,
      },
    });
  }
}
