export type Locale = "ar" | "en";

export interface RegionDto {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
}

export interface AreaDto {
  id: string;
  regionId: string;
  code: string;
  nameAr: string;
  nameEn: string;
}

export interface MeetingDto {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  city: string;
  district?: string | null;
  dayOfWeek: string;
  startTime: string;
  endTime?: string | null;
  gender?: string | null;
  language?: string | null;
  isOnline?: boolean;
  meetingLink?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  addressAr?: string | null;
  addressEn?: string | null;
}

export interface MeetingsResponseDto {
  items: MeetingDto[];
  nextCursor: string | null;
}

export interface ResourceCategoryDto {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
}

export interface ResourceDto {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  isPublic: boolean;
  downloadCount: number;
  category: ResourceCategoryDto;
}

export interface ContactSubmissionDto {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ChatbotRequestDto {
  message: string;
  locale: Locale;
  areaId?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}

export interface ChatbotMeetingDto {
  id: string;
  nameAr: string;
  nameEn: string;
  city: string;
  district?: string | null;
  dayOfWeek: string;
  startTime: string;
  endTime?: string | null;
  gender?: string | null;
  language?: string | null;
  isOnline?: boolean;
  meetingLink?: string | null;
  addressAr?: string | null;
  addressEn?: string | null;
  googleMapsLink?: string | null;
}

export interface ChatbotSourceDto {
  type: "faq";
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
  locale: Locale;
  type: "faq" | "meeting-results" | "clarification" | "fallback";
  intent: "content_qna" | "meeting_search" | "clarification_needed" | "fallback";
  confidence: number;
  message: string;
  clarificationNeeded?: boolean;
  filtersApplied?: ChatbotFiltersDto;
  meetings?: ChatbotMeetingDto[];
  sources?: ChatbotSourceDto[];
  followUpSuggestions?: string[];
}

export type EventVisibility = "PUBLIC" | "PRIVATE";
export type EventMode = "PHYSICAL" | "ONLINE" | "HYBRID";
export type EventStatus =
  | "DRAFT"
  | "PENDING_VALIDATION"
  | "TENTATIVE"
  | "CONFIRMED"
  | "PENDING_PUBLICATION"
  | "PUBLISHED"
  | "CANCELLED"
  | "RESCHEDULED"
  | "FAILED";
export type EventPublicationStatus =
  | "NOT_ELIGIBLE"
  | "ELIGIBLE"
  | "PUBLISHED"
  | "UNPUBLISHED"
  | "REJECTED";

export interface EventRegionSummaryDto {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
}

export interface EventAreaSummaryDto {
  id: string;
  regionId: string;
  code: string;
  nameAr: string;
  nameEn: string;
}

export interface PublicEventDto {
  id: string;
  title: string;
  description?: string | null;
  visibility: EventVisibility;
  mode: EventMode;
  status: EventStatus;
  date: string;
  startTime: string;
  endTime?: string | null;
  durationMinutes?: number | null;
  timezone: string;
  zoomEnabled: boolean;
  regionId: string;
  areaId: string;
  regions?: EventRegionSummaryDto | null;
  areas?: EventAreaSummaryDto | null;
  invitationInstructions?: string | null;
  locationAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  meetingLink?: string | null;
  publicationStatus?: EventPublicationStatus | null;
}

export interface EventAuditLogDto {
  id: string;
  eventId: string;
  actorUserId?: string | null;
  action: string;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  source?: string | null;
  correlationId?: string | null;
  createdAt: string;
}
