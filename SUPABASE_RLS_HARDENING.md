# Supabase RLS Hardening for SaudiNA

## Why this matters

SaudiNA stores operational data in the `public` schema of Supabase-managed PostgreSQL. In Supabase, tables in exposed schemas can be reachable through the Data API. If Row Level Security is not enabled, those tables may be accessible to `anon` or `authenticated` roles depending on grants.

For SaudiNA, this is a hardening concern because the intended architecture is:

- browser -> Next.js / NestJS APIs
- NestJS backend -> PostgreSQL through Prisma
- not browser -> Supabase Data API for operational tables

That architecture is already stated in:

- [TARGET_ARCHITECTURE.md](/Users/googs/Projects/SaudiNA/TARGET_ARCHITECTURE.md)

## Correct solution for this project

The correct fix is **not** to add generic `auth.uid()` policies on operational tables.

Why:

- SaudiNA does not use Supabase Auth as the application authorization system
- The internal portal uses backend-issued JWTs and backend-enforced RBAC/scope
- The `public.users` table is an operational app table, not a direct mirror of `auth.users`

So the right immediate hardening is:

1. Enable RLS on all operational tables in `public`
2. Revoke `anon` and `authenticated` access from those tables
3. Keep NestJS + Prisma as the only access path

## Tables covered

The migration covers:

- `public.users`
- `public.assignments`
- `public.regions`
- `public.areas`
- `public.committees`
- `public.recovery_meetings`
- `public.in_service_meetings`
- `public.reports`
- `public.resource_categories`
- `public.resources`
- `public.contact_submissions`
- `public.audit_logs`

## Migration

Prepared migration:

- [backend/prisma/migrations/20260408_enable_rls_on_public_tables/migration.sql](/Users/googs/Projects/SaudiNA/backend/prisma/migrations/20260408_enable_rls_on_public_tables/migration.sql)

## Expected impact on current code

### Frontend

No expected runtime impact.

The frontend does not query operational Supabase tables directly. It calls backend APIs for:

- meetings
- regions/areas
- contact
- reports
- portal operations

### Backend

Low expected impact.

The backend uses direct Postgres access through Prisma rather than the Supabase Data API. Enabling RLS plus revoking `anon` and `authenticated` table access should not break Prisma-based backend flows.

### Storage

No direct impact.

This hardening affects Postgres tables only. Supabase Storage policies are separate and should be reviewed independently.

## What this does not do

- It does not add `auth.uid()` policies
- It does not expose any operational table safely to browser clients
- It does not use `FORCE ROW LEVEL SECURITY`

Those are intentional choices for the current SaudiNA architecture.

## If the architecture changes later

If SaudiNA later decides to use Supabase Data API directly from the browser for selected resources, then those specific tables or views should get carefully scoped policies and should be treated as a separate design exercise.

For example:

- public meeting discovery might later move to a secure read-only view
- public resources might later use a secure read-only view

That should happen only with explicit policy design, not by leaving base operational tables exposed.
