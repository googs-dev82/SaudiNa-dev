import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RegionsService } from './regions.service.js';
import { CreateRegionDto, UpdateRegionDto } from './regions.dto.js';

@Controller()
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Public()
  @Get('public/regions')
  listPublicRegions() {
    return this.regionsService.listPublicRegions();
  }

  @Roles('SUPER_ADMIN')
  @Get('admin/regions')
  listRegions() {
    return this.regionsService.listRegions();
  }

  @Roles('SUPER_ADMIN')
  @Post('admin/regions')
  createRegion(@Body() input: CreateRegionDto) {
    return this.regionsService.createRegion(input);
  }

  @Roles('SUPER_ADMIN')
  @Get('admin/regions/:id')
  getRegion(@Param('id') id: string) {
    return this.regionsService.getRegion(id);
  }

  @Roles('SUPER_ADMIN')
  @Patch('admin/regions/:id')
  updateRegion(@Param('id') id: string, @Body() input: UpdateRegionDto) {
    return this.regionsService.updateRegion(id, input);
  }

  @Roles('SUPER_ADMIN')
  @Delete('admin/regions/:id')
  deleteRegion(@Param('id') id: string) {
    return this.regionsService.deleteRegion(id);
  }
}
