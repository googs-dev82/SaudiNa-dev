import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';
import { RateLimit } from '../../common/decorators/rate-limit.decorator.js';
import { MeetingsService } from './meetings.service.js';
import {
  NearbyMeetingsQueryDto,
  PublicMeetingSearchQueryDto,
} from './meetings.dto.js';

@Public()
@Controller('public/meetings')
export class PublicMeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @RateLimit({ limit: 60, windowMs: 60_000, key: 'ip' })
  @Get()
  search(@Query() query: PublicMeetingSearchQueryDto) {
    return this.meetingsService.searchPublicMeetings(query);
  }

  @RateLimit({ limit: 60, windowMs: 60_000, key: 'ip' })
  @Get('map')
  map(@Query() query: PublicMeetingSearchQueryDto) {
    return this.meetingsService.searchMapMeetings(query);
  }

  @RateLimit({ limit: 60, windowMs: 60_000, key: 'ip' })
  @Get('nearby')
  nearby(@Query() query: NearbyMeetingsQueryDto) {
    return this.meetingsService.searchNearbyMeetings(query);
  }
}
