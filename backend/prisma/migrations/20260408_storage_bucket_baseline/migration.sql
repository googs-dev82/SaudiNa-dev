-- SaudiNA Supabase Storage Baseline
-- Purpose:
--   1. Provision the storage buckets expected by the backend integration.
--   2. Keep access aligned with the current backend-signed URL model.
-- Notes:
--   - storage.objects and storage.buckets already have RLS enabled by Supabase.
--   - We intentionally do not add anon/authenticated write policies here.
--   - Public asset reads are handled by the bucket public flag.
--   - Private asset access stays behind backend-generated signed URLs.

BEGIN;

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES
  (
    'public-assets',
    'public-assets',
    true,
    52428800,
    ARRAY[
      'application/pdf',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]::text[]
  ),
  (
    'private-assets',
    'private-assets',
    false,
    104857600,
    ARRAY[
      'application/pdf',
      'text/csv',
      'application/zip',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]::text[]
  )
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

COMMIT;
