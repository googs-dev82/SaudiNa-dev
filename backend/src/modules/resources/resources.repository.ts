import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateResourceDto } from './resources.dto.js';

@Injectable()
export class ResourcesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateResourceDto) {
    return this.prisma.resource.create({
      data: {
        ...input,
        isPublic: input.isPublic ?? true,
      },
    });
  }

  listPublic() {
    return this.prisma.resource.findMany({
      where: { isPublic: true },
      include: { resource_categories: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  listAdmin() {
    return this.prisma.resource.findMany({
      include: { resource_categories: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  incrementDownloadCount(id: string) {
    return this.prisma.resource.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });
  }

  findById(id: string) {
    return this.prisma.resource.findUnique({
      where: { id },
      include: { resource_categories: true },
    });
  }
}
