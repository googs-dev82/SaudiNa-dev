import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';
import { ResourcesService } from './resources.service.js';

@Public()
@Controller('public/resources')
export class PublicResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  listPublicResources() {
    return this.resourcesService.listPublicResources();
  }

  @Get(':id/download')
  getDownloadUrl(@Param('id') id: string) {
    return this.resourcesService.getDownloadUrl(id);
  }
}
