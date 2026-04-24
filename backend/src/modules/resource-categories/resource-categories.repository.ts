import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  CreateResourceCategoryDto,
  UpdateResourceCategoryDto,
} from './resource-categories.dto.js';

@Injectable()
export class ResourceCategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateResourceCategoryDto) {
    return this.prisma.resourceCategory.create({
      data: input,
    });
  }

  update(id: string, input: UpdateResourceCategoryDto) {
    return this.prisma.resourceCategory.update({ where: { id }, data: input });
  }

  findById(id: string) {
    return this.prisma.resourceCategory.findUnique({ where: { id } });
  }

  listAll() {
    return this.prisma.resourceCategory.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
