# SaudiNA Database Schema Design

## Overview

This document captures the complete database design decisions for the SaudiNA operational database.

## Stack

- **Platform:** Supabase-managed PostgreSQL
- **Geospatial:** PostGIS extension
- **ORM:** Prisma 7.x (pg adapter)
- **Rule:** Supabase is infrastructure only — no business logic in DB

## Design Principles

1. UUIDs for all primary keys
2. snake_case naming throughout
3. Enums for status/role/type fields (type safety at DB level)
4. Roles lookup table for extensibility
5. Normalized tables — JSONB only where appropriate (filters, context, audit state)
6. Soft delete on operational tables (`is_deleted` + `deleted_at`)
7. Audit logs are immutable (database-level triggers)
8. Partial indexes for performance (`WHERE is_deleted = false`)
9. PostGIS geography for accurate distance calculations
10. GIN full-text index for meeting search

## Schema Files

| File | Purpose |
|------|---------|
| `migration.sql` | Full DDL — enums, tables, constraints, indexes, triggers |
| `seed_data.sql` | Realistic sample data for all tables |

## Tables (17 total)

### Identity & Access
- `users` — User accounts with external identity provider support
- `roles` — Lookup table for role definitions (extensible)
- `user_assignments` — User-to-role-to-scope mappings with temporal validity

### Geography
- `regions` — Top-level geographic divisions
- `areas` — Sub-regions nested under regions

### Committees
- `committees` — Organizational units (regional or area-level)
- `committee_memberships` — Manager/secretary assignments to committees

### Meetings
- `recovery_meetings` — Public meetings with PostGIS location data
- `in_service_meetings` — Internal governed meetings with approval workflow
- `in_service_meeting_activities` — Normalized activity/action items
- `in_service_meeting_approval_history` — Immutable governance trail

### Reports
- `reports` — Report definitions, status, and file metadata
- `report_requests` — Async job tracking for report generation

### Resources
- `resource_categories` — Categorization for downloadable resources
- `resources` — File metadata (actual files in Supabase Storage)

### Contact
- `contact_submissions` — Public contact form entries

### Chatbot
- `chatbot_interaction_logs` — All bot interactions with intent tracking

### Audit
- `audit_logs` — Immutable audit trail (database-level protection)

## Key Indexes

| Index Type | Target | Purpose |
|------------|--------|---------|
| GIST (spatial) | `recovery_meetings.location` | Near-me and bounding-box queries |
| GIN (full-text) | `recovery_meetings` name/description/city | Text search across AR+EN |
| Composite partial | `recovery_meetings(status, area_id)` WHERE not deleted | Filtered public search |
| Composite partial | `recovery_meetings(status, city)` WHERE not deleted | City-based filtering |
| Composite partial | `in_service_meetings(committee_id, status)` WHERE not deleted | Committee workflow queries |
| B-tree | `user_assignments(user_id, is_active)` | Role resolution on auth |
| B-tree | `audit_logs(timestamp DESC, action)` | Audit log browsing |

## Constraints

| Constraint | Table | Purpose |
|------------|-------|---------|
| `chk_external_subject` | users | Provider/subject consistency |
| `chk_scope_consistency` | user_assignments | Global scope has no scope_id |
| `chk_active_dates` | user_assignments | active_until > active_from |
| `chk_committee_area` | committees | Regional committees have no area_id |
| `chk_coords_present` | recovery_meetings | Lat/lng both present or both null |
| `chk_end_after_start` | recovery/in_service meetings | Time validation |
| `chk_approval_fields` | in_service_meetings, reports | Approved status requires approver |
| `chk_rejection_comments` | in_service_meetings | Rejected status requires comments |
| `chk_file_ready` | reports | Ready status requires file_path |
| `chk_one_manager_per_committee` | committee_memberships | One manager per committee |
| Audit triggers | audit_logs | Prevent UPDATE/DELETE |

## Soft Delete Strategy

All operational tables include:
- `is_deleted BOOLEAN NOT NULL DEFAULT false`
- `deleted_at TIMESTAMPTZ`

Normal queries filter `WHERE is_deleted = false`. Audit logs reference soft-deleted records by ID — referential integrity preserved.

## Migration History

| Migration | Date | Description |
|-----------|------|-------------|
| `20260405_init` | 2026-04-05 | Initial Prisma schema |
| `20260405_operational_schema` | 2026-04-05 | Full production schema with PostGIS, audit, governance |
