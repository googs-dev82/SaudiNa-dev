import { Controller, Get, Param, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import type { CurrentUserContext } from '../../common/types/request-context.type.js';
import { ListAdminEventsQueryDto } from './events.dto.js';
import { EventsService } from './events.service.js';

@Roles(
  'SUPER_ADMIN',
  'REGIONAL_MANAGER',
  'AREA_MANAGER',
  'MEETING_EDITOR',
  'CONTENT_EDITOR',
)
@Controller('admin/events')
export class AdminEventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  list(
    @Query() query: ListAdminEventsQueryDto,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.eventsService.listAdminEvents(query, user);
  }

  @Get(':id/audit')
  audit(@Param('id') id: string, @CurrentUser() user: CurrentUserContext) {
    return this.eventsService.getAdminAudit(id, user);
  }
}
