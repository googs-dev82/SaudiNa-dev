# Supabase Storage Hardening for SaudiNA

## Current storage model

SaudiNA does not expose raw Supabase Storage permissions directly to browser users.

The current flow is:

- backend uses `SUPABASE_SERVICE_ROLE_KEY`
- backend creates signed upload URLs
- backend creates signed private download URLs
- frontend uploads through signed URLs only

This is implemented in:

- [backend/src/modules/integrations/storage.service.ts](/Users/googs/Projects/SaudiNA/backend/src/modules/integrations/storage.service.ts)
- [backend/src/modules/resources/resources.service.ts](/Users/googs/Projects/SaudiNA/backend/src/modules/resources/resources.service.ts)
- [backend/src/modules/reports/reports.service.ts](/Users/googs/Projects/SaudiNA/backend/src/modules/reports/reports.service.ts)

## Security conclusion

Because the browser does not need direct bucket write privileges, the safest baseline is:

1. Keep `storage.objects` protected by default RLS
2. Do not add broad `anon` or `authenticated` write policies
3. Use:
   - a public bucket for intentionally public resource files
   - a private bucket for report exports and private objects
4. Let the backend mint signed URLs with the service-role key

## Buckets expected by the current code

The backend expects:

- `public-assets`
- `private-assets`

These bucket names are read from:

- `SUPABASE_STORAGE_PUBLIC_BUCKET`
- `SUPABASE_STORAGE_PRIVATE_BUCKET`

## Prepared migration

- [backend/prisma/migrations/20260408_storage_bucket_baseline/migration.sql](/Users/googs/Projects/SaudiNA/backend/prisma/migrations/20260408_storage_bucket_baseline/migration.sql)

This migration:

- creates or updates `public-assets`
- creates or updates `private-assets`
- sets the public/private posture explicitly
- adds conservative file size and mime type limits

## Impact on the current project

### Public resources

Public resource files can be served from the public bucket after upload.

### Private reports

Private report artifacts can stay in `private-assets` and continue to be served by backend-generated signed URLs.

### Frontend and backend code

No application code changes are required for this baseline. The storage integration already matches this model.

## Follow-up recommendations

- Review whether the current mime type allowlists are sufficient for your real content types
- Consider a retention/cleanup policy for generated report exports
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only
