import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Delete,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { AreasService } from './areas.service.js';
import { CreateAreaDto, UpdateAreaDto } from './areas.dto.js';

@Controller()
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Public()
  @Get('public/areas')
  listPublicAreas(@Query('regionId') regionId?: string) {
    return this.areasService.listPublicAreas(regionId);
  }

  @Roles('SUPER_ADMIN')
  @Get('admin/areas')
  listAreas() {
    return this.areasService.listAreas();
  }

  @Roles('SUPER_ADMIN')
  @Post('admin/areas')
  createArea(@Body() input: CreateAreaDto) {
    return this.areasService.createArea(input);
  }

  @Roles('SUPER_ADMIN')
  @Get('admin/areas/:id')
  getArea(@Param('id') id: string) {
    return this.areasService.getArea(id);
  }

  @Roles('SUPER_ADMIN')
  @Patch('admin/areas/:id')
  updateArea(@Param('id') id: string, @Body() input: UpdateAreaDto) {
    return this.areasService.updateArea(id, input);
  }

  @Roles('SUPER_ADMIN')
  @Delete('admin/areas/:id')
  deleteArea(@Param('id') id: string) {
    return this.areasService.deleteArea(id);
  }
}
