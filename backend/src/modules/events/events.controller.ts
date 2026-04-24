import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import type { CurrentUserContext } from '../../common/types/request-context.type.js';
import {
  CheckEventAvailabilityDto,
  ConfirmEventBookingDto,
  CreateEventBookingRequestDto,
  CreateEventDto,
  CreateTentativeHoldDto,
  RescheduleEventDto,
  SetEventVisibilityDto,
  UpdateEventDto,
} from './events.dto.js';
import { EventsService } from './events.service.js';

@Roles(
  'SUPER_ADMIN',
  'REGIONAL_MANAGER',
  'AREA_MANAGER',
  'MEETING_EDITOR',
  'CONTENT_EDITOR',
)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(
    @Body() input: CreateEventDto,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.eventsService.createEvent(input, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() input: UpdateEventDto,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.eventsService.updateEvent(id, input, user);
  }

  @Patch(':id/visibility')
  visibility(
    @Param('id') id: string,
    @Body() input: SetEventVisibilityDto,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.eventsService.setVisibility(id, input, user);
  }

  @Post(':id/bookings/check-availability')
  checkAvailability(
    @Param('id') id: string,
    @Body() input: CheckEventAvailabilityDto,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.eventsService.checkAvailability(id, input, user);
  }

  @Post(':id/bookings')
  createBookingRequest(
    @Param('id') id: string,
    @Body() input: CreateEventBookingRequestDto,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.eventsService.createBookingRequest(id, input, user);
  }

  @Post(':id/bookings/holds')
  createHold(
    @Param('id') id: string,
    @Body() input: CreateTentativeHoldDto,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.eventsService.createTentativeHold(id, input, user);
  }

  @Post(':id/bookings/confirm')
  confirmBooking(
    @Param('id') id: string,
    @Body() input: ConfirmEventBookingDto,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.eventsService.confirmZoomBooking(id, input, user);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string, @CurrentUser() user: CurrentUserContext) {
    return this.eventsService.publishEvent(id, user);
  }

  @Post(':id/unpublish')
  unpublish(@Param('id') id: string, @CurrentUser() user: CurrentUserContext) {
    return this.eventsService.unpublishEvent(id, user);
  }

  @Post(':id/cancel')
  cancel(
    @Param('id') id: string,
    @Body() input: { reason?: string },
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.eventsService.cancelEvent(id, user, input.reason);
  }

  @Post(':id/reschedule')
  reschedule(
    @Param('id') id: string,
    @Body() input: RescheduleEventDto,
    @CurrentUser() user: CurrentUserContext,
  ) {
    return this.eventsService.rescheduleEvent(id, input, user);
  }

  @Get('me')
  listMyEvents(@CurrentUser() user: CurrentUserContext) {
    return this.eventsService.listMyEvents(user);
  }

  @Get(':id')
  getEvent(@Param('id') id: string, @CurrentUser() user: CurrentUserContext) {
    return this.eventsService.getEvent(id, user);
  }
}
