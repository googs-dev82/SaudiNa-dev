import {
  IsIn,
  MaxLength,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class ChatbotQueryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  message!: string;

  @IsIn(['ar', 'en'])
  locale!: 'ar' | 'en';

  @IsOptional()
  @IsUUID()
  areaId?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  radiusKm?: number;
}

export interface SanitizedChatbotMeetingDto {
  id: string;
  nameEn: string;
  nameAr: string;
  city: string;
  district: string | null;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isOnline: boolean;
  language: string;
  gender: string;
  meetingLink: string | null;
  addressEn: string | null;
  addressAr: string | null;
  googleMapsLink: string | null;
}

export interface ChatbotSourceDto {
  type: 'faq';
  id?: string;
  title?: string;
}

export interface ChatbotFiltersDto {
  city?: string;
  dayOfWeek?: string;
  language?: string;
  gender?: string;
  isOnline?: boolean;
  nearMe?: boolean;
}

export interface ChatbotResponseDto {
  locale: 'ar' | 'en';
  type: 'faq' | 'meeting-results' | 'clarification' | 'fallback';
  intent:
    | 'content_qna'
    | 'meeting_search'
    | 'clarification_needed'
    | 'fallback';
  confidence: number;
  message: string;
  clarificationNeeded?: boolean;
  filtersApplied?: ChatbotFiltersDto;
  meetings?: SanitizedChatbotMeetingDto[];
  sources?: ChatbotSourceDto[];
  followUpSuggestions?: string[];
}
