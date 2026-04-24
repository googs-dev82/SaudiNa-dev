import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';
import { RateLimit } from '../../common/decorators/rate-limit.decorator.js';
import { ListPublicEventsQueryDto } from './events.dto.js';
import { EventsService } from './events.service.js';

@Public()
@Controller('public/events')
export class PublicEventsController {
  constructor(private readonly eventsService: EventsService) {}

  @RateLimit({ limit: 60, windowMs: 60_000, key: 'ip' })
  @Get()
  list(@Query() query: ListPublicEventsQueryDto) {
    return this.eventsService.listPublicEvents(query);
  }

  @RateLimit({ limit: 60, windowMs: 60_000, key: 'ip' })
  @Get(':id')
  get(@Param('id') id: string) {
    return this.eventsService.getPublicEvent(id);
  }
}
