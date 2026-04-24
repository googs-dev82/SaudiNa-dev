import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import type { CurrentUserContext } from '../../common/types/request-context.type.js';
import { CreateReportDto } from './reports.dto.js';
import { ReportsService } from './reports.service.js';

@Roles('SUPER_ADMIN', 'REGIONAL_MANAGER', 'AREA_MANAGER')
@Controller('admin/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  listReports(@CurrentUser() user: CurrentUserContext) {
    return this.reportsService.listReports(user);
  }

  @Post()
  createReport(
    @Body() input: CreateReportDto,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.reportsService.createReport(input, user);
  }

  @Post(':id/submit')
  submitReport(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.reportsService.submitReport(id, user);
  }

  @Post(':id/approve')
  approveReport(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.reportsService.approveReport(id, user);
  }

  @Post(':id/run')
  runReport(@Param('id') id: string, @CurrentUser() user: CurrentUserContext) {
    return this.reportsService.runReport(id, user);
  }

  @Get(':id/download')
  getDownloadUrl(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.reportsService.getDownloadUrl(id, user);
  }
}
