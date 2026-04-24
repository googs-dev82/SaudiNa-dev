import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import type { CurrentUserContext } from '../../common/types/request-context.type.js';
import { CreateResourceDto, InitResourceUploadDto } from './resources.dto.js';
import { ResourcesService } from './resources.service.js';

@Roles('SUPER_ADMIN', 'CONTENT_EDITOR')
@Controller('admin/resources')
export class AdminResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  listAdminResources(@CurrentUser() user: CurrentUserContext) {
    return this.resourcesService.listAdminResources(user);
  }

  @Post()
  createResource(
    @Body() input: CreateResourceDto,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.resourcesService.createResource(input, user.id, user.roles);
  }

  @Post('upload-init')
  initUpload(@Body() input: InitResourceUploadDto) {
    return this.resourcesService.initUpload(input);
  }
}
