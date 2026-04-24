-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "IdentityProvider" AS ENUM ('GOOGLE', 'ZOHO', 'INTERNAL');
CREATE TYPE "RoleCode" AS ENUM ('SUPER_ADMIN', 'REGIONAL_MANAGER', 'AREA_MANAGER', 'COMMITTEE_MANAGER', 'COMMITTEE_SECRETARY', 'MEETING_EDITOR', 'CONTENT_EDITOR');
CREATE TYPE "ScopeType" AS ENUM ('GLOBAL', 'REGION', 'AREA', 'COMMITTEE');
CREATE TYPE "CommitteeLevel" AS ENUM ('REGIONAL', 'AREA');
CREATE TYPE "MeetingLanguage" AS ENUM ('ARABIC', 'ENGLISH', 'BILINGUAL');
CREATE TYPE "MeetingGender" AS ENUM ('MALE', 'FEMALE', 'MIXED');
CREATE TYPE "RecoveryMeetingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "InServiceMeetingStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'ARCHIVED');
CREATE TYPE "ContactSubmissionStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED');
CREATE TYPE "ReportType" AS ENUM ('MEETING_SUMMARY', 'ACTIVITY_REPORT', 'USER_ACTIVITY', 'AUDIT_TRAIL_EXTRACT', 'RESOURCE_USAGE');
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'GENERATING', 'READY', 'FAILED', 'ARCHIVED');
CREATE TYPE "AuditAction" AS ENUM ('CREATED', 'UPDATED', 'ARCHIVED', 'STATUS_CHANGED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'ACCESS_DENIED', 'LOGIN', 'CONTACT_SUBMITTED', 'REPORT_RUN');

CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "provider" "IdentityProvider" NOT NULL DEFAULT 'INTERNAL',
    "externalSubject" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "assignments" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "roleCode" "RoleCode" NOT NULL,
    "scopeType" "ScopeType" NOT NULL,
    "scopeId" TEXT,
    "scopeCode" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "activeFrom" TIMESTAMP(3),
    "activeUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "regions" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "areas" (
    "id" UUID NOT NULL,
    "regionId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "committees" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "level" "CommitteeLevel" NOT NULL,
    "regionId" UUID NOT NULL,
    "areaId" UUID,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "descriptionEn" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "committees_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recovery_meetings" (
    "id" UUID NOT NULL,
    "regionId" UUID NOT NULL,
    "areaId" UUID NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "descriptionEn" TEXT,
    "language" "MeetingLanguage" NOT NULL,
    "gender" "MeetingGender" NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT,
    "dayOfWeek" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "meetingLink" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "addressAr" TEXT,
    "addressEn" TEXT,
    "organizerName" TEXT,
    "organizerPhone" TEXT,
    "status" "RecoveryMeetingStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "recovery_meetings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "in_service_meetings" (
    "id" UUID NOT NULL,
    "committeeId" UUID NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "description" TEXT,
    "meetingDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT,
    "mom" TEXT NOT NULL,
    "plannedActivities" JSONB NOT NULL,
    "notes" TEXT,
    "status" "InServiceMeetingStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" UUID NOT NULL,
    "approvedById" UUID,
    "rejectionComments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "in_service_meetings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "resource_categories" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "resource_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "resources" (
    "id" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "descriptionEn" TEXT,
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "contact_submissions" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ContactSubmissionStatus" NOT NULL DEFAULT 'NEW',
    "internalNotes" TEXT,
    "assignedCommitteeCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "type" "ReportType" NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "approvalRequired" BOOLEAN NOT NULL DEFAULT false,
    "filters" JSONB NOT NULL,
    "filePath" TEXT,
    "createdById" UUID NOT NULL,
    "approvedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID,
    "userRoleSnapshot" TEXT,
    "action" "AuditAction" NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "method" TEXT,
    "path" TEXT,
    "ipAddress" TEXT,
    "correlationId" TEXT,
    "beforeState" JSONB,
    "afterState" JSONB,
    "metadata" JSONB,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "assignments_userId_active_idx" ON "assignments"("userId", "active");
CREATE INDEX "assignments_scopeType_scopeId_idx" ON "assignments"("scopeType", "scopeId");
CREATE UNIQUE INDEX "regions_code_key" ON "regions"("code");
CREATE UNIQUE INDEX "areas_code_key" ON "areas"("code");
CREATE INDEX "areas_regionId_isActive_idx" ON "areas"("regionId", "isActive");
CREATE UNIQUE INDEX "committees_code_key" ON "committees"("code");
CREATE INDEX "committees_regionId_areaId_isActive_idx" ON "committees"("regionId", "areaId", "isActive");
CREATE INDEX "recovery_meetings_status_areaId_city_dayOfWeek_idx" ON "recovery_meetings"("status", "areaId", "city", "dayOfWeek");
CREATE INDEX "recovery_meetings_latitude_longitude_idx" ON "recovery_meetings"("latitude", "longitude");
CREATE INDEX "in_service_meetings_committeeId_status_meetingDate_idx" ON "in_service_meetings"("committeeId", "status", "meetingDate");
CREATE UNIQUE INDEX "resource_categories_code_key" ON "resource_categories"("code");
CREATE INDEX "resources_isPublic_categoryId_idx" ON "resources"("isPublic", "categoryId");
CREATE INDEX "contact_submissions_status_createdAt_idx" ON "contact_submissions"("status", "createdAt");
CREATE INDEX "reports_status_type_createdById_idx" ON "reports"("status", "type", "createdById");
CREATE INDEX "audit_logs_timestamp_action_idx" ON "audit_logs"("timestamp", "action");
CREATE INDEX "audit_logs_resourceType_resourceId_idx" ON "audit_logs"("resourceType", "resourceId");

ALTER TABLE "assignments" ADD CONSTRAINT "assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "areas" ADD CONSTRAINT "areas_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "committees" ADD CONSTRAINT "committees_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "committees" ADD CONSTRAINT "committees_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "recovery_meetings" ADD CONSTRAINT "recovery_meetings_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "recovery_meetings" ADD CONSTRAINT "recovery_meetings_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "recovery_meetings" ADD CONSTRAINT "recovery_meetings_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "in_service_meetings" ADD CONSTRAINT "in_service_meetings_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "committees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "in_service_meetings" ADD CONSTRAINT "in_service_meetings_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "in_service_meetings" ADD CONSTRAINT "in_service_meetings_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "resources" ADD CONSTRAINT "resources_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "resource_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reports" ADD CONSTRAINT "reports_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reports" ADD CONSTRAINT "reports_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs are immutable';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_logs_no_update
BEFORE UPDATE ON "audit_logs"
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_log_mutation();

CREATE TRIGGER audit_logs_no_delete
BEFORE DELETE ON "audit_logs"
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_log_mutation();
