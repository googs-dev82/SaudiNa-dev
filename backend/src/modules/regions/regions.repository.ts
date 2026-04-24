import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateRegionDto, UpdateRegionDto } from './regions.dto.js';

@Injectable()
export class RegionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateRegionDto) {
    return this.prisma.region.create({
      data: {
        code: input.code,
        nameAr: input.nameAr,
        nameEn: input.nameEn,
        isActive: input.isActive ?? true,
      },
    });
  }

  findPublic() {
    return this.prisma.region.findMany({
      where: { isActive: true },
      orderBy: { nameEn: 'asc' },
    });
  }

  listAll() {
    return this.prisma.region.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findById(id: string) {
    return this.prisma.region.findUnique({ where: { id } });
  }

  update(id: string, input: UpdateRegionDto) {
    return this.prisma.region.update({
      where: { id },
      data: {
        ...(input.code !== undefined && { code: input.code }),
        ...(input.nameAr !== undefined && { nameAr: input.nameAr }),
        ...(input.nameEn !== undefined && { nameEn: input.nameEn }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
    });
  }

  delete(id: string) {
    return this.prisma.region.delete({ where: { id } });
  }
}
