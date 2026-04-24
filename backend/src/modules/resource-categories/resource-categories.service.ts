import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateResourceCategoryDto,
  UpdateResourceCategoryDto,
} from './resource-categories.dto.js';
import { ResourceCategoriesRepository } from './resource-categories.repository.js';

@Injectable()
export class ResourceCategoriesService {
  constructor(
    private readonly resourceCategoriesRepository: ResourceCategoriesRepository,
  ) {}

  createCategory(input: CreateResourceCategoryDto) {
    return this.resourceCategoriesRepository.create(input);
  }

  async updateCategory(id: string, input: UpdateResourceCategoryDto) {
    const existing = await this.resourceCategoriesRepository.findById(id);

    if (!existing) {
      throw new NotFoundException('Resource category not found.');
    }

    return this.resourceCategoriesRepository.update(id, input);
  }

  listCategories() {
    return this.resourceCategoriesRepository.listAll();
  }
}
