import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  CreateContactSubmissionDto,
  UpdateContactSubmissionDto,
} from './contact.dto.js';

@Injectable()
export class ContactRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateContactSubmissionDto, assignedCommitteeCode: string) {
    return this.prisma.contactSubmission.create({
      data: {
        ...input,
        assignedCommitteeCode,
      },
    });
  }

  findMany() {
    return this.prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  findById(id: string) {
    return this.prisma.contactSubmission.findUnique({ where: { id } });
  }

  update(id: string, input: UpdateContactSubmissionDto) {
    return this.prisma.contactSubmission.update({
      where: { id },
      data: {
        status: input.status as never,
        internalNotes: input.internalNotes,
      },
    });
  }
}
