import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import {
  EVENT_MODES,
  EVENT_PUBLICATION_STATUSES,
  EVENT_STATUSES,
  EVENT_VISIBILITIES,
} from '../../common/domain.constants.js';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateEventDto {
  @IsUUID()
  regionId!: string;

  @IsUUID()
  areaId!: string;

  @IsString()
  @MinLength(2)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  date!: string;

  @Matches(TIME_PATTERN)
  startTime!: string;

  @IsOptional()
  @Matches(TIME_PATTERN)
  endTime?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(720)
  durationMinutes?: number;

  @IsIn(EVENT_MODES)
  mode!: (typeof EVENT_MODES)[number];

  @IsIn(EVENT_VISIBILITIES)
  visibility!: (typeof EVENT_VISIBILITIES)[number];

  @IsBoolean()
  zoomEnabled!: boolean;

  @IsOptional()
  @IsString()
  invitationInstructions?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  organizerName?: string;

  @IsOptional()
  @IsUUID()
  organizerUserId?: string;

  @IsOptional()
  @IsString()
  locationAddress?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  meetingLink?: string;
}

export class UpdateEventDto {
  @IsOptional()
  @IsUUID()
  regionId?: string;

  @IsOptional()
  @IsUUID()
  areaId?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @Matches(TIME_PATTERN)
  startTime?: string;

  @IsOptional()
  @Matches(TIME_PATTERN)
  endTime?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(720)
  durationMinutes?: number;

  @IsOptional()
  @IsIn(EVENT_MODES)
  mode?: (typeof EVENT_MODES)[number];

  @IsOptional()
  @IsIn(EVENT_VISIBILITIES)
  visibility?: (typeof EVENT_VISIBILITIES)[number];

  @IsOptional()
  @IsBoolean()
  zoomEnabled?: boolean;

  @IsOptional()
  @IsString()
  invitationInstructions?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  organizerName?: string;

  @IsOptional()
  @IsUUID()
  organizerUserId?: string;

  @IsOptional()
  @IsString()
  locationAddress?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  meetingLink?: string;

  @IsOptional()
  @IsIn(EVENT_STATUSES)
  status?: (typeof EVENT_STATUSES)[number];
}

export class SetEventVisibilityDto {
  @IsIn(EVENT_VISIBILITIES)
  visibility!: (typeof EVENT_VISIBILITIES)[number];
}

export class CheckEventAvailabilityDto {
  @IsISO8601()
  requestedStartAt!: string;

  @IsISO8601()
  requestedEndAt!: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}

export class CreateEventBookingRequestDto extends CheckEventAvailabilityDto {
  @IsBoolean()
  zoomEnabled!: boolean;
}

export class CreateTentativeHoldDto extends CheckEventAvailabilityDto {
  @IsString()
  @MinLength(8)
  idempotencyKey!: string;
}

export class ConfirmEventBookingDto {
  @IsUUID()
  holdId!: string;

  @IsString()
  @MinLength(8)
  idempotencyKey!: string;
}

export class RescheduleEventDto extends CheckEventAvailabilityDto {
  @IsString()
  @MinLength(8)
  idempotencyKey!: string;
}

export class ListPublicEventsQueryDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsUUID()
  regionId?: string;

  @IsOptional()
  @IsUUID()
  areaId?: string;

  @IsOptional()
  @IsIn(EVENT_MODES)
  mode?: (typeof EVENT_MODES)[number];

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;
}

export class ListAdminEventsQueryDto extends ListPublicEventsQueryDto {
  @IsOptional()
  @IsIn(EVENT_VISIBILITIES)
  visibility?: (typeof EVENT_VISIBILITIES)[number];

  @IsOptional()
  @IsIn(EVENT_STATUSES)
  status?: (typeof EVENT_STATUSES)[number];

  @IsOptional()
  @IsIn(EVENT_PUBLICATION_STATUSES)
  publicationStatus?: (typeof EVENT_PUBLICATION_STATUSES)[number];

  @IsOptional()
  @IsUUID()
  creatorId?: string;
}
