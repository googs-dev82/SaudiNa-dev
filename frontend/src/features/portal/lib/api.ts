import "server-only";

import { env } from "@/config/env";
import type { PortalUser } from "@/types/portal";
import { getPortalToken } from "./session";

export interface PortalRecoveryMeeting {
  id: string;
  regionId: string;
  areaId: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  language: string;
  gender: string;
  city: string;
  district?: string | null;
  dayOfWeek: string;
  startTime: string;
  endTime?: string | null;
  isOnline: boolean;
  meetingLink?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  addressAr?: string | null;
  addressEn?: string | null;
  status: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortalInServiceMeeting {
  id: string;
  committeeId: string;
  titleAr: string;
  titleEn: string;
  description?: string | null;
  meetingDate: string;
  startTime: string;
  endTime?: string | null;
  mom: string;
  attendeesCount?: number | null;
  notes?: string | null;
  plannedActivities: Array<Record<string, unknown>>;
  status: string;
  createdById: string;
  approvedById?: string | null;
  rejectionComments?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PortalReport {
  id: string;
  type: string;
  filters: Record<string, unknown> | null;
  approvalRequired: boolean;
  status: string;
  filePath?: string | null;
  createdById: string;
  approvedById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PortalResourceCategory {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
}

export interface PortalResource {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  filePath: string;
  mimeType: string;
  sizeBytes: number;
  downloadCount: number;
  isPublic: boolean;
  resourceCategoryId: string;
  resource_categories?: PortalResourceCategory | null;
  createdAt: string;
  updatedAt: string;
}

export interface PortalContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  internalNotes?: string | null;
  assignedCommitteeCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortalAuditLog {
  id: string;
  timestamp: string;
  userId?: string | null;
  userRoleSnapshot?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  method?: string | null;
  path?: string | null;
  ipAddress?: string | null;
  correlationId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface PortalEventNotificationLog {
  id: string;
  eventId: string;
  bookingRequestId?: string | null;
  notificationType: string;
  recipientEmail: string;
  status: string;
  providerMessageId?: string | null;
  errorMessage?: string | null;
  sentAt?: string | null;
  createdAt: string;
}

export interface PortalAdminUser {
  id: string;
  email: string;
  displayName: string;
  status: string;
  provider: string;
  externalSubject?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
}

export interface PortalGovernanceUser extends PortalAdminUser {
  _count: {
    assignments: number;
    recovery_meetings: number;
    in_service_meetings_in_service_meetings_createdByIdTousers: number;
    in_service_meetings_in_service_meetings_approvedByIdTousers: number;
    reports_reports_createdByIdTousers: number;
    reports_reports_approvedByIdTousers: number;
  };
}

export interface PortalAdminAssignment {
  id: string;
  userId: string;
  roleCode: string;
  scopeType: string;
  scopeId?: string | null;
  scopeCode?: string | null;
  activeFrom?: string | null;
  activeUntil?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PortalRegion {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PortalArea {
  id: string;
  regionId: string;
  code: string;
  nameAr: string;
  nameEn: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PortalCommittee {
  id: string;
  code: string;
  level: string;
  regionId: string;
  areaId?: string | null;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PortalEventPublicationStatus {
  id: string;
  eventId: string;
  status: string;
  eligibleAt?: string | null;
  publishedAt?: string | null;
  unpublishedAt?: string | null;
  publishedById?: string | null;
  notes?: string | null;
}

export interface PortalEventAuditLog {
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

export interface PortalEventZoomMeeting {
  id: string;
  eventId: string;
  bookingRequestId: string;
  zoomMeetingId: string;
  joinUrl: string;
  hostUrl?: string | null;
  startUrl?: string | null;
  externalStatus: string;
  idempotencyKey: string;
  bookedAt: string;
  cancelledAt?: string | null;
}

export interface PortalEventBookingRequest {
  id: string;
  eventId: string;
  requestedById: string;
  slotId?: string | null;
  requestedStartAt: string;
  requestedEndAt: string;
  timezone: string;
  status: string;
  idempotencyKey: string;
  failureReason?: string | null;
  validatedAt?: string | null;
  confirmedAt?: string | null;
  tentativeHolds?: Array<{
    id: string;
    eventId: string;
    bookingRequestId: string;
    slotId: string;
    holdToken: string;
    expiresAt: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }> | null;
  createdAt: string;
  updatedAt: string;
  zoomMeetings?: PortalEventZoomMeeting[] | null;
}

export interface PortalEvent {
  id: string;
  regionId: string;
  areaId: string;
  regions?: PortalRegion | null;
  areas?: PortalArea | null;
  title: string;
  description?: string | null;
  visibility: string;
  mode: string;
  zoomEnabled: boolean;
  status: string;
  date: string;
  startTime: string;
  endTime?: string | null;
  durationMinutes?: number | null;
  timezone: string;
  invitationInstructions?: string | null;
  organizerName?: string | null;
  organizerUserId?: string | null;
  creator?: PortalAdminUser | null;
  organizer?: PortalAdminUser | null;
  locationAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  meetingLink?: string | null;
  createdById: string;
  publishedAt?: string | null;
  cancelledAt?: string | null;
  rescheduledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  publicationStatus?: PortalEventPublicationStatus | null;
  bookingRequests?: PortalEventBookingRequest[] | null;
  notificationLogs?: PortalEventNotificationLog[] | null;
  auditLogs?: PortalEventAuditLog[] | null;
}

export class PortalApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function portalApiFetch<T>(path: string): Promise<T> {
  const token = await getPortalToken();

  if (!env.apiBaseUrl || !token) {
    throw new PortalApiError("Missing portal API configuration.", 500);
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  }).catch(() => null);

  if (!response) {
    throw new PortalApiError("Unable to reach the backend API.", 503);
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    throw new PortalApiError(
      payload?.message ?? "Backend request failed.",
      response.status,
    );
  }

  return (await response.json()) as T;
}

type PortalEventRecord = PortalEvent & {
  users_events_createdByIdTousers?: PortalAdminUser | null;
  users_events_organizedByUserIdTousers?: PortalAdminUser | null;
};

function normalizePortalEvent(event: PortalEventRecord): PortalEvent {
  const { users_events_createdByIdTousers, users_events_organizedByUserIdTousers, ...rest } = event;

  return {
    ...rest,
    creator: rest.creator ?? users_events_createdByIdTousers ?? null,
    organizer: rest.organizer ?? users_events_organizedByUserIdTousers ?? null,
  };
}

export function getPortalProfile() {
  return portalApiFetch<PortalUser>("/api/v1/auth/me");
}

export function getPortalRecoveryMeetings() {
  return portalApiFetch<PortalRecoveryMeeting[]>("/api/v1/admin/meetings/recovery");
}

export function getPortalInServiceMeetings() {
  return portalApiFetch<PortalInServiceMeeting[]>("/api/v1/admin/meetings/in-service");
}

export function getPortalReports() {
  return portalApiFetch<PortalReport[]>("/api/v1/admin/reports");
}

export function getPortalResources() {
  return portalApiFetch<PortalResource[]>("/api/v1/admin/resources");
}

export function getPortalResourceCategories() {
  return portalApiFetch<PortalResourceCategory[]>("/api/v1/admin/resource-categories");
}

export function getPortalContactSubmissions() {
  return portalApiFetch<PortalContactSubmission[]>("/api/v1/admin/contact");
}

export function getPortalAuditLogs() {
  return portalApiFetch<PortalAuditLog[]>("/api/v1/admin/audit-logs");
}

export function getPortalEvents() {
  return portalApiFetch<PortalEventRecord[]>("/api/v1/admin/events").then((events) =>
    events.map((event) => normalizePortalEvent(event)),
  );
}

export function getPortalMyEvents() {
  return portalApiFetch<PortalEventRecord[]>("/api/v1/events/me").then((events) =>
    events.map((event) => normalizePortalEvent(event)),
  );
}

export function getPortalEvent(id: string) {
  return portalApiFetch<PortalEventRecord>(`/api/v1/events/${id}`).then((event) =>
    normalizePortalEvent(event),
  );
}

export function getPortalEventAudit(id: string) {
  return portalApiFetch<PortalEventAuditLog[]>(`/api/v1/admin/events/${id}/audit`);
}

export function getPortalUsers() {
  return portalApiFetch<PortalAdminUser[]>("/api/v1/users");
}

export function getPortalUser(userId: string) {
  return portalApiFetch<PortalGovernanceUser>(`/api/v1/users/${userId}`);
}

export function getPortalAssignments() {
  return portalApiFetch<PortalAdminAssignment[]>("/api/v1/admin/assignments");
}

export function getPortalRegions() {
  return portalApiFetch<PortalRegion[]>("/api/v1/admin/regions");
}

export function getPortalAreas() {
  return portalApiFetch<PortalArea[]>("/api/v1/admin/areas");
}

export function getPortalCommittees() {
  return portalApiFetch<PortalCommittee[]>("/api/v1/admin/committees");
}

export function getPortalRegion(id: string) {
  return portalApiFetch<PortalRegion>(`/api/v1/admin/regions/${id}`);
}

export function getPortalArea(id: string) {
  return portalApiFetch<PortalArea>(`/api/v1/admin/areas/${id}`);
}

export function getPortalCommittee(id: string) {
  return portalApiFetch<PortalCommittee>(`/api/v1/admin/committees/${id}`);
}

export function getPortalAssignment(id: string) {
  return portalApiFetch<PortalAdminAssignment>(`/api/v1/admin/assignments/${id}`);
}
