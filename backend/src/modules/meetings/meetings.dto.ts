import {
  IsArray,
  IsBoolean,
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
  IN_SERVICE_STATUSES,
  MEETING_GENDERS,
  MEETING_LANGUAGES,
  RECOVERY_STATUSES,
} from '../../common/domain.constants.js';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const IN_SERVICE_MEETING_FORMATS = ['PHYSICAL', 'ZOOM'] as const;

export class CreateRecoveryMeetingDto {
  @IsUUID()
  regionId!: string;

  @IsUUID()
  areaId!: string;

  @IsString()
  @MinLength(2)
  nameAr!: string;

  @IsString()
  @MinLength(2)
  nameEn!: string;

  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsIn(MEETING_LANGUAGES)
  language!: (typeof MEETING_LANGUAGES)[number];

  @IsIn(MEETING_GENDERS)
  gender!: (typeof MEETING_GENDERS)[number];

  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsString()
  dayOfWeek!: string;

  @Matches(TIME_PATTERN)
  startTime!: string;

  @IsOptional()
  @Matches(TIME_PATTERN)
  endTime?: string;

  @IsBoolean()
  isOnline!: boolean;

  @IsOptional()
  @IsString()
  meetingLink?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  addressAr?: string;

  @IsOptional()
  @IsString()
  addressEn?: string;
}

export class UpdateRecoveryMeetingDto extends CreateRecoveryMeetingDto {}

export class CreateInServiceMeetingDto {
  @IsUUID()
  committeeId!: string;

  @IsIn(IN_SERVICE_MEETING_FORMATS)
  meetingFormat!: (typeof IN_SERVICE_MEETING_FORMATS)[number];

  @IsString()
  @MinLength(2)
  titleAr!: string;

  @IsString()
  @MinLength(2)
  titleEn!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsISO8601()
  meetingDate!: string;

  @Matches(TIME_PATTERN)
  startTime!: string;

  @IsOptional()
  @Matches(TIME_PATTERN)
  endTime?: string;

  @IsOptional()
  @IsString()
  venueName?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  zoomJoinUrl?: string;

  @IsOptional()
  @IsString()
  zoomMeetingId?: string;

  @IsOptional()
  @IsString()
  zoomPasscode?: string;

  @IsString()
  @MinLength(10)
  mom!: string;

  @IsArray()
  plannedActivities!: Array<Record<string, unknown>>;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInServiceMeetingDto extends CreateInServiceMeetingDto {}

export class RejectInServiceMeetingDto {
  @IsString()
  @MinLength(10)
  comments!: string;
}

export class PublicMeetingSearchQueryDto {
  @IsOptional()
  @IsUUID()
  areaId?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  dayOfWeek?: string;

  @IsOptional()
  @IsIn(MEETING_GENDERS)
  gender?: (typeof MEETING_GENDERS)[number];

  @IsOptional()
  @IsIn(MEETING_LANGUAGES)
  language?: (typeof MEETING_LANGUAGES)[number];

  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsNumber()
  north?: number;

  @IsOptional()
  @IsNumber()
  south?: number;

  @IsOptional()
  @IsNumber()
  east?: number;

  @IsOptional()
  @IsNumber()
  west?: number;
}

export class NearbyMeetingsQueryDto extends PublicMeetingSearchQueryDto {
  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsNumber()
  @Min(1)
  @Max(50)
  radiusKm!: number;
}

export class AdminMeetingsQueryDto {
  @IsOptional()
  @IsIn(RECOVERY_STATUSES)
  recoveryStatus?: (typeof RECOVERY_STATUSES)[number];

  @IsOptional()
  @IsIn(IN_SERVICE_STATUSES)
  inServiceStatus?: (typeof IN_SERVICE_STATUSES)[number];
}
