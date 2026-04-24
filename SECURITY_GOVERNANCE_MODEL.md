# SaudiNA Security And Governance Model

## Purpose

This document defines the security and governance model for SaudiNA-Renovation and maps it to the backend enforcement layer.

The core rule is simple:

- governance logic must live in backend services
- frontend may improve UX, but must not become the source of authorization truth

## Security Model

### Authentication

- Protected endpoints require bearer JWT authentication
- JWT validation is enforced globally by `JwtAuthGuard`
- Public endpoints are explicitly marked with `@Public()`
- OAuth provider exchange is limited to Google and Zoho
- Production deployments must not use default JWT secrets

### Authorization

Authorization is layered:

1. Role-based access control through `@Roles(...)`
2. Scope-based access checks in backend services
3. Maker-checker restrictions in backend services

Global controller-level rules:

- public endpoints are only those explicitly marked public
- all other endpoints require authentication by default

### Scope-Based Access

Assignments define the user’s effective scope:

- `GLOBAL`
- `REGION`
- `AREA`
- `COMMITTEE`

Scope checks are enforced through `AuthorizationService` and must remain in backend services for operational workflows.

Examples:

- recovery meeting management is scoped to `AREA`
- in-service meeting workflows are scoped to `COMMITTEE`
- contact submission access is scoped to PR committee assignment or `SUPER_ADMIN`

### Maker-Checker Governance

Maker-checker is enforced in backend services and cannot be bypassed by frontend clients.

Rules:

- creators cannot approve their own records unless explicitly allowed by `SUPER_ADMIN`
- applies to in-service approvals
- applies to report approvals

### Audit Logging

Audit logging is required for privileged and governance-relevant actions.

Current required audit categories:

- login events
- recovery meeting create/update/status changes
- in-service meeting create/update/submit/approve/reject
- report create/submit/approve/run
- contact submission create/view/update
- public chatbot queries at metadata level

Audit logs should capture:

- action
- resource type
- resource id when available
- user id when available
- user role snapshot when available
- correlation id
- IP address where relevant
- before and after state for administrative mutations
- metadata only for public chatbot and contact access patterns

Audit logs should not store unnecessary sensitive freeform content.

## Governance Model

### Role Model

Core roles:

- `SUPER_ADMIN`
- `REGIONAL_MANAGER`
- `AREA_MANAGER`
- `COMMITTEE_MANAGER`
- `COMMITTEE_SECRETARY`
- `MEETING_EDITOR`
- `CONTENT_EDITOR`

### Public Vs Protected Endpoint Rules

Public endpoints are limited to low-risk, rate-limited, validated capabilities:

- health
- public meetings search/map/nearby
- public contact submission
- public chatbot query
- auth token exchange and OAuth callbacks
- public region and area lookup where applicable

Protected endpoints include:

- all administrative CRUD
- meetings management workflows
- reports workflows
- resources administration
- users and assignments
- audit logs

### Secure Public Endpoint Principles

Public endpoints must:

- be explicitly marked `@Public()`
- be DTO-validated
- be rate-limited
- avoid direct exposure of privileged internals
- avoid bypassing workflow logic
- log meaningful metadata when the interaction is governance-relevant

### Contact And Chatbot Handling

Contact:

- validated input
- strict rate limit
- PR committee routing remains backend-owned
- create and update actions are audited

Chatbot:

- validated input
- strict rate limit
- content answers come only from CMS-backed content through backend services
- meeting answers come only from backend meeting services
- chatbot query metadata is audited without storing unnecessary sensitive text

## Configuration And Secrets

Secrets and critical config must be environment-driven:

- `JWT_SECRET`
- OAuth client secrets
- database connection strings
- read/write tokens for third-party integrations

Principles:

- no secrets in frontend bundles
- no default insecure secrets in production
- public read-only configuration must be clearly separated from server secrets
- secret-bearing integrations stay server-side only

## Key Control Points

1. `JwtAuthGuard`
2. `RolesGuard`
3. `RateLimitGuard`
4. `ValidationPipe`
5. `AuthorizationService`
6. service-layer maker-checker enforcement
7. `AuditService`
8. request correlation via `RequestContextInterceptor`

## Enforced Implementation Notes

This implementation pass enforces:

- production-safe JWT secret validation
- public chatbot audit logging
- stricter length validation for chatbot and contact payloads

## Security Review Checklist

- Are endpoints public only when explicitly intended?
- Is scope enforced in backend service logic?
- Is maker-checker applied on approval paths?
- Are sensitive actions audited?
- Are public endpoints rate-limited and validated?
- Are secrets environment-driven and safe for production?
