import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateAreaDto, UpdateAreaDto } from './areas.dto.js';

@Injectable()
export class AreasRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateAreaDto) {
    return this.prisma.area.create({
      data: {
        regionId: input.regionId,
        code: input.code,
        nameAr: input.nameAr,
        nameEn: input.nameEn,
        isActive: input.isActive ?? true,
      },
    });
  }

  findPublic(regionId?: string) {
    return this.prisma.area.findMany({
      where: {
        isActive: true,
        regionId,
      },
      orderBy: { nameEn: 'asc' },
    });
  }

  listAll() {
    return this.prisma.area.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findById(id: string) {
    return this.prisma.area.findUnique({ where: { id } });
  }

  update(id: string, input: UpdateAreaDto) {
    return this.prisma.area.update({
      where: { id },
      data: {
        ...(input.regionId !== undefined && { regionId: input.regionId }),
        ...(input.code !== undefined && { code: input.code }),
        ...(input.nameAr !== undefined && { nameAr: input.nameAr }),
        ...(input.nameEn !== undefined && { nameEn: input.nameEn }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
    });
  }

  delete(id: string) {
    return this.prisma.area.delete({ where: { id } });
  }
}
