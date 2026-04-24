-- SaudiNA Events domain schema

CREATE TYPE "EventVisibility" AS ENUM ('PUBLIC', 'PRIVATE');
CREATE TYPE "EventMode" AS ENUM ('PHYSICAL', 'ONLINE', 'HYBRID');
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PENDING_VALIDATION', 'TENTATIVE', 'CONFIRMED', 'PENDING_PUBLICATION', 'PUBLISHED', 'CANCELLED', 'RESCHEDULED', 'FAILED');
CREATE TYPE "EventPublicationStatusEnum" AS ENUM ('NOT_ELIGIBLE', 'ELIGIBLE', 'PUBLISHED', 'UNPUBLISHED', 'REJECTED');
CREATE TYPE "EventBookingRequestStatus" AS ENUM ('DRAFT', 'PENDING_VALIDATION', 'TENTATIVE', 'CONFIRMED', 'FAILED', 'CANCELLED', 'EXPIRED');
CREATE TYPE "EventHoldStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'RELEASED', 'CONSUMED');
CREATE TYPE "EventSlotStatus" AS ENUM ('FREE', 'HELD', 'BOOKED', 'RELEASED');
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'RETRYING');
CREATE TYPE "EventNotificationType" AS ENUM ('BOOKING_CONFIRMATION', 'BOOKING_FAILURE', 'REMINDER', 'CANCELLATION', 'RESCHEDULE', 'PUBLICATION', 'HOLD_EXPIRY');

CREATE TABLE "events" (
  "id" UUID NOT NULL,
  "regionId" UUID NOT NULL,
  "areaId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "visibility" "EventVisibility" NOT NULL DEFAULT 'PRIVATE',
  "mode" "EventMode" NOT NULL,
  "zoomEnabled" BOOLEAN NOT NULL DEFAULT false,
  "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
  "date" TIMESTAMP(3) NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT,
  "durationMinutes" INTEGER,
  "timezone" TEXT NOT NULL DEFAULT 'Asia/Riyadh',
  "invitationInstructions" TEXT,
  "organizerName" TEXT,
  "organizerUserId" UUID,
  "locationAddress" TEXT,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "meetingLink" TEXT,
  "createdById" UUID NOT NULL,
  "publishedAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "rescheduledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "event_booking_requests" (
  "id" UUID NOT NULL,
  "eventId" UUID NOT NULL,
  "requestedById" UUID NOT NULL,
  "slotId" UUID,
  "requestedStartAt" TIMESTAMP(3) NOT NULL,
  "requestedEndAt" TIMESTAMP(3) NOT NULL,
  "timezone" TEXT NOT NULL DEFAULT 'Asia/Riyadh',
  "status" "EventBookingRequestStatus" NOT NULL DEFAULT 'DRAFT',
  "idempotencyKey" TEXT NOT NULL,
  "failureReason" TEXT,
  "validatedAt" TIMESTAMP(3),
  "confirmedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "event_booking_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "event_slots" (
  "id" UUID NOT NULL,
  "eventId" UUID NOT NULL,
  "slotKey" TEXT NOT NULL,
  "slotStartAt" TIMESTAMP(3) NOT NULL,
  "slotEndAt" TIMESTAMP(3) NOT NULL,
  "timezone" TEXT NOT NULL DEFAULT 'Asia/Riyadh',
  "status" "EventSlotStatus" NOT NULL DEFAULT 'FREE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "event_slots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tentative_holds" (
  "id" UUID NOT NULL,
  "eventId" UUID NOT NULL,
  "bookingRequestId" UUID NOT NULL,
  "slotId" UUID NOT NULL,
  "holdToken" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "status" "EventHoldStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "tentative_holds_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "zoom_meetings" (
  "id" UUID NOT NULL,
  "eventId" UUID NOT NULL,
  "bookingRequestId" UUID NOT NULL,
  "slotId" UUID,
  "zoomMeetingId" TEXT NOT NULL,
  "joinUrl" TEXT NOT NULL,
  "hostUrl" TEXT,
  "startUrl" TEXT,
  "externalStatus" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "bookedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "cancelledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "zoom_meetings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "event_publication_status" (
  "id" UUID NOT NULL,
  "eventId" UUID NOT NULL,
  "status" "EventPublicationStatusEnum" NOT NULL DEFAULT 'NOT_ELIGIBLE',
  "eligibleAt" TIMESTAMP(3),
  "publishedAt" TIMESTAMP(3),
  "unpublishedAt" TIMESTAMP(3),
  "publishedById" UUID,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "event_publication_status_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "event_status_history" (
  "id" UUID NOT NULL,
  "eventId" UUID NOT NULL,
  "previousStatus" "EventStatus" NOT NULL,
  "newStatus" "EventStatus" NOT NULL,
  "changedById" UUID NOT NULL,
  "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reason" TEXT,
  "metadata" JSONB,
  CONSTRAINT "event_status_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notification_logs" (
  "id" UUID NOT NULL,
  "eventId" UUID NOT NULL,
  "bookingRequestId" UUID,
  "notificationType" "EventNotificationType" NOT NULL,
  "recipientEmail" TEXT NOT NULL,
  "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
  "providerMessageId" TEXT,
  "errorMessage" TEXT,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "event_audit_logs" (
  "id" UUID NOT NULL,
  "eventId" UUID NOT NULL,
  "actorUserId" UUID,
  "action" TEXT NOT NULL,
  "beforeState" JSONB,
  "afterState" JSONB,
  "source" TEXT,
  "correlationId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "event_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "events_visibility_status_date_startTime_idx" ON "events"("visibility", "status", "date", "startTime");
CREATE INDEX "events_regionId_areaId_status_date_idx" ON "events"("regionId", "areaId", "status", "date");

CREATE UNIQUE INDEX "event_booking_requests_slotId_key" ON "event_booking_requests"("slotId");
CREATE UNIQUE INDEX "event_booking_requests_idempotencyKey_key" ON "event_booking_requests"("idempotencyKey");
CREATE INDEX "event_booking_requests_eventId_status_idx" ON "event_booking_requests"("eventId", "status");
CREATE INDEX "event_booking_requests_requestedStartAt_requestedEndAt_idx" ON "event_booking_requests"("requestedStartAt", "requestedEndAt");

CREATE UNIQUE INDEX "event_slots_slotKey_key" ON "event_slots"("slotKey");
CREATE INDEX "event_slots_slotStartAt_slotEndAt_status_idx" ON "event_slots"("slotStartAt", "slotEndAt", "status");
CREATE INDEX "event_slots_eventId_status_idx" ON "event_slots"("eventId", "status");

CREATE UNIQUE INDEX "tentative_holds_bookingRequestId_key" ON "tentative_holds"("bookingRequestId");
CREATE UNIQUE INDEX "tentative_holds_slotId_key" ON "tentative_holds"("slotId");
CREATE UNIQUE INDEX "tentative_holds_holdToken_key" ON "tentative_holds"("holdToken");
CREATE INDEX "tentative_holds_expiresAt_status_idx" ON "tentative_holds"("expiresAt", "status");

CREATE UNIQUE INDEX "zoom_meetings_slotId_key" ON "zoom_meetings"("slotId");
CREATE UNIQUE INDEX "zoom_meetings_zoomMeetingId_key" ON "zoom_meetings"("zoomMeetingId");
CREATE UNIQUE INDEX "zoom_meetings_idempotencyKey_key" ON "zoom_meetings"("idempotencyKey");
CREATE INDEX "zoom_meetings_eventId_bookedAt_idx" ON "zoom_meetings"("eventId", "bookedAt");

CREATE UNIQUE INDEX "event_publication_status_eventId_key" ON "event_publication_status"("eventId");
CREATE INDEX "event_publication_status_status_publishedAt_idx" ON "event_publication_status"("status", "publishedAt");

CREATE INDEX "event_status_history_eventId_changedAt_idx" ON "event_status_history"("eventId", "changedAt");
CREATE INDEX "notification_logs_eventId_createdAt_idx" ON "notification_logs"("eventId", "createdAt");
CREATE INDEX "notification_logs_status_createdAt_idx" ON "notification_logs"("status", "createdAt");
CREATE INDEX "event_audit_logs_eventId_createdAt_idx" ON "event_audit_logs"("eventId", "createdAt");
CREATE INDEX "event_audit_logs_actorUserId_createdAt_idx" ON "event_audit_logs"("actorUserId", "createdAt");

ALTER TABLE "events" ADD CONSTRAINT "events_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "events_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "events_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "events_organizerUserId_fkey" FOREIGN KEY ("organizerUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "event_booking_requests" ADD CONSTRAINT "event_booking_requests_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_booking_requests" ADD CONSTRAINT "event_booking_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "event_booking_requests" ADD CONSTRAINT "event_booking_requests_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "event_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "event_slots" ADD CONSTRAINT "event_slots_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tentative_holds" ADD CONSTRAINT "tentative_holds_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tentative_holds" ADD CONSTRAINT "tentative_holds_bookingRequestId_fkey" FOREIGN KEY ("bookingRequestId") REFERENCES "event_booking_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tentative_holds" ADD CONSTRAINT "tentative_holds_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "event_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "zoom_meetings" ADD CONSTRAINT "zoom_meetings_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "zoom_meetings" ADD CONSTRAINT "zoom_meetings_bookingRequestId_fkey" FOREIGN KEY ("bookingRequestId") REFERENCES "event_booking_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "zoom_meetings" ADD CONSTRAINT "zoom_meetings_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "event_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "event_publication_status" ADD CONSTRAINT "event_publication_status_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_publication_status" ADD CONSTRAINT "event_publication_status_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "event_status_history" ADD CONSTRAINT "event_status_history_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_status_history" ADD CONSTRAINT "event_status_history_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_bookingRequestId_fkey" FOREIGN KEY ("bookingRequestId") REFERENCES "event_booking_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "event_audit_logs" ADD CONSTRAINT "event_audit_logs_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_audit_logs" ADD CONSTRAINT "event_audit_logs_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
