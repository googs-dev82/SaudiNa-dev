import { Module } from '@nestjs/common';
import { ResourceCategoriesController } from './resource-categories.controller.js';
import { ResourceCategoriesRepository } from './resource-categories.repository.js';
import { ResourceCategoriesService } from './resource-categories.service.js';

@Module({
  controllers: [ResourceCategoriesController],
  providers: [ResourceCategoriesRepository, ResourceCategoriesService],
  exports: [ResourceCategoriesService],
})
export class ResourceCategoriesModule {}
