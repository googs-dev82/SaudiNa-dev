import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateCommitteeDto, UpdateCommitteeDto } from './committees.dto.js';

@Injectable()
export class CommitteesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateCommitteeDto) {
    return this.prisma.committee.create({
      data: {
        code: input.code,
        level: input.level as never,
        regionId: input.regionId,
        areaId: input.areaId,
        nameAr: input.nameAr,
        nameEn: input.nameEn,
        descriptionAr: input.descriptionAr,
        descriptionEn: input.descriptionEn,
        isActive: input.isActive ?? true,
      },
    });
  }

  listAll() {
    return this.prisma.committee.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.committee.findUnique({ where: { id } });
  }

  update(id: string, input: UpdateCommitteeDto) {
    return this.prisma.committee.update({
      where: { id },
      data: {
        ...(input.code !== undefined && { code: input.code }),
        ...(input.level !== undefined && { level: input.level as never }),
        ...(input.regionId !== undefined && { regionId: input.regionId }),
        ...(input.areaId !== undefined && { areaId: input.areaId }),
        ...(input.nameAr !== undefined && { nameAr: input.nameAr }),
        ...(input.nameEn !== undefined && { nameEn: input.nameEn }),
        ...(input.descriptionAr !== undefined && {
          descriptionAr: input.descriptionAr,
        }),
        ...(input.descriptionEn !== undefined && {
          descriptionEn: input.descriptionEn,
        }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
    });
  }

  delete(id: string) {
    return this.prisma.committee.delete({ where: { id } });
  }
}
