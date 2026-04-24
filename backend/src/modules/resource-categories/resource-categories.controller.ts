import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator.js';
import {
  CreateResourceCategoryDto,
  UpdateResourceCategoryDto,
} from './resource-categories.dto.js';
import { ResourceCategoriesService } from './resource-categories.service.js';

@Roles('SUPER_ADMIN', 'CONTENT_EDITOR')
@Controller('admin/resource-categories')
export class ResourceCategoriesController {
  constructor(
    private readonly resourceCategoriesService: ResourceCategoriesService,
  ) {}

  @Get()
  listCategories() {
    return this.resourceCategoriesService.listCategories();
  }

  @Post()
  createCategory(@Body() input: CreateResourceCategoryDto) {
    return this.resourceCategoriesService.createCategory(input);
  }

  @Patch(':id')
  updateCategory(
    @Param('id') id: string,
    @Body() input: UpdateResourceCategoryDto,
  ) {
    return this.resourceCategoriesService.updateCategory(id, input);
  }
}
