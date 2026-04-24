-- SaudiNA Supabase RLS Hardening
-- Purpose:
--   1. Enable RLS on every operational table in the exposed public schema.
--   2. Explicitly revoke anon/authenticated table privileges because SaudiNA
--      uses NestJS + Prisma as the canonical application API.
-- Important:
--   - This migration intentionally does NOT add auth.uid()-based policies.
--   - This migration intentionally does NOT use FORCE ROW LEVEL SECURITY.
--   - Browser/Data API access to these operational tables is not part of the
--     current SaudiNA architecture and should remain blocked.

BEGIN;

-- Enable RLS on all operational tables exposed through the public schema.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.in_service_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Defense in depth: revoke Data API roles from operational tables.
-- The backend uses direct Postgres access via Prisma, so this should not
-- affect the current application flow.
REVOKE ALL ON TABLE public.users FROM anon, authenticated;
REVOKE ALL ON TABLE public.assignments FROM anon, authenticated;
REVOKE ALL ON TABLE public.regions FROM anon, authenticated;
REVOKE ALL ON TABLE public.areas FROM anon, authenticated;
REVOKE ALL ON TABLE public.committees FROM anon, authenticated;
REVOKE ALL ON TABLE public.recovery_meetings FROM anon, authenticated;
REVOKE ALL ON TABLE public.in_service_meetings FROM anon, authenticated;
REVOKE ALL ON TABLE public.reports FROM anon, authenticated;
REVOKE ALL ON TABLE public.resource_categories FROM anon, authenticated;
REVOKE ALL ON TABLE public.resources FROM anon, authenticated;
REVOKE ALL ON TABLE public.contact_submissions FROM anon, authenticated;
REVOKE ALL ON TABLE public.audit_logs FROM anon, authenticated;

COMMIT;
