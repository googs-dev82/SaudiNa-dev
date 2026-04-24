# SaudiNA

SaudiNA-Renovation is a bilingual public recovery platform plus a secured internal operations portal.

## Architecture

- `frontend/`: Next.js application for the public site, secured portal, and embedded Sanity Studio
- `backend/`: NestJS API for auth, RBAC/scope enforcement, workflows, audit logging, chatbot routing, and integrations
- `backend/prisma/`: Prisma schema and seed logic for the operational data model
- `frontend/src/sanity/`: CMS schema and Sanity integration for editorial content only

## Core Boundaries

- Sanity is for editorial content only
- Operational data and governance remain in the backend
- Public content and meeting discovery go through `/api/v1/public/*`
- Protected operations go through `/api/v1/*` with JWT + role/scope checks

## Local Setup

1. Install dependencies in both apps:
   - `cd /Users/googs/Projects/SaudiNA/frontend && npm install`
   - `cd /Users/googs/Projects/SaudiNA/backend && npm install`
2. Configure environment files:
   - frontend requires `NEXT_PUBLIC_API_BASE_URL` and Sanity vars
   - backend requires `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `BACKEND_URL`, `FRONTEND_URL`
3. Seed the backend database:
   - `cd /Users/googs/Projects/SaudiNA/backend && npm run db:seed`
4. Start the apps:
   - `cd /Users/googs/Projects/SaudiNA/backend && npm run start:dev`
   - `cd /Users/googs/Projects/SaudiNA/frontend && npm run dev`

## Testing

- Frontend:
  - `npm run test`
  - `npm run test:cov`
  - `npm run test:e2e`
- Backend:
  - `npm test`
  - `npm run test:cov`
  - `npm run test:e2e`

## Important Notes

- `/studio` is protected and intended only for `CONTENT_EDITOR` and `SUPER_ADMIN`
- Contact submission access is granted to `SUPER_ADMIN` and active `PR Committee` assignments
- Missing API configuration should fail explicitly for operational frontend data, not silently fall back to mocks
