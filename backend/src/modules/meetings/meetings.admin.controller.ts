import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import type { CurrentUserContext } from '../../common/types/request-context.type.js';
import {
  CreateInServiceMeetingDto,
  CreateRecoveryMeetingDto,
  RejectInServiceMeetingDto,
  UpdateInServiceMeetingDto,
  UpdateRecoveryMeetingDto,
} from './meetings.dto.js';
import { MeetingsService } from './meetings.service.js';

@Controller('admin/meetings')
export class AdminMeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Roles('SUPER_ADMIN', 'MEETING_EDITOR')
  @Post('recovery')
  createRecovery(
    @Body() input: CreateRecoveryMeetingDto,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.meetingsService.createRecoveryMeeting(input, user);
  }

  @Roles('SUPER_ADMIN', 'MEETING_EDITOR')
  @Patch('recovery/:id')
  updateRecovery(
    @Param('id') id: string,
    @Body() input: UpdateRecoveryMeetingDto,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.meetingsService.updateRecoveryMeeting(id, input, user);
  }

  @Roles('SUPER_ADMIN', 'MEETING_EDITOR')
  @Post('recovery/:id/publish')
  publishRecovery(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.meetingsService.publishRecoveryMeeting(id, user);
  }

  @Roles('SUPER_ADMIN', 'MEETING_EDITOR')
  @Post('recovery/:id/unpublish')
  unpublishRecovery(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.meetingsService.unpublishRecoveryMeeting(id, user);
  }

  @Roles('SUPER_ADMIN', 'MEETING_EDITOR')
  @Post('recovery/:id/archive')
  archiveRecovery(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.meetingsService.archiveRecoveryMeeting(id, user);
  }

  @Roles('SUPER_ADMIN', 'MEETING_EDITOR')
  @Delete('recovery/:id')
  deleteRecovery(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.meetingsService.deleteRecoveryMeeting(id, user);
  }

  @Roles('SUPER_ADMIN', 'COMMITTEE_SECRETARY')
  @Post('in-service')
  createInService(
    @Body() input: CreateInServiceMeetingDto,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.meetingsService.createInServiceMeeting(input, user);
  }

  @Roles('SUPER_ADMIN', 'COMMITTEE_SECRETARY')
  @Patch('in-service/:id')
  updateInService(
    @Param('id') id: string,
    @Body() input: UpdateInServiceMeetingDto,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.meetingsService.updateInServiceMeeting(id, input, user);
  }

  @Roles('SUPER_ADMIN', 'COMMITTEE_SECRETARY')
  @Post('in-service/:id/submit')
  submitInService(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.meetingsService.submitInServiceMeeting(id, user);
  }

  @Roles('SUPER_ADMIN', 'COMMITTEE_MANAGER')
  @Post('in-service/:id/approve')
  approveInService(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.meetingsService.approveInServiceMeeting(id, user);
  }

  @Roles('SUPER_ADMIN', 'COMMITTEE_MANAGER')
  @Post('in-service/:id/reject')
  rejectInService(
    @Param('id') id: string,
    @Body() input: RejectInServiceMeetingDto,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.meetingsService.rejectInServiceMeeting(id, input, user);
  }

  @Roles('SUPER_ADMIN', 'MEETING_EDITOR')
  @Get('recovery')
  listRecovery(@CurrentUser() user: CurrentUserContext) {
    return this.meetingsService.listAdminRecoveryMeetings(user);
  }

  @Roles('SUPER_ADMIN', 'COMMITTEE_SECRETARY', 'COMMITTEE_MANAGER')
  @Get('in-service')
  listInService(@CurrentUser() user: CurrentUserContext) {
    return this.meetingsService.listAdminInServiceMeetings(user);
  }
}
