# SaudiNA Backend

NestJS backend for SaudiNA-Renovation.

## Stack

- NestJS 11
- TypeScript strict mode
- Prisma 7
- PostgreSQL / Supabase-managed Postgres
- PostGIS

## Architecture

- NestJS is the authoritative business-logic layer.
- Supabase is infrastructure only: PostgreSQL and Storage.
- Workflow, governance, RBAC, scope filtering, and audit all live in the application layer.

## Modules

- `auth`
- `users`
- `assignments`
- `regions`
- `areas`
- `committees`
- `meetings`
- `reports`
- `resources`
- `resource-categories`
- `contact`
- `chatbot`
- `audit`
- `health`
- `integrations`

## Setup

```bash
npm install
cp .env.example .env
```

Required environment values for normal operation:

- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `FRONTEND_URL`

Optional integrations:

- `GOOGLE_USERINFO_URL`
- `ZOHO_USERINFO_URL`
- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_API_VERSION`
- `SANITY_READ_TOKEN`
- `RESEND_API_KEY`
- `SUPPORT_EMAIL_TO`
- `SUPPORT_EMAIL_FROM`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_PUBLIC_BUCKET`
- `SUPABASE_STORAGE_PRIVATE_BUCKET`

## Prisma Workflow

Generate client:

```bash
npm run prisma:generate
```

Initial migration artifact lives at:

```text
prisma/migrations/20260405_init/migration.sql
```

Seed baseline data:

```bash
npm run db:seed
```

Seed creates:

- initial super admin user
- global super-admin assignment
- sample Riyadh region
- sample North Riyadh area
- `PR_COMMITTEE`
- `guidelines` resource category

## Run

```bash
npm run start:dev
```

API base path:

```text
/api/v1
```

Health endpoints:

- `GET /api/v1/health`
- `GET /api/v1/health/readiness`

## Auth Endpoints

Generic token exchange:

- `POST /api/v1/auth/token`

Provider-specific token exchange:

- `POST /api/v1/auth/google/token`
- `POST /api/v1/auth/zoho/token`

Provider-specific callback-style entrypoints:

- `GET /api/v1/auth/google/callback`
- `GET /api/v1/auth/zoho/callback`

In development, trusted email/display name fallback can be enabled with:

- `AUTH_TRUST_CLAIMS_IN_DEV=true`

## Storage-backed Flows

Resource upload init:

- `POST /api/v1/admin/resources/upload-init`

Public resource download URL:

- `GET /api/v1/public/resources/:id/download`

Report download URL:

- `GET /api/v1/admin/reports/:id/download`

Storage behavior:

- public resources resolve to public bucket URLs
- private report exports resolve to signed URLs
- when storage env vars are missing, logical paths are returned for local/dev workflows

## Tests

Unit and integration:

```bash
npm test -- --runInBand
```

Critical e2e:

```bash
npm run test:e2e -- --runInBand
```

Lint:

```bash
npm run lint
```

Build:

```bash
npm run build
```

## Notes

- Audit logs are immutable by DB trigger in the migration artifact.
- Public search is rate-limited.
- Contact access is limited to Super Admin and active `PR_COMMITTEE` assignments.
- In-service meeting and selected report workflows enforce maker-checker rules.
