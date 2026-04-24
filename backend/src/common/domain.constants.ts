export const ROLE_CODES = [
  'SUPER_ADMIN',
  'REGIONAL_MANAGER',
  'AREA_MANAGER',
  'COMMITTEE_MANAGER',
  'COMMITTEE_SECRETARY',
  'MEETING_EDITOR',
  'CONTENT_EDITOR',
] as const;

export const SCOPE_TYPES = ['GLOBAL', 'REGION', 'AREA', 'COMMITTEE'] as const;
export const COMMITTEE_LEVELS = ['REGIONAL', 'AREA'] as const;
export const MEETING_LANGUAGES = ['ARABIC', 'ENGLISH', 'BILINGUAL'] as const;
export const MEETING_GENDERS = ['MALE', 'FEMALE', 'MIXED'] as const;
export const RECOVERY_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export const IN_SERVICE_STATUSES = [
  'DRAFT',
  'PENDING',
  'APPROVED',
  'ARCHIVED',
] as const;
export const CONTACT_STATUSES = ['NEW', 'IN_PROGRESS', 'RESOLVED'] as const;
export const REPORT_TYPES = [
  'MEETING_SUMMARY',
  'ACTIVITY_REPORT',
  'USER_ACTIVITY',
  'AUDIT_TRAIL_EXTRACT',
  'RESOURCE_USAGE',
] as const;
export const REPORT_STATUSES = [
  'DRAFT',
  'PENDING',
  'APPROVED',
  'GENERATING',
  'READY',
  'FAILED',
  'ARCHIVED',
] as const;
export const EVENT_VISIBILITIES = ['PUBLIC', 'PRIVATE'] as const;
export const EVENT_MODES = ['PHYSICAL', 'ONLINE', 'HYBRID'] as const;
export const EVENT_STATUSES = [
  'DRAFT',
  'PENDING_VALIDATION',
  'TENTATIVE',
  'CONFIRMED',
  'PENDING_PUBLICATION',
  'PUBLISHED',
  'CANCELLED',
  'RESCHEDULED',
  'FAILED',
] as const;
export const EVENT_PUBLICATION_STATUSES = [
  'NOT_ELIGIBLE',
  'ELIGIBLE',
  'PUBLISHED',
  'UNPUBLISHED',
  'REJECTED',
] as const;
export const EVENT_BOOKING_REQUEST_STATUSES = [
  'DRAFT',
  'PENDING_VALIDATION',
  'TENTATIVE',
  'CONFIRMED',
  'FAILED',
  'CANCELLED',
  'EXPIRED',
] as const;
export const EVENT_SLOT_STATUSES = [
  'FREE',
  'HELD',
  'BOOKED',
  'RELEASED',
] as const;
export const EVENT_HOLD_STATUSES = [
  'ACTIVE',
  'EXPIRED',
  'RELEASED',
  'CONSUMED',
] as const;
export const NOTIFICATION_STATUSES = [
  'PENDING',
  'SENT',
  'FAILED',
  'RETRYING',
] as const;
export const EVENT_NOTIFICATION_TYPES = [
  'BOOKING_CONFIRMATION',
  'BOOKING_FAILURE',
  'REMINDER',
  'CANCELLATION',
  'RESCHEDULE',
  'PUBLICATION',
  'HOLD_EXPIRY',
] as const;
export const IDENTITY_PROVIDERS = ['GOOGLE', 'ZOHO', 'INTERNAL'] as const;

export type RoleCode = (typeof ROLE_CODES)[number];
export type ScopeType = (typeof SCOPE_TYPES)[number];
export type RecoveryStatus = (typeof RECOVERY_STATUSES)[number];
export type InServiceStatus = (typeof IN_SERVICE_STATUSES)[number];
export type ReportStatus = (typeof REPORT_STATUSES)[number];
export type EventVisibility = (typeof EVENT_VISIBILITIES)[number];
export type EventMode = (typeof EVENT_MODES)[number];
export type EventStatus = (typeof EVENT_STATUSES)[number];
export type EventPublicationStatus =
  (typeof EVENT_PUBLICATION_STATUSES)[number];
export type EventBookingRequestStatus =
  (typeof EVENT_BOOKING_REQUEST_STATUSES)[number];
export type EventSlotStatus = (typeof EVENT_SLOT_STATUSES)[number];
export type EventHoldStatus = (typeof EVENT_HOLD_STATUSES)[number];
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];
export type EventNotificationType = (typeof EVENT_NOTIFICATION_TYPES)[number];
