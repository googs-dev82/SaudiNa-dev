import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateAssignmentDto, UpdateAssignmentDto } from './assignments.dto.js';

@Injectable()
export class AssignmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateAssignmentDto) {
    return this.prisma.assignment.create({
      data: {
        id: crypto.randomUUID(),
        userId: input.userId,
        roleCode: input.roleCode,
        scopeType: input.scopeType,
        scopeId: input.scopeId,
        scopeCode: input.scopeCode,
        active: input.active ?? true,
        activeFrom: input.activeFrom ? new Date(input.activeFrom) : undefined,
        activeUntil: input.activeUntil
          ? new Date(input.activeUntil)
          : undefined,
      },
    });
  }

  update(id: string, input: UpdateAssignmentDto) {
    return this.prisma.assignment.update({
      where: { id },
      data: {
        userId: input.userId,
        roleCode: input.roleCode,
        scopeType: input.scopeType,
        scopeId: input.scopeId,
        scopeCode: input.scopeCode,
        active: input.active,
        activeFrom:
          input.activeFrom !== undefined
            ? input.activeFrom
              ? new Date(input.activeFrom)
              : null
            : undefined,
        activeUntil:
          input.activeUntil !== undefined
            ? input.activeUntil
              ? new Date(input.activeUntil)
              : null
            : undefined,
      },
    });
  }

  delete(id: string) {
    return this.prisma.assignment.delete({ where: { id } });
  }

  findById(id: string) {
    return this.prisma.assignment.findUnique({
      where: { id },
      include: {
        users: true,
      },
    });
  }

  findByUserId(userId: string, at = new Date()) {
    return this.prisma.assignment.findMany({
      where: {
        userId,
        active: true,
        OR: [{ activeFrom: null }, { activeFrom: { lte: at } }],
        AND: [{ OR: [{ activeUntil: null }, { activeUntil: { gte: at } }] }],
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  listAll() {
    return this.prisma.assignment.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
