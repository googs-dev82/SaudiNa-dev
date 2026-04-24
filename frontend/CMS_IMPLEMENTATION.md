# SaudiNA CMS Implementation Notes

## Boundary

Sanity is used for editorial content only.

Do not store these operational concerns in Sanity:

- meetings or meeting lifecycle state
- internal governance workflows
- reports and approvals
- assignments, roles, or scoped authorization
- audit or contact operational records

Resource files remain backend-owned. Sanity may store editorial metadata for public presentation.

## Access Control

Sanity content changes must be limited to SaudiNA users with one of these roles:

- `SUPER_ADMIN`
- `CONTENT_EDITOR`

Recommended access model:

1. User signs into the SaudiNA secured area.
2. Application route guard allows Studio entry only for `SUPER_ADMIN` or `CONTENT_EDITOR`.
3. Sanity project permissions also allow write access only for approved editorial identities.

Important rules:

- Do not rely on route protection alone. Sanity-side write permissions must also be restricted.
- Studio should be treated as a secured editorial workspace, ideally mounted behind the portal experience such as `/portal/studio`, or otherwise protected at `/studio`.
- All other SaudiNA roles must be denied Studio access.
- `CONTENT_EDITOR` and `SUPER_ADMIN` may manage editorial document types only, not operational data.

Editorial scope for Studio:

- site settings
- navigation and footer
- home/about/literature/generic pages
- hero, rich text, media, CTA, and SEO blocks
- articles
- FAQs
- resource editorial metadata

## Document types

- `siteSettings`: singleton for navigation, footer, branding copy
- `page`: structured page-builder content for home, about, literature, and generic pages
- `article`: editorial cards and long-form public content
- `faq`: chatbot/content-answer knowledge
- `resourceContent`: editorial overlay for backend-managed resources

## Publishing flow

1. Editors update documents in Sanity Studio.
2. Sanity webhook posts the changed document payload to `/api/revalidate`.
3. Next.js revalidates affected public routes.

Required env var:

- `SANITY_REVALIDATE_SECRET`

Recommended webhook payload fields:

- `_type`
- `slug.current`

Recommended webhook header:

- `x-sanity-webhook-secret: <SANITY_REVALIDATE_SECRET>`

## Seed content

Seed definitions live in `src/sanity/seed-content.ts`.

Export NDJSON for import into Sanity:

```bash
npm run cms:seed:export
```

This writes `sanity-seed/seed.ndjson`, which can be imported into the target dataset.

## Studio guidance

The Studio desk groups content by editorial job:

- Site Settings
- Core Pages
- Articles
- FAQs
- Resource Editorial Content

This helps keep editors in content lanes and discourages operational misuse.
