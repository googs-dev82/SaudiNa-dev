-- SaudiNA Operational Database Schema
-- Migration: 20260405_operational_schema
-- Purpose: Production-ready relational schema for SaudiNA platform
-- Stack: Supabase-managed PostgreSQL + PostGIS

-- ============================================
-- 1. EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;

-- ============================================
-- 2. ENUM DEFINITIONS
-- ============================================

-- User lifecycle
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE');

-- External identity providers
CREATE TYPE identity_provider AS ENUM ('GOOGLE', 'ZOHO', 'INTERNAL');

-- Role codes (FK to roles lookup table)
CREATE TYPE role_code AS ENUM (
    'SUPER_ADMIN',
    'REGIONAL_MANAGER',
    'AREA_MANAGER',
    'COMMITTEE_MANAGER',
    'COMMITTEE_SECRETARY',
    'MEETING_EDITOR',
    'CONTENT_EDITOR'
);

-- Assignment scope granularity
CREATE TYPE scope_type AS ENUM ('GLOBAL', 'REGION', 'AREA', 'COMMITTEE');

-- Committee organizational level
CREATE TYPE committee_level AS ENUM ('REGIONAL', 'AREA');

-- Meeting communication language
CREATE TYPE meeting_language AS ENUM ('ARABIC', 'ENGLISH', 'BILINGUAL');

-- Meeting attendee gender restriction
CREATE TYPE meeting_gender AS ENUM ('MALE', 'FEMALE', 'MIXED');

-- Meeting delivery format
CREATE TYPE meeting_format AS ENUM ('ONLINE', 'IN_PERSON', 'HYBRID');

-- Recovery meeting lifecycle
CREATE TYPE recovery_meeting_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- In-Service meeting governance lifecycle
CREATE TYPE in_service_meeting_status AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- Contact submission workflow
CREATE TYPE contact_submission_status AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- Report classification
CREATE TYPE report_type AS ENUM (
    'MEETING_SUMMARY',
    'ACTIVITY_REPORT',
    'USER_ACTIVITY',
    'AUDIT_TRAIL_EXTRACT',
    'RESOURCE_USAGE'
);

-- Report generation & approval lifecycle
CREATE TYPE report_status AS ENUM (
    'DRAFT',
    'PENDING',
    'APPROVED',
    'GENERATING',
    'READY',
    'FAILED',
    'ARCHIVED'
);

-- Audit action taxonomy
CREATE TYPE audit_action AS ENUM (
    'CREATED',
    'UPDATED',
    'DELETED',
    'ARCHIVED',
    'STATUS_CHANGED',
    'SUBMITTED',
    'APPROVED',
    'REJECTED',
    'ACCESS_DENIED',
    'LOGIN',
    'LOGOUT',
    'CONTACT_SUBMITTED',
    'CONTACT_STATUS_CHANGED',
    'REPORT_RUN',
    'REPORT_APPROVED',
    'ASSIGNMENT_CREATED',
    'ASSIGNMENT_REVOKED',
    'CHATBOT_QUERY'
);

-- Chatbot interaction channel
CREATE TYPE chatbot_channel AS ENUM ('WEB', 'MOBILE', 'API');

-- ============================================
-- 3. IDENTITY & ACCESS
-- ============================================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    display_name    VARCHAR(255) NOT NULL,
    status          user_status NOT NULL DEFAULT 'ACTIVE',
    provider        identity_provider NOT NULL DEFAULT 'INTERNAL',
    external_subject VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at   TIMESTAMPTZ,

    CONSTRAINT chk_external_subject CHECK (
        (provider = 'INTERNAL' AND external_subject IS NULL) OR
        (provider != 'INTERNAL' AND external_subject IS NOT NULL)
    )
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_external_subject ON users (provider, external_subject)
    WHERE external_subject IS NOT NULL;

-- Roles lookup table (extensible, no hardcoded logic)
CREATE TABLE roles (
    code        role_code PRIMARY KEY,
    name_ar     VARCHAR(100) NOT NULL,
    name_en     VARCHAR(100) NOT NULL,
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User-to-role-to-scope assignments
CREATE TABLE user_assignments (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_code    role_code NOT NULL REFERENCES roles(code),
    scope_type   scope_type NOT NULL,
    scope_id     UUID,
    scope_code   VARCHAR(50),
    is_active    BOOLEAN NOT NULL DEFAULT true,
    active_from  TIMESTAMPTZ,
    active_until TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_scope_consistency CHECK (
        (scope_type = 'GLOBAL' AND scope_id IS NULL) OR
        (scope_type != 'GLOBAL' AND scope_id IS NOT NULL)
    ),
    CONSTRAINT chk_active_dates CHECK (
        active_from IS NULL OR active_until IS NULL OR active_until > active_from
    )
);

CREATE INDEX idx_assignments_user_active ON user_assignments (user_id, is_active);
CREATE INDEX idx_assignments_scope ON user_assignments (scope_type, scope_id);
CREATE INDEX idx_assignments_role ON user_assignments (role_code);

-- ============================================
-- 4. GEOGRAPHY
-- ============================================

CREATE TABLE regions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(20) NOT NULL UNIQUE,
    name_ar     VARCHAR(100) NOT NULL,
    name_en     VARCHAR(100) NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE areas (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id   UUID NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
    code        VARCHAR(20) NOT NULL UNIQUE,
    name_ar     VARCHAR(100) NOT NULL,
    name_en     VARCHAR(100) NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_areas_region_active ON areas (region_id, is_active);

-- ============================================
-- 5. COMMITTEES
-- ============================================

CREATE TABLE committees (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code           VARCHAR(50) NOT NULL UNIQUE,
    level          committee_level NOT NULL,
    region_id      UUID NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
    area_id        UUID REFERENCES areas(id) ON DELETE RESTRICT,
    name_ar        VARCHAR(200) NOT NULL,
    name_en        VARCHAR(200) NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    is_active      BOOLEAN NOT NULL DEFAULT true,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_committee_area CHECK (
        (level = 'REGIONAL' AND area_id IS NULL) OR
        (level = 'AREA' AND area_id IS NOT NULL)
    )
);

CREATE INDEX idx_committees_region_area_active ON committees (region_id, area_id, is_active);

-- Committee membership (manager/secretary assignments)
CREATE TABLE committee_memberships (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_in_committee VARCHAR(30) NOT NULL CHECK (role_in_committee IN ('MANAGER', 'SECRETARY')),
    assigned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at   TIMESTAMPTZ,
    is_active    BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT chk_one_manager_per_committee UNIQUE (committee_id, role_in_committee)
        DEFERRABLE INITIALLY IMMEDIATE
);

CREATE INDEX idx_committee_memberships_committee ON committee_memberships (committee_id, is_active);
CREATE INDEX idx_committee_memberships_user ON committee_memberships (user_id, is_active);

-- ============================================
-- 6. RECOVERY MEETINGS (PUBLIC)
-- ============================================

CREATE TABLE recovery_meetings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id       UUID NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
    area_id         UUID NOT NULL REFERENCES areas(id) ON DELETE RESTRICT,
    name_ar         VARCHAR(300) NOT NULL,
    name_en         VARCHAR(300) NOT NULL,
    description_ar  TEXT,
    description_en  TEXT,
    language        meeting_language NOT NULL,
    gender          meeting_gender NOT NULL,
    format          meeting_format NOT NULL DEFAULT 'IN_PERSON',
    city            VARCHAR(100) NOT NULL,
    district        VARCHAR(100),
    day_of_week     VARCHAR(10) NOT NULL CHECK (day_of_week IN (
        'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY',
        'FRIDAY', 'SATURDAY', 'SUNDAY'
    )),
    start_time      TIME NOT NULL,
    end_time        TIME,
    meeting_link    VARCHAR(500),
    latitude        NUMERIC(10, 8),
    longitude       NUMERIC(11, 8),
    location        geography(Point, 4326),
    address_ar      VARCHAR(500),
    address_en      VARCHAR(500),
    organizer_name  VARCHAR(200),
    organizer_phone VARCHAR(30),
    status          recovery_meeting_status NOT NULL DEFAULT 'DRAFT',
    created_by_id   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    is_deleted      BOOLEAN NOT NULL DEFAULT false,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_coords_present CHECK (
        (latitude IS NULL AND longitude IS NULL) OR
        (latitude IS NOT NULL AND longitude IS NOT NULL)
    ),
    CONSTRAINT chk_end_after_start CHECK (
        end_time IS NULL OR end_time > start_time
    )
);

-- Composite indexes for filtered public search
CREATE INDEX idx_recovery_status_area ON recovery_meetings (status, area_id) WHERE is_deleted = false;
CREATE INDEX idx_recovery_status_city ON recovery_meetings (status, city) WHERE is_deleted = false;
CREATE INDEX idx_recovery_status_day ON recovery_meetings (status, day_of_week) WHERE is_deleted = false;
CREATE INDEX idx_recovery_status_gender ON recovery_meetings (status, gender) WHERE is_deleted = false;
CREATE INDEX idx_recovery_status_format ON recovery_meetings (status, format) WHERE is_deleted = false;
CREATE INDEX idx_recovery_status_language ON recovery_meetings (status, language) WHERE is_deleted = false;

-- PostGIS spatial index for near-me and bounding-box queries
CREATE INDEX idx_recovery_location ON recovery_meetings USING GIST (location)
    WHERE location IS NOT NULL AND is_deleted = false;

-- Full-text search index
CREATE INDEX idx_recovery_search ON recovery_meetings
    USING GIN (
        to_tsvector('simple', name_ar || ' ' || COALESCE(description_ar, '') || ' ' ||
                     name_en || ' ' || COALESCE(description_en, '') || ' ' ||
                     COALESCE(city, '') || ' ' || COALESCE(district, ''))
    )
    WHERE is_deleted = false;

-- ============================================
-- 7. IN-SERVICE MEETINGS (INTERNAL, GOVERNED)
-- ============================================

CREATE TABLE in_service_meetings (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id         UUID NOT NULL REFERENCES committees(id) ON DELETE RESTRICT,
    title_ar             VARCHAR(300) NOT NULL,
    title_en             VARCHAR(300) NOT NULL,
    description          TEXT,
    meeting_date         DATE NOT NULL,
    start_time           TIME NOT NULL,
    end_time             TIME,
    mom                  TEXT NOT NULL,
    notes                TEXT,
    status               in_service_meeting_status NOT NULL DEFAULT 'DRAFT',
    created_by_id        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    approved_by_id       UUID REFERENCES users(id) ON DELETE RESTRICT,
    rejection_comments   TEXT,
    is_deleted           BOOLEAN NOT NULL DEFAULT false,
    deleted_at           TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_end_after_start CHECK (
        end_time IS NULL OR end_time > start_time
    ),
    CONSTRAINT chk_approval_fields CHECK (
        (status = 'APPROVED' AND approved_by_id IS NOT NULL) OR
        (status != 'APPROVED' AND approved_by_id IS NULL)
    ),
    CONSTRAINT chk_rejection_comments CHECK (
        (status = 'REJECTED' AND rejection_comments IS NOT NULL) OR
        (status != 'REJECTED')
    )
);

CREATE INDEX idx_inservice_committee_status ON in_service_meetings (committee_id, status) WHERE is_deleted = false;
CREATE INDEX idx_inservice_meeting_date ON in_service_meetings (meeting_date) WHERE is_deleted = false;
CREATE INDEX idx_inservice_created_by ON in_service_meetings (created_by_id) WHERE is_deleted = false;

-- Planned activities (normalized, not JSONB)
CREATE TABLE in_service_meeting_activities (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    in_service_meeting_id UUID NOT NULL REFERENCES in_service_meetings(id) ON DELETE CASCADE,
    description_ar      TEXT NOT NULL,
    description_en      TEXT NOT NULL,
    assigned_to         VARCHAR(200),
    target_date         DATE,
    priority            VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    is_completed        BOOLEAN NOT NULL DEFAULT false,
    sort_order          INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activities_meeting ON in_service_meeting_activities (in_service_meeting_id, sort_order);

-- Approval history (immutable governance trail)
CREATE TABLE in_service_meeting_approval_history (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    in_service_meeting_id UUID NOT NULL REFERENCES in_service_meetings(id) ON DELETE CASCADE,
    action              VARCHAR(20) NOT NULL CHECK (action IN ('SUBMITTED', 'APPROVED', 'REJECTED', 'RETURNED')),
    performed_by_id     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    comments            TEXT,
    previous_status     in_service_meeting_status NOT NULL,
    new_status          in_service_meeting_status NOT NULL,
    performed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_approval_history_meeting ON in_service_meeting_approval_history (in_service_meeting_id, performed_at DESC);

-- ============================================
-- 8. REPORTS
-- ============================================

CREATE TABLE reports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type                report_type NOT NULL,
    status              report_status NOT NULL DEFAULT 'DRAFT',
    approval_required   BOOLEAN NOT NULL DEFAULT false,
    filters             JSONB NOT NULL DEFAULT '{}',
    file_path           VARCHAR(500),
    file_name           VARCHAR(255),
    file_mime_type      VARCHAR(100),
    file_size_bytes     BIGINT,
    created_by_id       UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    approved_by_id      UUID REFERENCES users(id) ON DELETE RESTRICT,
    rejection_comments  TEXT,
    is_deleted          BOOLEAN NOT NULL DEFAULT false,
    deleted_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_approval_fields CHECK (
        (status = 'APPROVED' AND approved_by_id IS NOT NULL) OR
        (status != 'APPROVED')
    ),
    CONSTRAINT chk_file_ready CHECK (
        (status = 'READY' AND file_path IS NOT NULL) OR
        (status != 'READY')
    )
);

CREATE INDEX idx_reports_status_type ON reports (status, type) WHERE is_deleted = false;
CREATE INDEX idx_reports_created_by ON reports (created_by_id) WHERE is_deleted = false;

-- Async report job tracking
CREATE TABLE report_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id       UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    requested_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status          VARCHAR(20) NOT NULL DEFAULT 'QUEUED'
                    CHECK (status IN ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    error_message   TEXT,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_report_requests_status ON report_requests (status, created_at DESC);

-- ============================================
-- 9. RESOURCES
-- ============================================

CREATE TABLE resource_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(50) NOT NULL UNIQUE,
    name_ar     VARCHAR(100) NOT NULL,
    name_en     VARCHAR(100) NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE resources (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id     UUID NOT NULL REFERENCES resource_categories(id) ON DELETE RESTRICT,
    title_ar        VARCHAR(300) NOT NULL,
    title_en        VARCHAR(300) NOT NULL,
    description_ar  TEXT,
    description_en  TEXT,
    file_path       VARCHAR(500) NOT NULL,
    file_name       VARCHAR(255) NOT NULL,
    file_mime_type  VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    is_public       BOOLEAN NOT NULL DEFAULT true,
    download_count  INTEGER NOT NULL DEFAULT 0,
    is_deleted      BOOLEAN NOT NULL DEFAULT false,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_resources_category_public ON resources (category_id, is_public) WHERE is_deleted = false;
CREATE INDEX idx_resources_public ON resources (is_public) WHERE is_public = true AND is_deleted = false;

-- ============================================
-- 10. CONTACT SUBMISSIONS
-- ============================================

CREATE TABLE contact_submissions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    VARCHAR(200) NOT NULL,
    email                   VARCHAR(255) NOT NULL,
    phone                   VARCHAR(30),
    subject                 VARCHAR(300) NOT NULL,
    message                 TEXT NOT NULL,
    status                  contact_submission_status NOT NULL DEFAULT 'NEW',
    internal_notes          TEXT,
    assigned_committee_code VARCHAR(50),
    ip_address              VARCHAR(45),
    user_agent              VARCHAR(500),
    is_deleted              BOOLEAN NOT NULL DEFAULT false,
    deleted_at              TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_status_created ON contact_submissions (status, created_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_contact_committee ON contact_submissions (assigned_committee_code) WHERE assigned_committee_code IS NOT NULL AND is_deleted = false;

-- ============================================
-- 11. CHATBOT INTERACTION LOGS
-- ============================================

CREATE TABLE chatbot_interaction_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      VARCHAR(100) NOT NULL,
    channel         chatbot_channel NOT NULL DEFAULT 'WEB',
    user_message    TEXT NOT NULL,
    bot_response    TEXT NOT NULL,
    intent          VARCHAR(100),
    context_used    JSONB,
    locale          VARCHAR(5) NOT NULL DEFAULT 'en',
    ip_address      VARCHAR(45),
    response_time_ms INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chatbot_session ON chatbot_interaction_logs (session_id, created_at DESC);
CREATE INDEX idx_chatbot_created ON chatbot_interaction_logs (created_at DESC);
CREATE INDEX idx_chatbot_intent ON chatbot_interaction_logs (intent, created_at DESC);

-- ============================================
-- 12. AUDIT LOGS (IMMUTABLE)
-- ============================================

CREATE TABLE audit_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
    user_role_snapshot  VARCHAR(200),
    action              audit_action NOT NULL,
    resource_type       VARCHAR(50) NOT NULL,
    resource_id         UUID,
    http_method         VARCHAR(10),
    path                VARCHAR(500),
    ip_address          VARCHAR(45),
    correlation_id      VARCHAR(100),
    before_state        JSONB,
    after_state         JSONB,
    metadata            JSONB
);

CREATE INDEX idx_audit_timestamp_action ON audit_logs (timestamp DESC, action);
CREATE INDEX idx_audit_resource ON audit_logs (resource_type, resource_id);
CREATE INDEX idx_audit_user ON audit_logs (user_id, timestamp DESC);
CREATE INDEX idx_audit_correlation ON audit_logs (correlation_id) WHERE correlation_id IS NOT NULL;

-- IMMUTABILITY: Prevent any UPDATE or DELETE on audit_logs
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable. UPDATE and DELETE operations are not allowed.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_no_update
    BEFORE UPDATE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER trg_audit_no_delete
    BEFORE DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_modification();

-- ============================================
-- 13. UPDATED_AT TRIGGER (for tables without ORM hooks)
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER set_updated_at_users BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_assignments BEFORE UPDATE ON user_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_regions BEFORE UPDATE ON regions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_areas BEFORE UPDATE ON areas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_committees BEFORE UPDATE ON committees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_recovery BEFORE UPDATE ON recovery_meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_inservice BEFORE UPDATE ON in_service_meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_activities BEFORE UPDATE ON in_service_meeting_activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_reports BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_categories BEFORE UPDATE ON resource_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_resources BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_contact BEFORE UPDATE ON contact_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
